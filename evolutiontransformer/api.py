import os

os.environ["TOKENIZERS_PARALLELISM"] = "false"

import uuid
from typing import List, Tuple
from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from celery import Celery
from dotenv import load_dotenv

load_dotenv()


REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


celery_app = Celery(
    "tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
    broker_transport_options={"polling_interval": 3600},
    worker_event_heartbeat=3600,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://tcmmichaelb139-evolutiontransformer.hf.space",
        "https://evolutiontransformer.michaelbao.com",
    ],  # Allow all origins for now to debug
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    model_name: str
    prompt: str
    max_new_tokens: int = 512
    temperature: float = 0.7


class MergeRequest(BaseModel):
    model1_name: str
    model2_name: str
    layer_recipe: List[List[Tuple[int, int, float]]]
    embedding_lambdas: List[float] = [0.5, 0.5]
    linear_lambdas: List[float] = [0.5, 0.5]
    merged_name: str = "merged"


def get_session_id(request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    print(f"Received cookies: {request.cookies}")
    print(f"Current session_id: {session_id}")

    if not session_id:
        session_id = str(uuid.uuid4())
        print(f"Generated new session_id: {session_id}")
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            secure=True,
            samesite="none",
        )

    return session_id


@app.post("/generate")
def generate(request: GenerateRequest, session_id: str = Depends(get_session_id)):
    task = celery_app.send_task(
        "tasks.inference",
        args=[
            session_id,
            request.model_name,
            request.prompt,
            request.max_new_tokens,
            request.temperature,
        ],
    )
    return {"task_id": task.id}


@app.post("/merge")
def merge(request: MergeRequest, session_id: str = Depends(get_session_id)):
    task = celery_app.send_task(
        "tasks.merge_models",
        args=[
            session_id,
            request.model1_name,
            request.model2_name,
            request.layer_recipe,
            request.embedding_lambdas,
            request.linear_lambdas,
            request.merged_name,
        ],
    )

    return {"task_id": task.id}


@app.post("/list_models")
def list_models(session_id: str = Depends(get_session_id)):
    task = celery_app.send_task("tasks.get_all_models", args=[session_id])
    return {"task_id": task.id}


@app.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    task_result = celery_app.AsyncResult(task_id)

    if task_result.ready():
        if task_result.status == "FAILURE":
            raise HTTPException(status_code=500, detail=str(task_result.result))
        else:
            return {"status": task_result.status, "result": task_result.result}
    else:
        return {"status": task_result.status}
