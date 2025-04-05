# --------------------------------- test_views.py: ---------------------------------
# Funcionalidad: se encarga de comprobar la API
# (ej: crear, modificar, eliminar, mostrar...)
# -----------------------------------------------------------------------------------

import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from ganaderiaBovina.models import Toro, Animal, Corral
from decimal import Decimal


# --------------------------------------------------------------------------------------------------------------
#                                       Test de ANIMALES
# --------------------------------------------------------------------------------------------------------------

# Se comprueba que se puede crear un animal (vaca/ternero) correctamente con datos válidos.
@pytest.mark.django_db
def test_crear_animal_valido():
    client = APIClient()

    # Crear Toro y Corral necesarios para relaciones FK
    toro = Toro.objects.create(
        codigo="T-1",
        nombre="ToroPrueba",
        cantidad_semen=100,
        celulas_somaticas=Decimal("2.35"),
        transmision_leche=Decimal("15.42"),
        calidad_patas=Decimal("8.00"),
        calidad_ubres=Decimal("7.25"),
        grasa=4.0,
        proteinas=3.5
    )

    madre = Animal.objects.create(
        codigo="V-1",
        tipo="Vaca",
        estado="Vacía",
        nombre="VacaMadre",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=25,
        calidad_patas=7,
        calidad_ubres=6,
        grasa=4,
        proteinas=3.5
    )

    corral = Corral.objects.create(nombre="Corral 1")

    # Datos válidos para el animal
    data = {
        "tipo": "Ternero",
        "estado": "Joven",
        "nombre": "BebéVaquita",
        "fecha_nacimiento": "2024-01-01",
        "padre": toro.id,
        "madre": madre.id,
        "corral": corral.id,
        "celulas_somaticas": 100000,
        "produccion_leche": 10,
        "calidad_patas": 7.25,
        "calidad_ubres": 6.5,
        "grasa": 4.0,
        "proteinas": 3.2
    }

    response = client.post(reverse("animal-list"), data, format="json")

    assert response.status_code == 201
    assert Animal.objects.filter(nombre="BebéVaquita").exists()

# Comprobar que debe haber valores en cada uno de los campos.
@pytest.mark.django_db
def test_animal_campos_requeridos_vacios():
    client = APIClient()
    datos = {
        "tipo": "Vaca",
        "estado": "Vacía",
        "nombre": "",  # Campo obligatorio vacío
        "fecha_nacimiento": "",
        "celulas_somaticas": "",
        "produccion_leche": "",
        "calidad_patas": "",
        "calidad_ubres": "",
        "grasa": "",
        "proteinas": "",
        "padre": None,
        "madre": None,
        "corral": None
    }

    response = client.post("/api/animales/", datos, format='json')
    assert response.status_code == 400
    # Se comprueba que se obtienen los mensajes de error personalizado.
    assert response.data['nombre'][0] == "El nombre no puede estar vacío."
    assert response.data['fecha_nacimiento'][0] == "La fecha de nacimiento no es válida. El formato es AAAA-MM-DD"
    assert response.data['celulas_somaticas'][0] == "Debe introducir un número entero válido."
    assert response.data['produccion_leche'][0] == "Debe introducir un número válido."
    assert response.data['calidad_patas'][0] == "Debe ser un número decimal entre 1 y 9."
    assert response.data['calidad_ubres'][0] == "Debe ser un número decimal entre 1 y 9."
    assert response.data['grasa'][0] == "Debe introducir un número válido."
    assert response.data['proteinas'][0] == "Debe introducir un número válido."
    assert response.data['padre'][0] == "Debe seleccionar un padre válido."
    assert response.data['madre'][0] == "Debe seleccionar una madre válida."
    assert response.data['corral'][0] == "Debe seleccionar un corral válido."

# Valores fuera de rango
@pytest.mark.django_db
def test_animal_valores_fuera_de_rango():
    client = APIClient()

    toro = Toro.objects.create(
        codigo="T-1",
        nombre="ToroPrueba",
        estado="Vivo",
        cantidad_semen=100,
        transmision_leche=3.0,
        celulas_somaticas=1.0,
        calidad_patas=7.0,
        calidad_ubres=7.0,
        grasa=4.0,
        proteinas=3.5
    )

    madre = Animal.objects.create(
        codigo="V-100",
        tipo="Vaca",
        estado="Vacía",
        nombre="MadrePrueba",
        fecha_nacimiento="2024-01-01",
        celulas_somaticas=100000,
        produccion_leche=20,
        calidad_patas=5,
        calidad_ubres=6,
        grasa=4,
        proteinas=3.5,
        padre=toro,
        corral=Corral.objects.create(nombre="Corralito")
    )

    datos = {
        "tipo": "Vaca",
        "estado": "Vacía",
        "nombre": "Vaquita",
        "fecha_nacimiento": "2024-01-01",
        "celulas_somaticas": 9999999,  # Muy alto
        "produccion_leche": -5,        # Negativo
        "calidad_patas": 15,           # Mayor a 9
        "calidad_ubres": 0.5,          # Menor a 1
        "grasa": 10,                   # Mayor a 6
        "proteinas": 1.5,              # Menor a 2.8
        "padre": toro.id,
        "madre": madre.id,
        "corral": madre.corral.id
    }

    response = client.post("/api/animales/", datos, format='json')
    assert response.status_code == 400

    # Se comprueba que se obtienen los mensajes de error personalizado.
    assert response.data['celulas_somaticas'][0] == "El valor máximo permitido es 2000000."
    assert response.data['produccion_leche'][0] == "El valor mínimo permitido es 0."
    assert response.data['calidad_patas'][0] == "El valor máximo permitido es 9."
    assert response.data['calidad_ubres'][0] == "El valor mínimo permitido es 1."
    assert response.data['grasa'][0] == "El valor máximo permitido es 6."
    assert response.data['proteinas'][0] == "El valor mínimo permitido es 2.8."

