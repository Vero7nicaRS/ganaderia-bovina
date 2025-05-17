# --------------------------------- crear_usuarios.py: ---------------------------------
# Funcionalidad: se encarga de añadir nuevos usuarios y asignarles un grupo de roles.
# En este caso, hay dos roles:
# - Administrador: puede VER, MODIFICAR, AGREGAR y ELIMINAR todo.
# - Empleado: solamente puede VER.
# -----------------------------------------------------------------------------------

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group

from ganaderiaBovina.models import Perfil


class Command(BaseCommand):

    # Se añade una breve descripción de lo que hace este comando.
    help = 'Se crean nuevos usuarios y se le asignan roles: Administrador y Empleado.'

    def handle(self, *args, **kwargs):
        # Se indican los usuarios: nombre, contraseña y el rol al que pertenecerán.
        lista_usuarios = [
            {'nombre_usuario': 'admin1', 'contrasenya': 'admin1234', 'grupo': 'Administrador'},
            {'nombre_usuario': 'empleado1', 'contrasenya': 'empleado1234', 'grupo': 'Empleado'},
        ]
        # Se recorre la lista de usuarios y se van creando uno a uno.
        for info in lista_usuarios:
            usuario, creado = User.objects.get_or_create(username=info['nombre_usuario'])
            # Se indica con un mensaje si se ha creado el usuario o si ya existía.
            if creado:
                usuario.is_active = True # Se activa el usuario.
                usuario.set_password(info['contrasenya'])  # Se establece la contraseña (hash) del usuario.
                usuario.save() # Se guarda al usuario en el sistema.
                Perfil.objects.get_or_create(user=usuario, rol=info['grupo']) # Se crea el perfil con su rol correspondiente.
                self.stdout.write(f"El usuario '{info['nombre_usuario']}' creado")
            else:
                self.stdout.write(f"El usuario '{info['nombre_usuario']}' ya existe.")

            try:
                grupo = Group.objects.get(name=info['grupo'])
                usuario.groups.add(grupo)
                self.stdout.write(f"El usuario '{info['nombre_usuario']}' ha sido asignado al grupo '{info['grupo']}'")
            except Group.DoesNotExist:
                self.stdout.write(f"El grupo '{info['grupo']}' no existe. Compruebe los grupos creados.")