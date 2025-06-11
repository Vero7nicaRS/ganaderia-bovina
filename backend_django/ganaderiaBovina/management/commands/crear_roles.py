# --------------------------------- crear_roles.py: ---------------------------------
# Funcionalidad: se encarga de definir los grupos que hay de perfiles de usuario
# y asignarles sus permisos.
# En este caso, hay dos roles:
# - Administrador: puede VER, MODIFICAR, AGREGAR y ELIMINAR todo.
# - Empleado: solamente puede VER.
# -----------------------------------------------------------------------------------

#                       OBSERVACIONES
# ---------------------------------------------------------------------------
# DJango tiene 4 permisos para los modelos:
# VER: view_nombre_del_modelo
# AGREGAR: add_nombre_del_modelo
# MODIFICAR: change_nombre_del_modelo
# ELIMINAR: delete_nombre_del_modelo

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

class Command(BaseCommand):

    # Se añade una breve descripción de lo que hace este comando.
    help = "Creación de los grupos de usuarios: Administrador y Empleado."

    def handle(self, *args, **kwargs):
        # Modelos sobre los que se darán los permisos
        modelos = ['animal', 'toro', 'corral', 'inventariovt', 'vtanimales', 'listainseminaciones']

        # Se crea el grupo "Administrador" que tiene todos los permisos (CRUD)
        admin_grupo, creado = Group.objects.get_or_create(name='Administrador')
        # Se indica con un mensaje si se ha creado correctamente el grupo o si ya existía.
        if creado:
            self.stdout.write(" El grupo 'Administrador' ha sido creado.")
        else:
            self.stdout.write(" El grupo 'Administrador' ya existía.")

        # Se crea el grupo "Empleado" que tiene únicamente el permiso de visualizar (R)
        empleado_grupo, creado = Group.objects.get_or_create(name='Empleado')
        # Se indica con un mensaje si se ha creado correctamente el grupo o si ya existía.
        if creado:
            self.stdout.write(" El grupo 'Empleado' ha sido creado.")
        else:
            self.stdout.write(" El grupo 'Empleado' ya existía.")

        for nombre_modelo in modelos:
            # Se obtienen cada uno de los modelos.
            content_type = ContentType.objects.get(app_label='ganaderiaBovina', model=nombre_modelo)

            # Se buscan todos los permisos del modelo.
            permisos_admin = Permission.objects.filter(content_type=content_type)
            # Se le asignan todos los permisos para los usuarios pertenecientes al grupo Administrador
            for permiso in permisos_admin: # Se añaden uno a uno los permisos al grupo del Administrador.
                admin_grupo.permissions.add(permiso)

            # Se busca el permiso de lectura del modelo.
            permiso_ver = Permission.objects.get(content_type=content_type, codename=f'view_{nombre_modelo}')
            # Se le asigna el permiso de Lectura para los usuarios pertenecientes al grupo de Empleado
            empleado_grupo.permissions.add(permiso_ver)

        self.stdout.write("Los permisos a los grupos se han realizado correctamente.")

