# --------------------------------- test_listainseminaciones.py: ---------------------------------
# Funcionalidad: se encarga de comprobar la API
# (ej: crear, modificar, eliminar, mostrar...)
# -----------------------------------------------------------------------------------
import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from ganaderiaBovina.models import Toro, Animal, Corral, InventarioVT, VTAnimales, ListaInseminaciones
from decimal import Decimal


# --------------------------------------------------------------------------------------------------------------
#                                       Test de VTANIMALES: LÓGICA
# --------------------------------------------------------------------------------------------------------------

# Test donde se comprueba que se puede crear una inseminación con datos válidos.
@pytest.mark.django_db
def test_crear_listainseminaciones_valido():
    client = APIClient()

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
        padre=None,
        madre=None,
        corral=Corral.objects.create(nombre="Corral 1")
    )
    toro = Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=50,
        transmision_leche=Decimal("3.0"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )

    datos = {
        "tipo": "Inseminacion",
        "razon": "Celo",
        "fecha_inicio": "2025-03-10",
        "fecha_inseminacion": "2025-03-15",
        "hora_inseminacion": "10:20",
        "responsable": "Pepe",
        "id_vaca": animal.id,
        "id_toro": toro.id,
    }

    response = client.post("/api/listainseminaciones/", datos, format="json")

    assert response.status_code == 201

    # Se comprueba que el código se ha generado correctamente.
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("I-") # Comprueba que el código comience por "I-".
    assert response.data["codigo"][2:].isdigit() # Comprueba que lo que le sigue a "I-" son números.

    # Se comprueba que la inseminación existe en la base de datos.
    assert ListaInseminaciones.objects.filter(codigo=response.data["codigo"]).exists()

    # Se comprueba que el animal (vaca) y toro existe en la base de datos.
    assert Animal.objects.filter(nombre="Vaca Prueba 1").exists()
    assert Toro.objects.filter(nombre="Toro Prueba 1").exists()

    # Comprobar que se ha restado una unidad de semen al toro
    toro.refresh_from_db()
    assert toro.cantidad_semen == 49


# Test para comprobar que debe haber valores en cada uno de los campos.
@pytest.mark.django_db
def test_listainseminaciones_campos_requeridos_vacios():
    client = APIClient()

    datos = {
        "fecha_inseminacion": "",
        "hora_inseminacion": "",
        "responsable": "",
        "id_vaca": None,
        "id_toro": None,
    }

    response = client.post("/api/listainseminaciones/", datos, format="json")

    assert response.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    assert response.data["fecha_inseminacion"][0] == "La fecha de inseminación no es válida. El formato es AAAA-MM-DD."
    assert response.data["hora_inseminacion"][0] == "La hora de inseminación no es válida. El formato es HH:MM:[SS[.mmmmmm]]."
    assert response.data["responsable"][0] == "El responsable no puede estar vacío."
    assert response.data["id_vaca"][0] == "Debe seleccionar una vaca válida."
    assert response.data["id_toro"][0] == "Debe seleccionar un toro válido."

# Test para comprobar que tienen los valores por defecto correctamente.
@pytest.mark.django_db
def test_listainseminaciones_campos_por_defecto():
    client = APIClient()

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
        padre=None,
        madre=None,
        corral=Corral.objects.create(nombre="Corral 1")
    )
    toro = Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=50,
        transmision_leche=Decimal("3.0"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )
    datos = {
        "fecha_inseminacion": "2025-03-15",
        "hora_inseminacion": "10:20",
        "responsable": "Pepe",
        "id_vaca": animal.id,
        "id_toro": toro.id
    }


    response = client.post("/api/listainseminaciones/", datos, format="json")
    assert response.status_code == 201
    assert response.data["tipo"] == "Inseminacion"
    assert response.data["razon"] == "Celo"
    assert response.data["es_sexado"] == True


