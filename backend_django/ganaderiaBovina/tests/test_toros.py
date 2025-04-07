# --------------------------------- test_toros.py: ---------------------------------
# Funcionalidad: se encarga de comprobar la API
# (ej: crear, modificar, eliminar, mostrar...)
# -----------------------------------------------------------------------------------
import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from ganaderiaBovina.models import Toro, Animal, Corral, InventarioVT, VTAnimales, ListaInseminaciones
from decimal import Decimal


# --------------------------------------------------------------------------------------------------------------
#                                       Test de TOROS
# --------------------------------------------------------------------------------------------------------------

# Test donde se comprueba que se puede crear un toro correctamente con datos válidos.
@pytest.mark.django_db
def test_crear_toro_valido():
    client = APIClient()

    datos = {
        "nombre": "ToroPrueba",
        "cantidad_semen": 100,
        "transmision_leche": Decimal("2.5"),
        "celulas_somaticas": Decimal("1.0"),
        "calidad_patas": Decimal("8.0"),
        "calidad_ubres": Decimal("7.0"),
        "grasa": 3.6,
        "proteinas": 3.2
    }

    response = client.post(reverse("toro-list"), datos, format="json")

    assert response.status_code == 201
    assert "codigo" in response.data
    assert response.data["nombre"] == "ToroPrueba"
    assert response.data["codigo"].startswith("T-")
    # assert response.data["codigo"][2:].isdigit() # Comprueba que lo que le sigue a "T-" son números.

# Test para comprobar que debe haber valores en cada uno de los campos.
@pytest.mark.django_db
def test_toro_campos_requeridos_vacios():
    client = APIClient()

    datos = {
        "nombre": "",  # Vacío
        "cantidad_semen": "",
        "transmision_leche": "",
        "celulas_somaticas": "",
        "calidad_patas": "",
        "calidad_ubres": "",
        "grasa": "",
        "proteinas": ""
    }

    response = client.post("/api/toros/", datos, format="json")

    assert response.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    assert response.data["nombre"][0] == "El nombre no puede estar vacío."
    assert response.data["cantidad_semen"][0] == "Debe introducir un número válido."
    assert response.data["transmision_leche"][0] == "Debe introducir un número válido."
    assert response.data["celulas_somaticas"][0] == "Debe introducir un número entero válido."
    assert response.data["calidad_patas"][0] == "Debe ser un número decimal entre 1 y 9."
    assert response.data["calidad_ubres"][0] == "Debe ser un número decimal entre 1 y 9."
    assert response.data["grasa"][0] == "Debe introducir un número válido."
    assert response.data["proteinas"][0] == "Debe introducir un número válido."

# Test para comprobar los valores fuera de rango
@pytest.mark.django_db
def test_toro_valores_fuera_de_rango():
    client = APIClient()

    datos = {
        "nombre": "ToroRango",
        "cantidad_semen": -10,  # Valor negativo.
        "transmision_leche": "no es decimal",  # Tipo inválido
        "celulas_somaticas": "texto",  # Tipo inválido
        "calidad_patas": 10.0,  # Mayor a 9
        "calidad_ubres": 0.5,  # Menor a 1
        "grasa": "mucho",  # Tipo inválido
        "proteinas": None  # Campo requerido
    }

    response = client.post("/api/toros/", datos, format="json")
    assert response.status_code == 400

    assert response.data["cantidad_semen"][0] == "El valor mínimo permitido es 0."
    assert response.data["transmision_leche"][0] == "Debe introducir un número válido."
    assert response.data["celulas_somaticas"][0] == "Debe introducir un número entero válido."
    assert response.data["calidad_patas"][0] == "El valor máximo permitido es 9."
    assert response.data["calidad_ubres"][0] == "El valor mínimo permitido es 1."
    assert response.data["grasa"][0] == "Debe introducir un número válido."
    assert response.data["proteinas"][0] == "El porcentaje de proteínas no puede ser nulo."


