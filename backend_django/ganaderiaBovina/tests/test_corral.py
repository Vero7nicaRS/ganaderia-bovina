# --------------------------------- test_corral.py: ---------------------------------
# Funcionalidad: se encarga de comprobar la API
# (ej: crear, modificar, eliminar, mostrar...)
# -----------------------------------------------------------------------------------
from ganaderiaBovina.models import Corral
import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from ganaderiaBovina.models import Toro, Animal, Corral, InventarioVT, VTAnimales, ListaInseminaciones
from decimal import Decimal


# --------------------------------------------------------------------------------------------------------------
#                                       Test de CORRAL: LÓGICA
# --------------------------------------------------------------------------------------------------------------

# Test donde se comprueba que se puede crear un tratamiento/vacuna suministrado correctamente con datos válidos.
@pytest.mark.django_db
def test_crear_corral_valido():
    client = APIClient()

    datos = {
     "nombre" : "Corral Prueba"
    }

    response = client.post("/api/corrales/", datos, format="json")

    assert response.status_code == 201

    # Se comprueba que el código se ha generado correctamente.
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("CORRAL-")
    assert response.data["codigo"][7:].isdigit()

    # Se comprueba que el corral existe en la base de datos.
    assert Corral.objects.filter(nombre="Corral Prueba").exists()



# Test para comprobar que debe haber valores en cada uno de los campos.
@pytest.mark.django_db
def test_corral_campos_requeridos_vacios():
    client = APIClient()

    datos = {
        "nombre" : ""
    }

    response = client.post("/api/corrales/", datos, format="json")

    assert response.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    assert response.data["nombre"][0] == "El nombre no puede estar vacío."


# Test para comprobar los valores fuera de rango
@pytest.mark.django_db
def test_corral_valores_fuera_de_rango():
    datos = {
        "nombre" : ""
    }



# Test para comprobar si se generan códigos duplicados
@pytest.mark.django_db
def test_codigo_duplicado_corral():
    client = APIClient()


    Corral.objects.create(
        codigo="CORRAL-100",
        nombre="Corral Prueba 1"
    )
    # Se intenta crear un nuevo  con el mismo código ("CORRAL-100").
    datos_duplicados = {
        "codigo": "CORRAL-100",
        "nombre": "Corral Prueba 2"
    }

    # Se intenta crear un nuevo tratamiento/vacuna con el mismo código ("CORRAL-100").
    response = client.post("/api/corrales/", datos_duplicados, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data
    assert response.data["codigo"][0] == "El código ya existe en el sistema."  # Se comprueba que se obtiene el mensaje de error personalizado.


# Test para comprobar si se generan códigos con formato incorrecto.
@pytest.mark.django_db
def test_crear_corral_codigo_formato_incorrecto():
    client = APIClient()

    datos_codigo_incorrecto = {
        "codigo": "ABC-999", # Formato de código incorrecto.
        "nombre": "Corral Prueba 1"
    }

    # Se intenta crear un nuevo corral con el mismo código ("CORRAL-100").
    response = client.post("/api/corrales/", datos_codigo_incorrecto, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data # Error del campo "código"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["codigo"][0] == "El código debe tener el formato 'CORRAL-número' (Ej: CORRAL-1)."

# Test para comprobar que si el usuario no introduce un código, éste se genera de manera automática.
@pytest.mark.django_db
def test_codigo_corral_generado_automaticamente():
    client = APIClient()

    datos = {
        # No se indica el campo "codigo"
        "nombre": "Corral Prueba 1"
    }

    response = client.post("/api/corrales/", datos, format='json')

    assert response.status_code == 201
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("CORRAL-") # Comprueba que el código comience por "CORRAL-".
    assert response.data["codigo"][7:].isdigit() # Comprueba que lo que le sigue a "CORRAL-" son números.

# Test para comprobar que un corral se elimina correctamente al no tener ningún animal.
@pytest.mark.django_db
def test_eliminar_corral_sin_animales():
    client = APIClient()
    corral = Corral.objects.create(nombre="Corral Libre")

    response = client.delete(f"/api/corrales/{corral.id}/")

    assert response.status_code == 200
    assert response.data["mensaje"] == f"El corral {corral.codigo} ha sido eliminado correctamente."
    assert not Corral.objects.filter(id=corral.id).exists()

# Test para comprobar que un corral no puede ser eliminado si tiene animales. Si se intenta eliminar,
# se muestra un mensaje de error.
@pytest.mark.django_db
def test_eliminar_corral_con_animales_asociados():
    client = APIClient()

    corral = Corral.objects.create(nombre="Corral Ocupado")

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 1",
        fecha_nacimiento="2024-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=4.0,
        proteinas=3.5,
        corral=corral
    )

    response = client.delete(f"/api/corrales/{corral.id}/")

    assert response.status_code == 400
    assert response.data["ERROR"] == f"No se puede eliminar el corral {corral.codigo} porque contiene animales asociados."
    assert Corral.objects.filter(id=corral.id).exists()

# --------------------------------------------------------------------------------------------------------------
#                                       Test de CORRAL: FILTRADO
# --------------------------------------------------------------------------------------------------------------


# Test para filtrar por las dosis de las vacunas/tratamientos suministrados.
@pytest.mark.django_db
def test_filtrado_vtanimales_por_nombre():
    client = APIClient()

    # No cumple con el filtro (Corral Prueba 1).
    Corral.objects.create(
        codigo="CORRAL-100",
        nombre="Corral Prueba 1"
    )
    # No cumple con el filtro (Corralito Prueba 2).
    Corral.objects.create(
        codigo="CORRAL-200",
        nombre="Corral Prueba 2"
    )
    # Sí cumple con el filtro (Corral Prueba 3).
    Corral.objects.create(
        codigo="CORRAL-300",
        nombre="Corral Prueba 3"
    )


    response = client.get("/api/corrales/?nombre=Corral Prueba 2")
    assert response.status_code == 200
    assert len(response.data) == 1 # Se espera que haya dos corrales válidas.

    # Se crea una lista con todos los códigos de los corrales que se han obtenido como resultado.
    codigos = [corral["codigo"] for corral in response.data]
    assert "CORRAL-200" in codigos