# Test para comprobar que no se puede inseminar a un animal si el toro no tiene cantidad semen
# suficiente (>=1)
@pytest.mark.django_db
def test_listainseminacion_sin_cantidad_semen():
    client = APIClient()

    # Se crea una vaca para inseminar.
    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 1",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=120000,
        produccion_leche=18.0,
        calidad_patas=Decimal("6.0"),
        calidad_ubres=Decimal("6.0"),
        grasa=4.1,
        proteinas=3.6,
        corral=Corral.objects.create(nombre="Corral Inseminación")
    )

    # Se crea a un toro que no puede inseminar porque tiene 0 cantidad de semen.
    toro = Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=0, # La cantidad de semen es 0.
        transmision_leche=Decimal("2.5"),
        celulas_somaticas=Decimal("1.2"),
        calidad_patas=Decimal("6.5"),
        calidad_ubres=Decimal("6.5"),
        grasa=3.2,
        proteinas=3.0
    )

    datos = {
        "tipo": "Inseminacion",
        "razon": "Programada",
        "fecha_inseminacion": "2025-04-15",
        "hora_inseminacion": "11:00",
        "responsable": "Veterinario X",
        "id_vaca": animal.id,
        "id_toro": toro.id
    }

    response = client.post("/api/listainseminaciones/", datos, format="json")

    assert response.status_code == 400
    assert "id_toro" in response.data
    assert response.data["id_toro"][0] == f"El toro {toro.codigo} no tiene suficiente cantidad de semen para inseminar."

    # Se asegura que no se ha creado ninguna inseminación
    assert ListaInseminaciones.objects.count() == 0

# Test para comprobar si se generan códigos duplicados
@pytest.mark.django_db
def test_codigo_duplicado_listainseminaciones():
    client = APIClient()

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 1",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=120000,
        produccion_leche=18.0,
        calidad_patas=Decimal("6.0"),
        calidad_ubres=Decimal("6.0"),
        grasa=4.1,
        proteinas=3.6,
        corral=Corral.objects.create(nombre="Corral Inseminación")
    )

    toro = Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=20,
        transmision_leche=Decimal("2.5"),
        celulas_somaticas=Decimal("1.2"),
        calidad_patas=Decimal("6.5"),
        calidad_ubres=Decimal("6.5"),
        grasa=3.2,
        proteinas=3.0
    )

    ListaInseminaciones.objects.create(
        codigo="I-100",
        tipo="Inseminacion",
        razon="Celo",
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="11:00",
        responsable="Pepe",
        id_vaca=animal,
        id_toro=toro
    )

    # Se intenta crear un nuevo  con el mismo código ("I-100").
    datos_duplicados = {
        "codigo": "I-100",
        "tipo": "Inseminacion",
        "razon": "Programada",
        "fecha_inseminacion": "2025-04-15",
        "hora_inseminacion": "11:00",
        "responsable": "Pepe",
        "id_vaca": animal.id,
        "id_toro": toro.id
    }

    # Se intenta crear un nuevo listainseminaciones con el mismo código ("I-100").
    response = client.post("/api/listainseminaciones/", datos_duplicados, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data # Error del campo "código"
    assert response.data["codigo"][0] == "El código ya existe en el sistema."  # Se comprueba que se obtiene el mensaje de error personalizado.

# Test para comprobar si se generan códigos con formato incorrecto.
@pytest.mark.django_db
def test_crear_listainseminaciones_codigo_formato_incorrecto():
    client = APIClient()

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba Sin Toro",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=120000,
        produccion_leche=18.0,
        calidad_patas=Decimal("6.0"),
        calidad_ubres=Decimal("6.0"),
        grasa=4.1,
        proteinas=3.6,
        corral=Corral.objects.create(nombre="Corral Inseminación")
    )

    toro = Toro.objects.create(
        nombre="Toro Sin Semen",
        cantidad_semen=20,
        transmision_leche=Decimal("2.5"),
        celulas_somaticas=Decimal("1.2"),
        calidad_patas=Decimal("6.5"),
        calidad_ubres=Decimal("6.5"),
        grasa=3.2,
        proteinas=3.0
    )

    ListaInseminaciones.objects.create(
        codigo="I-100",
        tipo="Inseminacion",
        razon="Celo",
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="11:00",
        responsable="Pepe",
        id_vaca=animal,
        id_toro=toro
    )

    datos_codigo_incorrecto = {
        "codigo": "ABC-999", # Formato de código incorrecto.
        "tipo": "Inseminacion",
        "razon": "Programada",
        "fecha_inseminacion": "2025-04-15",
        "hora_inseminacion": "11:00",
        "responsable": "Pepe",
        "id_vaca": animal.id,
        "id_toro": toro.id
    }

    # Se intenta crear una nueva inseminación con un código incorrecto ("ABC-999").
    response = client.post("/api/listainseminaciones/", datos_codigo_incorrecto, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data # Error del campo "código"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["codigo"][0] == "El código debe tener el formato 'I-número' (Ej: I-1)."

# Test para comprobar que si el usuario no introduce un código, éste se genera de manera automática.
@pytest.mark.django_db
def test_codigo_listainseminaciones_generado_automaticamente():
    client = APIClient()
    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 1",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=120000,
        produccion_leche=18.0,
        calidad_patas=Decimal("6.0"),
        calidad_ubres=Decimal("6.0"),
        grasa=4.1,
        proteinas=3.6,
        corral=Corral.objects.create(nombre="Corral Inseminación")
    )

    toro = Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=20,
        transmision_leche=Decimal("2.5"),
        celulas_somaticas=Decimal("1.2"),
        calidad_patas=Decimal("6.5"),
        calidad_ubres=Decimal("6.5"),
        grasa=3.2,
        proteinas=3.0
    )

    ListaInseminaciones.objects.create(
        codigo="I-100",
        tipo="Inseminacion",
        razon="Celo",
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="11:00",
        responsable="Pepe",
        id_vaca=animal,
        id_toro=toro
    )

    datos = {
        # No se indica el campo "codigo"
        "tipo": "Inseminacion",
        "razon": "Programada",
        "fecha_inseminacion": "2025-04-15",
        "hora_inseminacion": "11:00",
        "responsable": "Pepe",
        "id_vaca": animal.id,
        "id_toro": toro.id
    }

    response = client.post("/api/listainseminaciones/", datos, format='json')

    assert response.status_code == 201
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("I-") # Comprueba que el código comience por "I-".
    assert response.data["codigo"][2:].isdigit() # Comprueba que lo que le sigue a "I-" son números.

    # Se comprueba que haya dos inseminaciones creadas: la existente y la nueva.
    assert ListaInseminaciones.objects.count() == 2


