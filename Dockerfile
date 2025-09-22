FROM python:3.12-slim

RUN useradd -m -u 1000 user

USER user

ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

ENV HF_HOME=$HOME/.cache

WORKDIR $HOME/app

RUN pip install uv

COPY pyproject.toml uv.lock ./

RUN uv export --no-dev | uv pip install --system -r -

COPY evolutiontransformer/ ./evolutiontransformer/

COPY start.sh .

RUN chmod +x ./start.sh

CMD ["./start.sh"]
