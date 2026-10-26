from django.apps import AppConfig


class CafestoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = 'CafeStore'

    def ready(self):
        import CafeStore.signals
