import os

os.environ["TOKENIZERS_PARALLELISM"] = "false"

from celery import Celery
from celery.exceptions import InvalidTaskError
import torch
import torch.nn as nn
from dotenv import load_dotenv
from evolutiontransformer.redis import (
    add_model_to_session,
    get_session_models,
    save_model_recipe,
    get_model_recipe,
    delete_session,
)


from transformers import AutoConfig, AutoTokenizer, AutoModelForCausalLM
from typing import List, Tuple
from tqdm import tqdm

load_dotenv()

BASE_MODELS_NAMES = ["svamp", "tinystories"]
BASE_MODELS = {}
TOKENIZER = None
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("tasks", broker=REDIS_URL, backend=REDIS_URL)


def load_base_models_if_needed():
    global BASE_MODELS
    if not BASE_MODELS:
        print("WORKER: Loading base models into memory...")
        for model_name in BASE_MODELS_NAMES:
            model_path = f"tcmmichaelb139/gpt2-medium-{model_name}"
            model = AutoModelForCausalLM.from_pretrained(model_path)
            BASE_MODELS[model_name] = model.to(DEVICE)

            if get_model_recipe("default", model_name) is None:
                add_model_to_session("default", model_name)
                save_model_recipe(
                    "default",
                    model_name,
                    {
                        "layer_recipe": [[(i, model_name, 1.0)] for i in range(24)],
                        "embedding_lambdas": [1.0, 1.0],
                        "linear_lambdas": [1.0, 1.0],
                    },
                )

        print("WORKER: Base models loaded.")


def get_tokenizer():
    global TOKENIZER
    if TOKENIZER is None:
        print("WORKER: Initializing Tokenizer...")
        TOKENIZER = AutoTokenizer.from_pretrained("gpt2-medium")
    return TOKENIZER


def inference(model, prompt, max_new_tokens=512, temperature=0.7):
    global DEVICE

    do_sample = temperature > 0
    model = model.to(DEVICE)
    model.eval()
    tokenizer = get_tokenizer()
    inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=do_sample,
            temperature=temperature,
        ).to(DEVICE)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)


def merge_model_recipe(
    model1_recipe: dict,
    model2_recipe: dict,
    layer_recipe: List[List[Tuple[int, int, float]]],
    embedding_lambdas: List[float] = [0.5, 0.5],
    linear_lambdas: List[float] = [0.5, 0.5],
) -> dict:
    models = [model1_recipe, model2_recipe]
    result_layer_recipe = []
    for makeup in layer_recipe:
        layer_result = {}
        for comb in makeup:
            idx, model_i, alpha = comb

            for orig_i, orig_model, orig_a in models[model_i]["layer_recipe"][idx]:
                if (orig_i, orig_model) in layer_result:
                    layer_result[(orig_i, orig_model)] += alpha * orig_a
                else:
                    layer_result[(orig_i, orig_model)] = alpha * orig_a

        final_layer_result = []
        for k in layer_result:
            final_layer_result.append((k[0], k[1], layer_result[k]))

        result_layer_recipe.append(final_layer_result)

    result_embedding_lambdas = [
        embedding_lambdas[0] * model1_recipe["embedding_lambdas"][0]
        + (1 - embedding_lambdas[0]) * model2_recipe["embedding_lambdas"][0],
        embedding_lambdas[1] * model1_recipe["embedding_lambdas"][1]
        + (1 - embedding_lambdas[1]) * model2_recipe["embedding_lambdas"][1],
    ]
    result_linear_lambdas = [
        linear_lambdas[0] * model1_recipe["linear_lambdas"][0]
        + (1 - linear_lambdas[0]) * model2_recipe["linear_lambdas"][0],
        linear_lambdas[1] * model1_recipe["linear_lambdas"][1]
        + (1 - linear_lambdas[1]) * model2_recipe["linear_lambdas"][1],
    ]

    return {
        "layer_recipe": result_layer_recipe,
        "embedding_lambdas": result_embedding_lambdas,
        "linear_lambdas": result_linear_lambdas,
    }


