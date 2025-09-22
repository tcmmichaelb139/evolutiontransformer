FROM python:3.12-slim

RUN useradd -m -u 1000 user

ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

ENV HF_HOME=$HOME/.cache

WORKDIR $HOME/app

RUN chown -R user:user $HOME/app

COPY --chown=user pyproject.toml uv.lock ./

USER user

RUN pip install uv

RUN uv sync

COPY --chown=user . $HOME/app

RUN chmod +x ./start.sh

CMD ["./start.sh"]
