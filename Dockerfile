FROM python:3.12-slim
WORKDIR /code 

RUN pip install uv

COPY pyproject.toml uv.lock ./

RUN uv export --no-dev | uv pip install --system -r -

COPY evolutiontransformer/ ./evolutiontransformer/