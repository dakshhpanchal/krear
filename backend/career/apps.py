from django.apps import AppConfig

class CareerConfig(AppConfig):
    name = 'career'

    def ready(self):
        import career.signals