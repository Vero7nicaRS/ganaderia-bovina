from django.apps import AppConfig


class GanaderiabovinaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ganaderiaBovina'

    def ready(self):
        import ganaderiaBovina.signals  # Señales