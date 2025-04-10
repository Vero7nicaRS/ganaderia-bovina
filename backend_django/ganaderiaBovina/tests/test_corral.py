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
    assert response.data["codigo"][7:].isdigit() # Comprueba que lo que le sigue a "CORRAL-" son números.

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

# Test para comprobar que no puede haber dos corrales con el mismo nombre.
@pytest.mark.django_db
def test_corral_nombre_duplicado():
    client = APIClient()
    Corral.objects.create(nombre="Corral Único")

    datos_duplicados = {
        "nombre": "Corral Único"
    }

    response = client.post("/api/corrales/", datos_duplicados, format="json")

    assert response.status_code == 400
    assert "nombre" in response.data # Error del campo "nombre"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["nombre"][0] == "Ya existe un corral con este nombre."



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
    assert "codigo" in response.data # Error del campo "código"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
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

# Test para comprobar que el número de animales que hay en el corral es el correcto.
@pytest.mark.django_db
def test_corral_actualiza_numero_animales_al_eliminar_animal():
    client = APIClient()
    corral = Corral.objects.create(nombre="Corral Prueba 1")

    animal=Animal.objects.create(
        nombre="Vaca 1",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=20,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=4,
        proteinas=3.5,
        corral=corral
    )
    animal2= Animal.objects.create(
        nombre="Vaca 2",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=20,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=4,
        proteinas=3.5,
        corral=corral)

    # Se comprueba que el número de animales que hay en el corral es 2.
    response = client.get(f"/api/corrales/{corral.id}/")
    assert response.status_code == 200
    assert response.data["cantidad_animales"] == 2

    # Se elimina un animal (animal).
    animal.delete()
    #  Se comprueba que el número de animales que hay en el corral es 1.
    response = client.get(f"/api/corrales/{corral.id}/")
    assert response.status_code == 200
    assert response.data["cantidad_animales"] == 1

    # Se elimina al otro animal (animal2), por tanto no hay ningún animal en el corral.
    animal2.delete()
    # Se comprueba que el número de animales que hay en el corral es 0.
    response = client.get(f"/api/corrales/{corral.id}/")
    assert response.status_code == 200
    assert response.data["cantidad_animales"] == 0

# Test para comprobar que un corral se elimina correctamente al no tener ningún animal.
@pytest.mark.django_db
def test_eliminar_corral_sin_animales():
    client = APIClient()
    corral = Corral.objects.create(nombre="Corral Libre")

    response = client.delete(f"/api/corrales/{corral.id}/")

    assert response.status_code == 200
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
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
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["ERROR"] == f"No se puede eliminar el corral {corral.codigo} porque contiene animales asociados."
    assert Corral.objects.filter(id=corral.id).exists()

# --------------------------------------------------------------------------------------------------------------
#                                       Test de CORRAL: FILTRADO
# --------------------------------------------------------------------------------------------------------------

# Test para filtrar por el nombre del corral.
@pytest.mark.django_db
def test_filtrado_corral_por_nombre():
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


# Test para filtrar por el rango de animales que tiene el corral.
@pytest.mark.django_db
def test_filtrado_corrales_por_rango_animales():
    client = APIClient()

    # No cumple con el filtro (>=2 & <=3).
    corral1 = Corral.objects.create(nombre="Corral Prueba 1") # No tiene ningún animal.

    # No cumple con el filtro (>=2 & <=3).
    corral2 = Corral.objects.create(nombre="Corral Prueba 2") # Tiene 1 animal.
    Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 1",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=4.0,
        proteinas=3.5,
        corral=corral2
    )

    # Sí cumple con el filtro (>=2 & <=3).
    corral3 = Corral.objects.create(nombre="Corral Prueba 3") # Tiene 3 animales.

    Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 2",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=4.0,
        proteinas=3.5,
        corral=corral3
    )
    Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 3",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=4.0,
        proteinas=3.5,
        corral=corral3
    )

    # No cumple con el filtro (>=2 & <=3).
    corral4 = Corral.objects.create(nombre="Corral Prueba 4") # Tiene 5 animales.

    Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 4",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=4.0,
        proteinas=3.5,
        corral=corral4
    )
    Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 5",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=4.0,
        proteinas=3.5,
        corral=corral4
    )
    Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 6",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=4.0,
        proteinas=3.5,
        corral=corral4
    )
    Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 7",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=4.0,
        proteinas=3.5,
        corral=corral4
    )

    # Filtrar por rango: min_animales = 2 y max_animales = 3
    response = client.get("/api/corrales/?min_animales=2&max_animales=3")
    assert response.status_code == 200

    nombres = [corral["nombre"] for corral in response.data]
    assert "Corral Prueba 1" not in nombres
    assert "Corral Prueba 2" not in nombres
    assert "Corral Prueba 3" in nombres
    assert "Corral Prueba 4" not in nombres
