FROM python:3.12-slim

ENV HF_HOME=/home/user/huggingface

WORKDIR HF_HOME

RUN pip install uv

COPY pyproject.toml uv.lock ./

RUN uv export --no-dev | uv pip install --system -r -

COPY evolutiontransformer/ ./evolutiontransformer/

COPY start.sh .

RUN chmod +x ./start.sh

CMD ["./start.sh"]
