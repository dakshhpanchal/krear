from celery import shared_task
from functools import lru_cache

@lru_cache(maxsize=1)
def get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer('BAAI/bge-small-en-v1.5')

@shared_task
def generate_embedding_for_entry(entry_id):
    from .models import CareerEntry
    try:
        entry = CareerEntry.objects.get(id=entry_id)
    except CareerEntry.DoesNotExist:
        return

    text = f"{entry.title}. {entry.description}. Tags: {', '.join(entry.tags)}"
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    entry.embedding = embedding.tolist()
    entry.save(update_fields=['embedding'])