@pytest.mark.django_db
def test_eliminar_listainseminacion_correcta():
    client = APIClient()

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 1",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=110000,
        produccion_leche=19.5,
        calidad_patas=7,
        calidad_ubres=6.5,
        grasa=3.8,
        proteinas=3.4,
        corral=Corral.objects.create(nombre="Corral Insem 1")
    )

    toro = Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=10,
        transmision_leche=Decimal("2.5"),
        celulas_somaticas=Decimal("1.1"),
        calidad_patas=7,
        calidad_ubres=6.8,
        grasa=3.2,
        proteinas=3.1
    )

    inseminacion = ListaInseminaciones.objects.create(
        tipo="Inseminacion",
        razon="Celo",
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="12:30",
        responsable="Veterinario Z",
        id_vaca=animal,
        id_toro=toro
    )

    response = client.delete(f"/api/listainseminaciones/{inseminacion.id}/")


    assert response.status_code == 200
    # Se comprueba que el mensaje personalizado es correcto
    assert response.data["mensaje"] == f"La inseminación {inseminacion.codigo} ha sido eliminada correctamente."
    assert not ListaInseminaciones.objects.filter(id=inseminacion.id).exists()


@pytest.mark.django_db
def test_eliminar_listainseminaciones_no_existente():
    client = APIClient()

    id_inexistente = 9999  # Un ID que seguramente no exista

    response = client.delete(f"/api/listainseminaciones/{id_inexistente}/")

    assert response.status_code == 404
    assert "ERROR" in response.data
    # Se comprueba que el mensaje personalizado es correcto
    assert response.data["ERROR"] == (
        f"La Inseminación {id_inexistente} no se ha encontrado. "
        f"Comprueba el identificador introducido."
    )


