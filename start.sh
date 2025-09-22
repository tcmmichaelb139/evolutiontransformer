#!/bin/bash

set -e

celery -A evolutiontransformer.worker.celery_app worker --loglevel=info -c 1 &

gunicorn evolutiontransformer.api:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:7860