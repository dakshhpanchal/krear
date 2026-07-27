import os
import requests
from celery import shared_task

HF_TOKEN = os.environ.get("HF_TOKEN")
HF_EMBEDDING_URL = "https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5/pipeline/feature-extraction"

def get_embedding(text: str) -> list[float]:
    res = requests.post(
        HF_EMBEDDING_URL,
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={"inputs": text, "options": {"wait_for_model": True}},
        timeout=30,
    )
    res.raise_for_status()
    embedding = res.json()
    # HF's feature-extraction endpoint sometimes nests the result depending
    # on the model/pipeline version — normalize to a flat list of floats.
    if isinstance(embedding, list) and embedding and isinstance(embedding[0], list):
        embedding = embedding[0]
    return embedding


@shared_task
def generate_embedding_for_entry(entry_id):
    from .models import CareerEntry
    try:
        entry = CareerEntry.objects.get(id=entry_id)
    except CareerEntry.DoesNotExist:
        return

    text = f"{entry.title}. {entry.description}. Tags: {', '.join(entry.tags)}"
    embedding = get_embedding(text)
    entry.embedding = embedding
    entry.save(update_fields=['embedding'])