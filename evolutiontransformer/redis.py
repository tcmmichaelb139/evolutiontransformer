import os
from redis import Redis
import json


REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = Redis.from_url(REDIS_URL, decode_responses=True)


def add_model_to_session(session_id: str, model_name: str, ttl_seconds: int = 3600):
    session_key = f"session:{session_id}:models"

    existing_models = get_session_models(session_id)

    if model_name not in existing_models:
        existing_models.append(model_name)

    models_json = json.dumps(existing_models)
    redis_client.setex(session_key, ttl_seconds, models_json)


def get_session_models(session_id: str):
    session_key = f"session:{session_id}:models"
    models_json = redis_client.get(session_key)
    if models_json:
        return json.loads(models_json)
    return []


def save_model_recipe(
    session_id: str, model_name: str, recipe: dict, ttl_seconds: int = 3600
):
    recipe_key = f"model:{session_id}:{model_name}"
    serialized_recipe = json.dumps(recipe)
    redis_client.setex(recipe_key, ttl_seconds, serialized_recipe)


def get_model_recipe(session_id: str, model_name: str):
    recipe_key = f"model:{session_id}:{model_name}"
    serialized_recipe = redis_client.get(recipe_key)
    if serialized_recipe:
        return json.loads(serialized_recipe)
    return None


def delete_session(session_id: str):
    model_names = get_session_models(session_id)

    for model_name in model_names:
        recipe_key = f"model:{session_id}:{model_name}"
        redis_client.delete(recipe_key)

    redis_client.delete(f"session:{session_id}:models")