# Test para comprobar si se generan códigos duplicados
@pytest.mark.django_db
def test_codigo_duplicado_animal():
    client = APIClient()

    # Se crea un toro indicándole un código en específico ("T-100").
    Toro.objects.create(
        codigo = "T-100",
        nombre = "ToroPrueba",
        cantidad_semen = 100,
        transmision_leche = Decimal("2.5"),
        celulas_somaticas = Decimal("1.0"),
        calidad_patas = Decimal("8.0"),
        calidad_ubres = Decimal("7.0"),
        grasa = 3.6,
        proteinas = 3.2
    )

    # Se intenta crear un nuevo toro con el mismo código ("V-100").
    datos_duplicados = {
        "codigo" : "T-100",
        "nombre": "ToroPrueba",
        "cantidad_semen": 100,
        "transmision_leche": Decimal("2.5"),
        "celulas_somaticas": Decimal("1.0"),
        "calidad_patas": Decimal("8.0"),
        "calidad_ubres": Decimal("7.0"),
        "grasa": 3.6,
        "proteinas": 3.2
    }

    response = client.post("/api/toros/", datos_duplicados, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data
    assert response.data["codigo"][0] == "El código ya existe en el sistema."  # Se comprueba que se obtiene el mensaje de error personalizado.

# Comprobar código con formato incorrecto.
@pytest.mark.django_db
def test_crear_toro_codigo_formato_incorrecto():
    client = APIClient()

    Toro.objects.create(
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

    datos_codigo_incorrecto = {
        "codigo": "ABC-999", # Formato de código incorrecto.
        "nombre": "ToroIncorrecto",
        "estado": "Vivo",
        "cantidad_semen": 50,
        "transmision_leche": 2.0,
        "celulas_somaticas": 3,
        "calidad_patas": 4.0,
        "calidad_ubres": 3.0,
        "grasa": 4.0,
        "proteinas": 3.5,
    }

    response = client.post("/api/toros/", datos_codigo_incorrecto, format="json")

    assert response.status_code == 400
    assert "codigo" in response.data # Error del campo "código"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["codigo"][0] == "El código debe tener el formato 'T-número' (Ej: T-1)."


# Test para comprobar que si el usuario no introduce un código, éste se genera de manera automática.
@pytest.mark.django_db
def test_codigo_generado_automaticamente():
    client = APIClient()
    datos = {
        # No se indica el campo "codigo"
        "nombre": "ToroSinCodigo",
        "estado": "Vivo",
        "cantidad_semen": 50,
        "transmision_leche": 2.0,
        "celulas_somaticas": 2,
        "calidad_patas": 4.0,
        "calidad_ubres": 3.0,
        "grasa": 4.0,
        "proteinas": 3.5,
    }

    response = client.post("/api/toros/", datos, format="json")

    assert response.status_code == 201
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("T-") # Comprueba que el código comience por "T-".
    assert response.data["codigo"][2:].isdigit() # Comprueba que lo que le sigue a "T-" son números.


# Test para comprobar la eliminación de un Toro por el motivo "ERROR"
# ¿Qué se verifica?
# - Toro eliminado de la base de datos.
# - Ya no tiene ningún corral asignado.
# - El historial de VTAnimales y ListaInseminaciones se mantiene a null (FK).
@pytest.mark.django_db
def test_eliminar_toro_error():
    client = APIClient()

    # Creamos un toro
    toro = Toro.objects.create(
        nombre="ToroEliminar",
        cantidad_semen=100,
        transmision_leche=2.5,
        celulas_somaticas=0.8,
        calidad_patas=7.5,
        calidad_ubres=8.0,
        grasa=4.0,
        proteinas=3.4
    )

    # Creamos una vaca asociada para poder crear inseminación
    vaca = Animal.objects.create(
        nombre="VacaPrueba",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=25.0,
        calidad_patas=6.5,
        calidad_ubres=7.0,
        grasa=4.1,
        proteinas=3.6,
    )

    # Creamos una inseminación con el toro que vamos a eliminar
    inseminacion = ListaInseminaciones.objects.create(
        id_vaca=vaca,
        id_toro=toro,
        razon="Celo",
        fecha_inseminacion="2025-04-01",
        hora_inseminacion="12:00",
        es_sexado=True,
        responsable="Veterinario A"
    )

    response = client.delete(f"/api/toros/{toro.id}/eliminar/?motivo=ERROR")

    assert response.status_code == 204
    assert not Toro.objects.filter(id=toro.id).exists() # Se compruebe que ese toro NO existe en la base de datos.

    # Se comprueba que no haya habido modificaciones en la lista de inseminación
    inseminacion.refresh_from_db()
    assert ListaInseminaciones.objects.filter(id_vaca=vaca).exists()
    assert inseminacion.id_toro is None
