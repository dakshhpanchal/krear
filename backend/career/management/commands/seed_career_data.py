from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from career.models import CareerEntry, Skill


class Command(BaseCommand):
    help = "Seed the database with real career entries for testing"

    def handle(self, *args, **kwargs):
        user, _ = User.objects.get_or_create(username='soap')
        user.set_password('changeme123')
        user.save()

        entries = [
            dict(
                category='project',
                title="Mercury Rover — Autonomous Navigation Stack",
                description="Built the full Nav2 navigation stack for an autonomous "
                            "ground rover on ROS2 Jazzy for ICMTC UGVC-2026, including "
                            "a custom lane_path_builder_node that constructs the track "
                            "centerline live from lane detection and feeds it directly "
                            "to Nav2's FollowPath action, removing the need for a "
                            "traditional global planner.",
                tech_stack=["ROS2", "Python", "Nav2", "SLAM", "GPS", "OpenCV"],
                metrics=["Competition-ready pipeline for ICMTC UGVC-2026"],
                tags=["robotics", "navigation", "ros2", "autonomous-systems"],
            ),
            dict(
                category='project',
                title="Mercury Rover — Turret Vision & Face-Recognition Laser System",
                description="Designed and calibrated a pan-servo laser turret with "
                            "face-recognition targeting, including fixing a dual-"
                            "controller conflict between two nodes fighting over pan "
                            "position, correcting servo mapping math, and porting "
                            "Arduino firmware to ESP32Servo.",
                tech_stack=["ROS2", "Arduino", "ESP32", "OpenCV", "C++"],
                metrics=["Sub-degree pan accuracy after calibration"],
                tags=["robotics", "computer-vision", "embedded", "hardware"],
            ),
            dict(
                category='project',
                title="Mercury Rover — GCS Communications Architecture",
                description="Restructured three parallel ground-control-station comms "
                            "systems into a unified architecture, audited and fixed "
                            "broken TCP/UDP data paths for photo transfer and "
                            "joystick/E-STOP commands, and migrated rover hardware "
                            "from Teensy to ESP32 with RealSense-fused IMU.",
                tech_stack=["ROS2", "Python", "TCP/UDP", "ESP32", "RealSense"],
                metrics=["Fixed 2 broken comms paths via full port audit"],
                tags=["robotics", "networking", "systems-design"],
            ),
            dict(
                category='project',
                title="Krear — AI-Powered Career & Resume Platform",
                description="Full-stack platform for managing job applications with "
                            "AI-driven resume tailoring using RAG over a structured "
                            "career database, built on Next.js, Django REST Framework, "
                            "and pgvector for semantic search.",
                tech_stack=["Next.js", "TypeScript", "Django", "DRF", "PostgreSQL", "pgvector", "Celery"],
                metrics=[],
                tags=["fullstack", "ai", "rag"],
            ),
            dict(
                category='project',
                title="Syncify — Spotify to YouTube Music Sync CLI",
                description="Built a command-line tool to sync playlists between "
                            "Spotify and YouTube Music, including fuzzy-match handling, "
                            "batched write operations to avoid API rate limits, and "
                            "direct URL input support.",
                tech_stack=["Python", "Spotify API", "YTMusic API"],
                metrics=[],
                tags=["cli", "automation", "api-integration"],
            ),
            dict(
                category='project',
                title="WatchList — YouTube Video Tracker Web App",
                description="Built a web app to track and organize YouTube videos "
                            "users want to watch later, with a clean tracking UI.",
                tech_stack=["JavaScript", "HTML", "CSS"],
                metrics=[],
                tags=["webapp", "frontend"],
            ),
        ]

        for e in entries:
            CareerEntry.objects.get_or_create(user=user, title=e['title'], defaults=e)

        skills = [
            ("Python", "Language", "advanced"),
            ("ROS2", "Framework", "advanced"),
            ("Django", "Framework", "intermediate"),
            ("TypeScript", "Language", "intermediate"),
            ("React", "Framework", "intermediate"),
            ("PostgreSQL", "Database", "intermediate"),
            ("C++", "Language", "intermediate"),
            ("Docker", "Tool", "intermediate"),
            ("Computer Vision", "Domain", "advanced"),
        ]
        for name, category, proficiency in skills:
            Skill.objects.get_or_create(
                user=user, name=name,
                defaults=dict(category=category, proficiency=proficiency)
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(entries)} entries and {len(skills)} skills."))