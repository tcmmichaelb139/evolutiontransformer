import os
from redis import Redis
import json


REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = Redis.from_url(REDIS_URL, decode_responses=True)


def add_model_to_session(session_id: str, model_name: str, ttl_seconds: int = 3600):
    session_key = f"session:{session_id}:models"

    existing_models = redis_client.json().get(session_key, "$")
    if existing_models and len(existing_models) > 0:
        existing_models = existing_models[0]
    else:
        existing_models = []

    if model_name not in existing_models:
        existing_models.append(model_name)

    redis_client.json().set(session_key, "$", existing_models)
    redis_client.expire(session_key, ttl_seconds)


def get_session_models(session_id: str):
    session_key = f"session:{session_id}:models"
    models = redis_client.json().get(session_key, "$")
    if models and len(models) > 0:
        return models[0]
    return []


def save_model_recipe(
    session_id: str, model_name: str, recipe: dict, ttl_seconds: int = 3600
):
    recipe_key = f"model:{session_id}:{model_name}"
    redis_client.json().set(recipe_key, "$", recipe)
    redis_client.expire(recipe_key, ttl_seconds)


def get_model_recipe(session_id: str, model_name: str):
    recipe_key = f"model:{session_id}:{model_name}"
    recipe = redis_client.json().get(recipe_key, "$")
    if recipe and len(recipe) > 0:
        return recipe[0]
    return None


def delete_session(session_id: str):
    model_names = get_session_models(session_id)

    for model_name in model_names:
        recipe_key = f"model:{session_id}:{model_name}"
        redis_client.delete(recipe_key)

    session_key = f"session:{session_id}:models"
    redis_client.delete(session_key)
