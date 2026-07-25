from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from resumes.models import JobDescription


class Command(BaseCommand):
    help = "Seed a realistic job description for testing"

    def handle(self, *args, **kwargs):
        user = User.objects.get(username='soap')

        JobDescription.objects.get_or_create(
            user=user,
            company="Skyward Robotics",
            role_title="Robotics Software Engineer",
            defaults=dict(
                raw_text=(
                    "We are looking for a Robotics Software Engineer to join our "
                    "autonomous systems team. You will work on ROS2-based navigation "
                    "stacks, sensor fusion, and real-time control for ground vehicles. "
                    "Requirements: strong Python and C++, experience with ROS2 or ROS1, "
                    "familiarity with SLAM and Nav2, GPS/IMU sensor integration, and "
                    "computer vision fundamentals. Bonus: embedded systems experience "
                    "(Arduino/ESP32), competition robotics background."
                )
            )
        )

        self.stdout.write(self.style.SUCCESS("Seeded 1 job description."))