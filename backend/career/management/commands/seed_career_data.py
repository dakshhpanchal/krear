from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from career.models import CareerEntry, Skill


class Command(BaseCommand):
    help = "Seed the database with real career entries for testing"

    def handle(self, *args, **kwargs):
        user, _ = User.objects.get_or_create(username='soap')

        CareerEntry.objects.get_or_create(
            user=user,
            title="Mercury Rover — Autonomous Navigation",
            defaults=dict(
                category='project',
                description="Built the full Nav2 navigation stack for an autonomous "
                            "ground rover on ROS2 Jazzy, including GPS integration, "
                            "SLAM, and sensor fusion via EKF for ICMTC UGVC-2026.",
                tech_stack=["ROS2", "Python", "Nav2", "SLAM", "GPS"],
                metrics=["Competition-ready navigation pipeline"],
                tags=["robotics", "navigation", "ros2"],
            )
        )

        CareerEntry.objects.get_or_create(
            user=user,
            title="Krear — Career Intelligence Platform",
            defaults=dict(
                category='project',
                description="Full-stack platform for managing job applications with "
                            "AI-driven resume tailoring using RAG over a structured "
                            "career database.",
                tech_stack=["Next.js", "Django", "PostgreSQL", "pgvector"],
                metrics=[],
                tags=["fullstack", "ai", "rag"],
            )
        )

        Skill.objects.get_or_create(user=user, name="Python", defaults=dict(category="Language", proficiency="advanced"))
        Skill.objects.get_or_create(user=user, name="ROS2", defaults=dict(category="Framework", proficiency="advanced"))
        Skill.objects.get_or_create(user=user, name="Django", defaults=dict(category="Framework", proficiency="intermediate"))

        self.stdout.write(self.style.SUCCESS("Seed data created."))