# --------------------------------------------------------------------------------------------------------------
#                                       Test de LISTAINSEMINACIONES: FILTRADO
# --------------------------------------------------------------------------------------------------------------

# Test para filtrar por es_sexado de la inseminación.
@pytest.mark.django_db
def test_filtrado_vtanimales_por_es_sexado():
    client = APIClient()

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 1",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=110000,
        produccion_leche=19.5,
        calidad_patas=7,
        calidad_ubres=6.5,
        grasa=3.8,
        proteinas=3.4,
        corral=Corral.objects.create(nombre="Corral Insem 1")
    )

    toro = Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=50,
        transmision_leche=Decimal("2.5"),
        celulas_somaticas=Decimal("1.1"),
        calidad_patas=7,
        calidad_ubres=6.8,
        grasa=3.2,
        proteinas=3.1
    )

    # No cumple con el filtro (es_sexado = False).
    ListaInseminaciones.objects.create(
        codigo="I-100",
        tipo="Inseminacion",
        razon="Celo",
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="12:30",
        es_sexado=True,
        responsable="Pepe",
        id_vaca=animal,
        id_toro=toro
    )
    # Sí cumple con el filtro (es_sexado = False).
    ListaInseminaciones.objects.create(
        codigo="I-200",
        tipo="Inseminacion",
        razon="Celo",
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="12:30",
        responsable="Pepe",
        es_sexado= False,
        id_vaca=animal,
        id_toro=toro
    )
    # No cumple con el filtro (es_sexado = False).
    ListaInseminaciones.objects.create(
        codigo="I-300",
        tipo="Inseminacion",
        razon="Celo",
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="12:30",
        responsable="Pepe",
        es_sexado=True,
        id_vaca=animal,
        id_toro=toro
    )
    # Sí cumple con el filtro (es_sexado = False).
    ListaInseminaciones.objects.create(
        codigo="I-400",
        tipo="Inseminacion",
        razon="Celo",
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="12:30",
        responsable="Pepe",
        es_sexado=False,
        id_vaca=animal,
        id_toro=toro
    )
    response = client.get("/api/listainseminaciones/?es_sexado=False")
    assert response.status_code == 200
    assert len(response.data) == 2 # Se espera que haya dos inseminaciones válidas.

    # Se crea una lista con todos los códigos de las inseminaciones que se han obtenido como resultado.
    codigos = [listainseminaciones["codigo"] for listainseminaciones in response.data]
    assert "I-200" in codigos
    assert "I-400" in codigos


# Test para filtrar por es_sexado de la inseminación.
@pytest.mark.django_db
def test_filtrado_combinado_vtanimales_por_tipo_y_ruta():
    client = APIClient()

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
        corral=Corral.objects.create(nombre="Corral 1")
    )
    toro = Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=50,
        transmision_leche=Decimal("2.5"),
        celulas_somaticas=Decimal("1.1"),
        calidad_patas=7,
        calidad_ubres=6.8,
        grasa=3.2,
        proteinas=3.1
    )

    # Sí cumple ambos filtros
    ListaInseminaciones.objects.create(
        codigo="I-100",
        tipo="Inseminacion",
        razon="Programada", # Sí cumple
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="12:30", # Sí cumple
        responsable="Pepe",
        es_sexado=False,
        id_vaca=animal,
        id_toro=toro
    )
    # No cumple razon
    ListaInseminaciones.objects.create(
        codigo="I-200",
        tipo="Inseminacion",
        razon="Celo", # No cumple
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="13:45",
        responsable="Pepe",
        es_sexado=False,
        id_vaca=animal,
        id_toro=toro
    )
    # No cumple hora
    ListaInseminaciones.objects.create(
        codigo="I-300",
        tipo="Inseminacion",
        razon="Programada",
        fecha_inseminacion="2025-04-15",
        hora_inseminacion="09:00", # No cumple
        responsable="Pepe",
        es_sexado=False,
        id_vaca=animal,
        id_toro=toro
    )

    # Se aplica filtro combinado: hora_inseminacion=10:30 y razon=Programada.
    response = client.get("/api/listainseminaciones/?hora_inseminacion__gte=10:30&razon=Programada")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["codigo"] == "I-100"