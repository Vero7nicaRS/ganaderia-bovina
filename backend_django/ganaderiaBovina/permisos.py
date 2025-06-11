# --------------------------------- permisos.py: ---------------------------------
# Funcionalidad: se encarga de definir los permisos para acceder a una vista
# dependiendo del grupo al que pertenezca el usuario.
# -----------------------------------------------------------------------------------

from rest_framework.permissions import BasePermission, DjangoModelPermissions


class EsAdministrador(BasePermission):
    # Permite únicamente el acceso a las vistas a usuarios pertenecientes al grupo 'Administrador'
    def has_permission(self, request, view):
        return (
                request.user
                and request.user.is_authenticated
                and request.user.groups.filter(name='Administrador').exists()
        )


class EsEmpleado(BasePermission):
    # Permite únicamente el acceso a las vistas a usuarios pertenecientes al grupo 'Empleado'
    def has_permission(self, request, view):
        return (
                request.user
                and request.user.is_authenticated
                and request.user.groups.filter(name='Empleado').exists()
        )

class PermisosPorModelo(DjangoModelPermissions):
    message = "No tiene permiso para realizar esta acción."