# TEST QUE INCLUYE TODO
# Se comprueba que se NO se puede crear un animal (vaca/ternero) correctamente con datos no válidos.
@pytest.mark.django_db
def test_crear_animal_datos_invalidos():
    client = APIClient()

    datos_invalidos = {
        "tipo": "Vaca",
        "estado": "Vacía",
        "nombre": "",  # Vacío
        "fecha_nacimiento": "2025-03-07",
        "celulas_somaticas": "",  # Inválido
        "produccion_leche": "no es un número",  # Inválido
        "calidad_patas": 10,  # Fuera de rango permitido
        "calidad_ubres": 5.5,
        "grasa": 4.0,
        "proteinas": 4.0,
        "padre": None,
        "madre": None,
        "corral": None,
    }

    response = client.post("/api/animales/", datos_invalidos, format='json')

    assert response.status_code == 400
    assert "nombre" in response.data
    assert "celulas_somaticas" in response.data
    assert "produccion_leche" in response.data
    assert "calidad_patas" in response.data
    assert "padre" in response.data
    assert "madre" in response.data
    assert "corral" in response.data




# Comprobar código duplicado
@pytest.mark.django_db
def test_codigo_duplicado_animal():
    client = APIClient()

    # Se crea el toro, vaca y corral.
    toro = Toro.objects.create(
        codigo="T-100",
        nombre="ToroTest",
        estado="Vivo",
        cantidad_semen=100,
        transmision_leche=3.0,
        celulas_somaticas=1.0,
        calidad_patas=5.5,
        calidad_ubres=6.0,
        grasa=4.0,
        proteinas=3.5
    )
    madre = Animal.objects.create(
        codigo="V-999", tipo="Vaca", estado="Vacía", nombre="MadreTest",
        fecha_nacimiento="2020-01-01", celulas_somaticas=100000,
        produccion_leche=20.0, calidad_patas=5.5, calidad_ubres=5.5,
        grasa=4.0, proteinas=3.5, padre=toro, corral=None
    )
    corral = Corral.objects.create(nombre="CorralTest")

    # Se crea un animal indicándole un código en específico (escrito).
    Animal.objects.create(
        codigo="V-100", tipo="Vaca", estado="Vacía", nombre="Vaquita",
        fecha_nacimiento="2025-01-01", celulas_somaticas=100000,
        produccion_leche=20.0, calidad_patas=5.5, calidad_ubres=6.0,
        grasa=4.0, proteinas=3.5, padre=toro, madre=madre, corral=corral
    )

    # Se intenta crear un animal con el mismo código.
    datos_duplicados = {
        "codigo": "V-100",
        "tipo": "Vaca",
        "estado": "Vacía",
        "nombre": "VaquitaDuplicada",
        "fecha_nacimiento": "2025-01-02",
        "celulas_somaticas": 100000,
        "produccion_leche": 18.0,
        "calidad_patas": 5.0,
        "calidad_ubres": 5.0,
        "grasa": 4.0,
        "proteinas": 3.5,
        "padre": toro.id,
        "madre": madre.id,
        "corral": corral.id
    }

    response = client.post("/api/animales/", datos_duplicados, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data
    assert response.data["codigo"][0] == "El código ya existe en el sistema."  # Se comprueba que se obtiene el mensaje de error personalizado.

# Comprobar código con formato incorrecto.
@pytest.mark.django_db
def test_crear_animal_codigo_formato_incorrecto():
    client = APIClient()

    toro = Toro.objects.create(
        codigo="T-1",
        nombre="ToroPrueba",
        cantidad_semen=100,
        transmision_leche=3.0,
        celulas_somaticas=1.0,
        calidad_patas=5.5,
        calidad_ubres=6.0,
        grasa=4.0,
        proteinas=3.5
    )

    madre = Animal.objects.create(
        codigo="V-100",
        tipo="Vaca",
        estado="Vacía",
        nombre="Madre",
        fecha_nacimiento="2024-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7.5,
        calidad_ubres=8.0,
        grasa=4.0,
        proteinas=3.5,
        padre=toro,
        madre=None,
        corral=None
    )

    corral = Corral.objects.create(nombre="Corral A")

    animal_data = {
        "codigo": "ABC-999",  # Formato de código incorrecto.
        "tipo": "Vaca",
        "estado": "Vacía",
        "nombre": "Nueva vaca",
        "fecha_nacimiento": "2025-03-10",
        "celulas_somaticas": 100000,
        "produccion_leche": 23.0,
        "calidad_patas": 7.25,
        "calidad_ubres": 6.8,
        "grasa": 4.0,
        "proteinas": 4.0,
        "padre": toro.id,
        "madre": madre.id,
        "corral": corral.id
    }

    response = client.post("/api/animales/", animal_data, format="json")

    assert response.status_code == 400
    assert "codigo" in response.data # Error del campo "código"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["codigo"][0] == "El código debe tener el formato 'V-número' (Ej: V-1)."
