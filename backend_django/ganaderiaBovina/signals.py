# Las señales se ejecutan automáticamente cuando ocurre un evento.
# Me ayuda a automatizar la creación del Perfil del usuario.

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Perfil

# Cuando se cree un usuario, se va a crear su perfil de manera automática.
@receiver(post_save, sender=User)
def crear_perfil_usuario(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.create(user=instance)