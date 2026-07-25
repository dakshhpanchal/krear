from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CareerEntry
from .tasks import generate_embedding_for_entry


@receiver(post_save, sender=CareerEntry)
def trigger_embedding(sender, instance, created, **kwargs):
    if created:
        generate_embedding_for_entry.delay(instance.id)