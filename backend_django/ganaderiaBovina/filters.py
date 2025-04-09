#
# --------------------------------- filters.py: ---------------------------------
# Funcionalidad: permite seleccionar los filtros que se van a aplicar en los datos
# mediante la URL.
# Se consigue:
# GET /.../
# GET /.../{id}/
# GET /.../?... & ...
# POST /.../
# PUT /.../{id}
# DELETE /.../{id}
# -----------------------------------------------------------------------------------

import django_filters
from .models import Animal, Toro, InventarioVT, VTAnimales, ListaInseminaciones


# --------------------------------------------------------------------------------------------------------------
#                                       Filtrado para ANIMAL
# --------------------------------------------------------------------------------------------------------------
# Se van a filtrar los datos de los animales (Vacas/Terneros) por:
# Células somáticas, produccion_leche, calidad_patas, calidad_ubres, grasa, proteintas,
# tipo (Vaca o Ternero), estado (Vacía, Inseminada, Preñada, No inseminar, Joven, Muerta y Vendida),
# corral donde estén, identificador de sus reproductores,nombre, fecha_nacimiento y fecha_eliminacion.

# GET /animal/
# GET /animal/{id}/
# GET /animal/?campo1=... & campo2=...
# POST /animal/
# PUT /animal/{id}
# DELETE /animal/{id}

class AnimalFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.
    tipo = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.
    estado = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.

    class Meta:
        model = Animal
        fields = {
            'celulas_somaticas': ['exact', 'gte', 'lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'produccion_leche': ['exact', 'gte', 'lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'calidad_patas': ['exact', 'gte', 'lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'calidad_ubres': ['exact', 'gte', 'lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'grasa': ['exact', 'gte', 'lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'proteinas': ['exact', 'gte', 'lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'corral': ['exact'],
            'padre': ['exact'],
            'madre': ['exact'],
            'fecha_nacimiento': ['exact', 'gte', 'lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'fecha_eliminacion': ['exact', 'gte', 'lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
        }

# --------------------------------------------------------------------------------------------------------------
#                                       Filtrado para TORO
# --------------------------------------------------------------------------------------------------------------
# Se van a filtrar los datos de los Toros por:
# El estado (Vivo, muerte u otros), nombre, celulas_somaticas, transmision_leche, cantidad_semen,
# calidad_patas, calidad_ubres, grasa, proteinas y fecha_eliminacion

# GET /toros/
# GET /toros/{id}/
# GET /toros/?campo1=... & campo2=...
# POST /toros/
# PUT /toros/{id}
# DELETE /toros/{id}

class ToroFilter(django_filters.FilterSet):
    estado = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.
    nombre = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.

    class Meta:
        model = Toro
        fields = {
            'celulas_somaticas':['exact','gte','lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'transmision_leche':['exact','gte','lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'cantidad_semen': ['exact','gte','lte'], # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'calidad_patas':['exact','gte','lte'],  # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'calidad_ubres':['exact','gte','lte'],  # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'grasa':['exact','gte','lte'],  # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'proteinas':['exact','gte','lte'],  # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
            'fecha_eliminacion':['exact','gte', 'lte']  # Puede ser un valor exacto o un rango (gte [>=] o lte[<=]).
        }

# --------------------------------------------------------------------------------------------------------------
#                                       Filtrado para CORRAL
# --------------------------------------------------------------------------------------------------------------
# Se van a filtrar los datos del Corral por:
# El nombre.

# GET /corrales/
# GET /corrales/{id}/
# GET /corrales/?campo1=... & campo2=...
# POST /corrales/
# PUT /corrales/{id}
# DELETE /corrales/{id}

class CorralFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.


# --------------------------------------------------------------------------------------------------------------
#                                       Filtrado para INVENTARIOVT (Vacunas y tratamientos del inventario)
# --------------------------------------------------------------------------------------------------------------
# Se van a filtrar los datos del InventarioVT por:
# El nombre, tipo (tratamiento y vacuna), estado (activa e inactiva),
# unidades que hay de ese tratamiento/vacuna (pudiendo ser una cantidad o un rango) y
# cantidad (sobre y botella).

# GET /inventariovt/
# GET /inventariovt/{id}/
# GET /inventariovt/?campo1=... & campo2=...
# POST /inventariovt/
# PUT /inventariovt/{id}
# DELETE /inventariovt/{id}

class InventarioVTFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.
    tipo = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.
    estado = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.

    class Meta:
        model = InventarioVT
        fields = {
            'cantidad': ['exact'],
            'unidades':['exact','gte','lte'], # Puede ser un valor excacto o un rango (gte [>=] o lte[<=]).
        }
# --------------------------------------------------------------------------------------------------------------
#                                       Filtrado para VTANIMALES (Vacunas y tratamientos suministrados a los animales)
# --------------------------------------------------------------------------------------------------------------
# Se van a filtrar los datos de VTAnimales por:
# El tipo (tratamiento y vacuna), ruta (Intravenosa, Intramamaria, Intramuscular, Intravaginal, Oral,
# nasal y subcutánea), id del animal, dosis suministrada, responsable, fecha_inicio y fecha_finalizacion.

# GET /vtanimales/
# GET /vtanimales/{id}/
# GET /vtanimales/?campo1=... & campo2=...
# POST /vtanimales/
# PUT /vtanimales/{id}
# DELETE /vtanimales/{id}

class VTAnimalesFilter(django_filters.FilterSet):
    tipo = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.
    ruta = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.
    responsable = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.

    class Meta:
        model =  VTAnimales
        fields = {
            'id_animal':['exact'],
            'dosis': ['exact','gte','lte'], # Puede ser valor exacto o un rango (gte [>=] o lte[<=]).
            'fecha_inicio':['exact','gte','lte'], # Puede ser valor exacto o un rango (gte [>=] o lte[<=]).
            'fecha_finalizacion':['exact','gte','lte'] # Puede ser valor exacto o un rango (gte [>=] o lte[<=]).
        }

# --------------------------------------------------------------------------------------------------------------
#                                       Filtrado para LISTA INSEMINACIONES
# --------------------------------------------------------------------------------------------------------------
# Se van a filtrar los datos de ListaInseminaciones por:
# La razón (Celo o Programada), id_vaca, id_toro, es_sexado, responsable, fecha_inseminacion y hora_inseminacion.

# GET /listainseminaciones/
# GET /listainseminaciones/{id}/
# GET /listainseminaciones/?campo1=... & campo2=...
# POST /listainseminaciones/
# PUT /listainseminaciones/{id}
# DELETE /listainseminaciones/{id}

class ListaInseminacionesFilter(django_filters.FilterSet):
    razon = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.
    responsable = django_filters.CharFilter(lookup_expr='icontains') # Se ignoran las mayúsculas y las minúsculas.

    class Meta:
        model = ListaInseminaciones
        fields = {
            'id_vaca':['exact'],
            'id_toro':['exact'],
            'es_sexado':['exact'],
            'fecha_inseminacion': ['exact','gte', 'lte'], # Puede ser valor exacto o un rango (gte [>=] o lte[<=]).
            'hora_inseminacion':  ['exact','gte', 'lte'] # Puede ser valor exacto o un rango (gte [>=] o lte[<=]).
        }

