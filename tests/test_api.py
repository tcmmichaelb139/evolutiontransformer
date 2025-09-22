import pytest
from fastapi.testclient import TestClient
import time
import re

from evolutiontransformer.api import app


def get_final_answer(text: str) -> int | None:
    numbers = re.findall(r"\d+", text)
    return int(numbers[-1]) if numbers else None


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def await_task_completion(client, task_id, timeout=60):
    start_time = time.time()
    while time.time() - start_time < timeout:
        status_response = client.get(f"/tasks/{task_id}")

        print(status_response.json())

        if status_response.status_code == 500:
            return {"error": status_response.json().get("detail", "Unknown error")}
        assert status_response.status_code == 200
        status_data = status_response.json()

        if status_data["status"] == "SUCCESS":
            return status_data["result"]

        time.sleep(2)
    else:
        pytest.fail(
            f"Task {task_id} did not complete within the {timeout}-second timeout."
        )

    return None


def test_generate_endpoint_svamp(client):
    """
    Tests inference on svamp
    """
    response = client.post(
        "/generate",
        json={
            "model_name": "svamp",
            "prompt": "A spider has 8 legs. A fly has 6 legs. How many legs do they have in total?\nAnswer:",
            "max_new_tokens": 50,
            "temperature": 0.7,
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert "task_id" in data
    task_id = data["task_id"]

    final_result = await_task_completion(client, task_id)

    assert "response" in final_result
    output_text = final_result["response"]

    answer = get_final_answer(output_text)
    assert answer == 14


def test_merge_then_inference_svamp_1(client):
    """
    Tests merging then inference for svamp dataset
    """

    merge_response = client.post(
        "/merge",
        json={
            "model1_name": "svamp",
            "model2_name": "tinystories",
            "layer_recipe": [[(i, 0, 1.0)] for i in range(24)],
            "embedding_lambdas": [1.0, 1.0],
            "linear_lambdas": [1.0, 1.0],
            "merged_name": "svamp_merged",
        },
    )

    assert merge_response.status_code == 200
    merge_data = merge_response.json()
    assert "task_id" in merge_data
    merge_task_id = merge_data["task_id"]

    merge_status_data = await_task_completion(client, merge_task_id)
    model_name = merge_status_data["response"]

    time.sleep(5)

    generate_response = client.post(
        "/generate",
        json={
            "model_name": model_name,
            "prompt": "A spider has 8 legs. A fly has 6 legs. How many legs do they have in total?\nAnswer:",
            "max_new_tokens": 50,
            "temperature": 0.7,
        },
    )

    assert generate_response.status_code == 200
    generate_data = generate_response.json()
    assert "task_id" in generate_data
    generate_task_id = generate_data["task_id"]

    final_result = await_task_completion(client, generate_task_id)

    assert "response" in final_result
    output_text = final_result["response"]
    answer = get_final_answer(output_text)

    assert answer == 14


def test_merge_then_inference_svamp_2(client):
    """
    Tests merging then inference for svamp dataset
    """

    merge_repsonse = client.post(
        "/merge",
        json={
            "model1_name": "svamp",
            "model2_name": "tinystories",
            "layer_recipe": [[(i % 24, 0, 1.0 if i < 24 else 0.5)] for i in range(48)],
            "embedding_lambdas": [1.0, 1.0],
            "linear_lambdas": [1.0, 1.0],
            "merged_name": "svamp_merged",
        },
    )

    assert merge_repsonse.status_code == 200
    merge_data = merge_repsonse.json()
    assert "task_id" in merge_data
    merge_task_id = merge_data["task_id"]

    merge_status_data = await_task_completion(client, merge_task_id)

    model_name = merge_status_data["response"]

    merge_response2 = client.post(
        "/merge",
        json={
            "model1_name": model_name,
            "model2_name": "tinystories",
            "layer_recipe": [[(i, 1, 0.25)] for i in range(24)],
            "embedding_lambdas": [0.0, 0.0],
            "linear_lambdas": [0.0, 0.0],
            "merged_name": "svamp_merged",
        },
    )

    assert merge_response2.status_code == 200
    merge_data2 = merge_response2.json()
    assert "task_id" in merge_data2
    merge_task_id2 = merge_data2["task_id"]
    merge_status_data2 = await_task_completion(client, merge_task_id2)
    model_name2 = merge_status_data2["response"]

    time.sleep(5)

    generate_response = client.post(
        "/generate",
        json={
            "model_name": model_name2,
            "prompt": "A spider has 8 legs. A fly has 6 legs. How many legs do they have in total?\nAnswer:",
            "max_new_tokens": 50,
            "temperature": 0.7,
        },
    )

    assert generate_response.status_code == 200
    generate_data = generate_response.json()
    assert "task_id" in generate_data
    generate_task_id = generate_data["task_id"]

    final_result = await_task_completion(client, generate_task_id)

    assert "response" in final_result
    output_text = final_result["response"]
    answer = get_final_answer(output_text)

    assert answer == 14


def test_merge_two_children_then_merge(client):
    """
    Tests creating two children and merging them
    """

    merge_response1 = client.post(
        "/merge",
        json={
            "model1_name": "svamp",
            "model2_name": "tinystories",
            "layer_recipe": [[(i, 0, 0.8)] for i in range(12)]
            + [[(i, 1, 0.6)] for i in range(12)],
            "embedding_lambdas": [0.7, 0.3],
            "linear_lambdas": [0.8, 0.2],
            "merged_name": "child1",
        },
    )

    assert merge_response1.status_code == 200
    merge_data1 = merge_response1.json()
    assert "task_id" in merge_data1
    merge_task_id1 = merge_data1["task_id"]
    merge_status_data1 = await_task_completion(client, merge_task_id1)
    child1_name = merge_status_data1["response"]

    merge_response2 = client.post(
        "/merge",
        json={
            "model1_name": "svamp",
            "model2_name": "tinystories",
            "layer_recipe": [[(i, 1, 0.9)] for i in range(8)]
            + [[(i, 0, 0.4)] for i in range(16)],
            "embedding_lambdas": [0.2, 0.9],
            "linear_lambdas": [0.3, 0.7],
            "merged_name": "child2",
        },
    )

    assert merge_response2.status_code == 200
    merge_data2 = merge_response2.json()
    assert "task_id" in merge_data2
    merge_task_id2 = merge_data2["task_id"]
    merge_status_data2 = await_task_completion(client, merge_task_id2)
    child2_name = merge_status_data2["response"]

    merge_response3 = client.post(
        "/merge",
        json={
            "model1_name": child1_name,
            "model2_name": child2_name,
            "layer_recipe": [[(i, 0, 0.6), (i, 1, 0.4)] for i in range(24)],
            "embedding_lambdas": [0.5, 0.5],
            "linear_lambdas": [0.6, 0.4],
            "merged_name": "final_merged",
        },
    )

    assert merge_response3.status_code == 200
    merge_data3 = merge_response3.json()
    assert "task_id" in merge_data3
    merge_task_id3 = merge_data3["task_id"]
    merge_status_data3 = await_task_completion(client, merge_task_id3)
    final_model_name = merge_status_data3["response"]

    time.sleep(5)

    number_of_models = client.post(f"/list_models")

    assert number_of_models.status_code == 200
    number_of_models_data = number_of_models.json()
    assert "task_id" in number_of_models_data
    number_of_models_task_id = number_of_models_data["task_id"]

    number_of_models_result = await_task_completion(client, number_of_models_task_id)

    assert "response" in number_of_models_result
    models = number_of_models_result["response"]
    print(models)
    assert len(models) == 5

    generate_response = client.post(
        "/generate",
        json={
            "model_name": final_model_name,
            "prompt": "A spider has 8 legs. A fly has 6 legs. How many legs do they have in total?\nAnswer:",
            "max_new_tokens": 50,
            "temperature": 0.7,
        },
    )

    assert generate_response.status_code == 200
    generate_data = generate_response.json()
    assert "task_id" in generate_data
    generate_task_id = generate_data["task_id"]

    final_result = await_task_completion(client, generate_task_id)

    assert "response" in final_result
    output_text = final_result["response"]
    answer = get_final_answer(output_text)

    assert answer == 14


def test_merge_fail(client):
    """
    Tests merging with too many layers
    """

    merge_repsonse = client.post(
        "/merge",
        json={
            "model1_name": "svamp",
            "model2_name": "tinystories",
            "layer_recipe": [[(i, 0, 1.0)] for i in range(50)],
            "embedding_lambdas": [1.0, 1.0],
            "linear_lambdas": [1.0, 1.0],
            "merged_name": "svamp_merged",
        },
    )

    assert merge_repsonse.status_code == 200
    merge_data = merge_repsonse.json()
    assert "task_id" in merge_data
    merge_task_id = merge_data["task_id"]

    merge_status_data = await_task_completion(client, merge_task_id)
    assert "response" not in merge_status_data
    assert "error" in merge_status_data
    assert "Layer recipe too long" in merge_status_data["error"]
