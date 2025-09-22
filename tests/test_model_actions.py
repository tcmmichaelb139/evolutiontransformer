import torch
from transformers import AutoModelForCausalLM
import re


from evolutiontransformer.worker import (
    load_base_models_if_needed,
    BASE_MODELS,
    inference,
    inference_task,
    merge_models,
)


def get_final_answer(text: str) -> int | None:
    numbers = re.findall(r"\d+", text)
    return int(numbers[-1]) if numbers else None


def test_inference():
    session_id = "test_session"

    print("### Testing inference on SVAMP model...")
    prompt = "If there are 3 cars and 2 bikes, how many vehicles are there in total?\nAnswer:"
    output = inference_task(session_id, "svamp", prompt)
    assert get_final_answer(output["response"]) == 5


def test_merge_models():
    load_base_models_if_needed()

    model_recipe = {
        "layer_recipe": [[(i, "svamp", 1.0)] for i in range(24)],
        "embedding_lambdas": [1.0, 1.0],
        "linear_lambdas": [1.0, 1.0],
    }

    merged_model = merge_models(model_recipe)

    for (name1, param1), (name2, param2) in zip(
        BASE_MODELS["svamp"].named_parameters(), merged_model.named_parameters()
    ):
        assert torch.allclose(param1, param2)


def test_merge_models_with_inference1():
    load_base_models_if_needed()

    model_recipe = {
        "layer_recipe": [
            [(i % 24, "svamp", 1.0 if i < 24 else 0.5)] for i in range(48)
        ],
        "embedding_lambdas": [1.0, 1.0],
        "linear_lambdas": [1.0, 1.0],
    }

    merged_model = merge_models(model_recipe)

    print(
        inference(
            merged_model,
            "A spider has 8 legs. A fly has 6 legs. How many legs do they have in total?\nAnswer:",
        )
    )


def test_merge_models_with_inference2():
    load_base_models_if_needed()

    model_recipe = {
        "layer_recipe": [[(i, "tinystories", 1.0)] for i in range(24)],
        "embedding_lambdas": [0.0, 0.0],
        "linear_lambdas": [0.0, 0.0],
    }

    merged_model = merge_models(model_recipe)

    print(
        inference(
            merged_model,
            "A spider has 8 legs. A fly has 6 legs. How many legs do they have in total?\nAnswer:",
        )
    )
