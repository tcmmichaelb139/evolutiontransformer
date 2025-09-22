#!/bin/bash

set -e

uv run celery -A evolutiontransformer.worker.celery_app worker --loglevel=info -c 2 &

uv run gunicorn evolutiontransformer.api:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:7860