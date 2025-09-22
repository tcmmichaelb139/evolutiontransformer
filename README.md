---
title: Evolution Transformer
emoji: "🚀"
colorFrom: purple
colorTo: pink
sdk: docker
app_port: 7860
---

# Evolution Transformer: An Interactive Playground for LLM Model Merging

An interactive web application for exploring model merging techniques for large language models. This project allows users to dynamically create new "child" models by combining pre-trained specialists, based on the concepts from the research paper [Evolutionary Optimization of Model Merging Recipes](https://arxiv.org/pdf/2403.13187).

Live Demo: [https://evolutiontransformer.michaelbao.com](https://evolutiontransformer.michaelbao.com)
Backend API: [Hugging Face Space](https://tcmmichaelb139-evolutiontransformer.hf.space)

## Features

- Dynamic Model Merging: Create new models with more or fewer layers than the original parents by defining a recipe of any length.
- Full Model Control: In addition to the main transformer blocks, users can also control the blend ratios for the embedding and final output layers.
- Interactive Interface: User-friendly web interface built with React and Tailwind CSS for easy model selection and configuration.
- Asynchronous Processing: Efficient task handling using Celery and Redis for background processing of model merging.

## Architecture

The application is built on a modern, decoupled, multi-service architecture designed for scalable and robust machine learning deployment. The backend is running on a CPU instead of a GPU to save costs, however to run GPT2-medium (which we are using) it is decent.

[React Frontend @ Cloudflare] <--> [FastAPI Web Server @ HF Spaces] <--> [Redis Queue @ Upstash] <--> [Celery GPU Worker @ HF Spaces]

## Tech Stack

- Frontend: React (Vite), Tailwind CSS
- Backend: FastAPI, PyTorch/Hugging Face Transformers, Celery, Redis, uv (package manager)
- Deployment: Cloudflare Pages (Frontend), Hugging Face Spaces (Backend and Worker), Upstash (Redis)

## Setup Instructions

You need to run four separate processes in four different terminal tabs. You may need to change some link variables in the code to point to your own deployment URLs.

**1. Start Redis (if not already running as a service):**

```bash
redis-server
```

**2. Start the Celery Worker:**

```bash
# In your project root, with .venv active
celery -A evolutiontransformer.worker.celery_app worker --loglevel=info -c 1
```

**3. Start the FastAPI Server:**

```bash
# In your project root, with .venv active
uvicorn evolutiontransformer.api:app --reload
```

**4. Start the React Frontend:**

```bash
# In the /frontend directory
npm run dev
```
