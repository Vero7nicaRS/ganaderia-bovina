from django.urls import path, include
from rest_framework import routers

from .views import (
    AnimalViewSet,
    ToroViewSet,
    CorralViewSet,
    InventarioVTViewSet,
    VTAnimalesViewSet,
    ListaInseminacionesViewSet,
    inventario_por_tipo, SimulacionCriaView, ReentrenarCriaView
)

# Creamos un router y registramos nuestras vistas (viewsets)
router = routers.DefaultRouter()
router.register(r'animales', AnimalViewSet)
router.register(r'toros', ToroViewSet)
router.register(r'corrales', CorralViewSet)
router.register(r'inventariovt', InventarioVTViewSet)
router.register(r'vtanimales', VTAnimalesViewSet)
router.register(r'listainseminaciones', ListaInseminacionesViewSet)

# URL patterns de la aplicación
urlpatterns = [
    path('', include(router.urls)),
    path('inventario_por_tipo/', inventario_por_tipo),
    path('simular-cria/', SimulacionCriaView.as_view(), name="simular-cria"),
    path('reentrenar-cria/', ReentrenarCriaView.as_view(), name="reentrenar-cria"),
]