def merge_models(
    model_recipe: dict,
    base_model="gpt2-medium",
) -> nn.Module:
    """Merge two models based on a given recipe."""

    model1_name = "svamp"
    model2_name = "tinystories"

    load_base_models_if_needed()

    def get_model_layer(layer, model):
        return model.transformer.h[layer].state_dict()

    def merge_layer(recipe: List[Tuple[int, str, float]]):
        base = get_model_layer(recipe[0][0], BASE_MODELS[recipe[0][1]])
        for key in base.keys():
            base[key] = recipe[0][2] * base[key]
        for layer in recipe[1:]:
            layer_data = get_model_layer(layer[0], BASE_MODELS[layer[1]])
            for key in base.keys():
                base[key] += layer[2] * layer_data[key]
        return base

    print("### Merging models... ###")

    layer_recipe = model_recipe["layer_recipe"]
    embedding_lambdas = model_recipe["embedding_lambdas"]
    linear_lambdas = model_recipe["linear_lambdas"]

    config = AutoConfig.from_pretrained(base_model)
    config.n_layer = len(layer_recipe)

    child_model = AutoModelForCausalLM.from_config(config).to(DEVICE)
    child_model.eval()

    print("Merging embeddings and lm_head...")
    child_model.transformer.wte.weight.data = (
        embedding_lambdas[0] * BASE_MODELS[model1_name].transformer.wte.weight.data
        + (1 - embedding_lambdas[0])
        * BASE_MODELS[model2_name].transformer.wte.weight.data
    )
    child_model.transformer.wpe.weight.data = (
        embedding_lambdas[1] * BASE_MODELS[model1_name].transformer.wpe.weight.data
        + (1 - embedding_lambdas[1])
        * BASE_MODELS[model2_name].transformer.wpe.weight.data
    )
    child_model.lm_head.weight.data = (
        linear_lambdas[0] * BASE_MODELS[model1_name].lm_head.weight.data
        + (1 - linear_lambdas[0]) * BASE_MODELS[model2_name].lm_head.weight.data
    )
    child_model.transformer.ln_f.weight.data = (
        linear_lambdas[1] * BASE_MODELS[model1_name].transformer.ln_f.weight.data
        + (1 - linear_lambdas[1])
        * BASE_MODELS[model2_name].transformer.ln_f.weight.data
    )
    child_model.transformer.ln_f.bias.data = (
        linear_lambdas[1] * BASE_MODELS[model1_name].transformer.ln_f.bias.data
        + (1 - linear_lambdas[1]) * BASE_MODELS[model2_name].transformer.ln_f.bias.data
    )

    for i, layer in tqdm(enumerate(layer_recipe), desc="Merging layers..."):
        merged_layer = merge_layer(layer)
        child_model.transformer.h[i].load_state_dict(merged_layer)

    return child_model


def get_model_recipe_default(session_id: str, model_name: str) -> dict:
    if model_name in BASE_MODELS_NAMES:
        return get_model_recipe("default", model_name)
    return get_model_recipe(session_id, model_name)


@celery_app.task(name="tasks.inference")
def inference_task(
    session_id: str, model_name, prompt, max_new_tokens=512, temperature=0.7
):
    try:
        model_recipe = get_model_recipe_default(session_id, model_name)
        print("WORKER: Creating merged model...")
        model = merge_models(model_recipe)
        print("WORKER: Model loaded.")
        output = inference(model, prompt, max_new_tokens, temperature)
        return {"response": output}
    except Exception as e:
        raise InvalidTaskError(f"Inference failed: {e}")


@celery_app.task(name="tasks.merge_models")
def merge_models_task(
    session_id: str,
    model1_name: str,
    model2_name: str,
    layer_recipe: List[List[Tuple[int, int, float]]],
    embedding_lambdas: List[float] = [0.5, 0.5],
    linear_lambdas: List[float] = [0.5, 0.5],
    merged_name: str = "merged",
):
    if len(layer_recipe) > 48:
        raise InvalidTaskError("Layer recipe too long. Max 48 layers supported.")

    session_models = get_session_models(session_id)

    model1_recipe = get_model_recipe_default(session_id, model1_name)
    model2_recipe = get_model_recipe_default(session_id, model2_name)
    if model1_recipe is None or model2_recipe is None:
        raise InvalidTaskError("One of the models does not exist.")

    merged_recipe = merge_model_recipe(
        model1_recipe,
        model2_recipe,
        layer_recipe,
        embedding_lambdas,
        linear_lambdas,
    )

    for i in range(20):
        full_merged_name = f"{merged_name}_{i}"
        if full_merged_name not in session_models:
            add_model_to_session(session_id, full_merged_name)
            save_model_recipe(session_id, full_merged_name, merged_recipe)
            return {"response": full_merged_name}

    raise InvalidTaskError("Could not find a unique model name.")


@celery_app.task(name="tasks.get_all_models")
def get_all_models_task(session_id: str) -> List[str]:
    base_models = BASE_MODELS_NAMES
    session_models = get_session_models(session_id)
    all_models = list(set(base_models + session_models))
    return {"response": all_models}


@celery_app.task(name="tasks.clear_session_models")
def clear_session_models_task(session_id: str) -> str:
    delete_session(session_id)
    return {"response": ""}
