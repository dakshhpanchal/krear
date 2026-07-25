from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import JobDescription
from .tasks import generate_embedding_for_jd, parse_job_description


@receiver(post_save, sender=JobDescription)
def trigger_jd_processing(sender, instance, created, **kwargs):
    if created:
        generate_embedding_for_jd.delay(instance.id)
        parse_job_description.delay(instance.id)