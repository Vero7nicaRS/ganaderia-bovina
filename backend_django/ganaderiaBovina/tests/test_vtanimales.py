# --------------------------------- test_vtanimales.py: ---------------------------------
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


# Test donde se comprueba que se puede crear un tratamiento/vacuna suministrado correctamente con datos válidos.
@pytest.mark.django_db
def test_crear_vtanimales_valido():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo = "VT-100",
        tipo = "Vacuna",
        nombre = "Vacuna Prueba 1",
        unidades = 7,
        cantidad = "Sobre",
        estado = "Activa"
    )
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

    datos = {
        "tipo": "Vacuna",
        "ruta": "Intravenosa",
        "fecha_inicio": "2025-03-10",
        "fecha_finalizacion": "2025-03-15",
        "responsable": "Pepe",
        "dosis": 5,
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    response = client.post("/api/vtanimales/", datos, format="json")

    assert response.status_code == 201

    # Se comprueba que el código se ha generado correctamente.
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("VTA-")
    assert response.data["codigo"][4:].isdigit() # Comprueba que lo que le sigue a "VTA-" son números.

    # Se comprueba que la vacuna/tratamiento existe en la base de datos y tenga como estado "Activa".
    assert InventarioVT.objects.filter(nombre="Vacuna Prueba 1").exists()
    assert inventario.estado == "Activa"

    # Se comprueba que el animal (vaca) existe en la base de datos.
    assert Animal.objects.filter(nombre="Vaca Prueba 1").exists()


# Test para comprobar que debe haber valores en cada uno de los campos.
@pytest.mark.django_db
def test_vtanimales_campos_requeridos_vacios():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo = "VT-100",
        tipo = "Vacuna",
        nombre = "Vacuna Prueba 1",
        unidades = 7,
        cantidad = "Sobre",
        estado = "Activa"
    )
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
    datos = {
        "fecha_inicio": "",
        "fecha_finalizacion": "",
        "responsable": "",
        "dosis": None,
        "id_animal": None,
        "inventario_vt": None,
    }

    response = client.post("/api/vtanimales/", datos, format="json")

    assert response.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    assert response.data["fecha_inicio"][0] == "La fecha de inicio no es válida. El formato es AAAA-MM-DD"
    assert response.data["fecha_finalizacion"][0] == "La fecha de finalización no es válida. El formato es AAAA-MM-DD"
    assert response.data["responsable"][0] == "El responsable no puede estar vacío."
    assert response.data["dosis"][0] == "El número de unidades no puede ser nulo."
    assert response.data["id_animal"][0] == "Se debe seleccionar un identificador de animal válido."
    assert response.data["inventario_vt"][0] == "Se debe seleccionar una vacuna o tratamiento del inventario."


# Test para comprobar que tienen los valores por defecto correctamente.
@pytest.mark.django_db
def test_vtanimales_campos_por_defecto():
    client = APIClient()
    inventario = InventarioVT.objects.create(
        codigo = "VT-100",
        tipo = "Vacuna",
        nombre = "Vacuna Prueba 1",
        unidades = 7,
        cantidad = "Sobre",
        estado = "Activa"
    )
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
    datos = {
        "fecha_inicio": "2024-03-21",
        "fecha_finalizacion": "2024-03-23",
        "responsable": "Pepe",
        "dosis": 3,
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    response = client.post("/api/vtanimales/", datos, format="json")
    assert response.status_code == 201
    assert response.data["tipo"] == "Tratamiento"
    assert response.data["ruta"] == "Intravenosa"

# Test para comprobar los valores fuera de rango
@pytest.mark.django_db
def test_vtanimales_valores_fuera_de_rango():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo = "VT-100",
        tipo = "Vacuna",
        nombre = "Vacuna Prueba 1",
        unidades = 7,
        cantidad = "Sobre",
        estado = "Activa"
    )
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
    # Los datos tienen se sobresalen del rango mínimo.
    datosMin = {
        "fecha_inicio": "2024-03-21",
        "fecha_finalizacion": "2024-03-23",
        "responsable": "Pepe",
        "dosis": 0,
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    # Los datos tienen se sobresalen del rango máximo.
    datosMax = {
        "fecha_inicio": "2024-03-21",
        "fecha_finalizacion": "2024-03-23",
        "responsable": "Pepe",
        "dosis": 10,
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    responseMin = client.post("/api/vtanimales/", datosMin, format="json")
    responseMax = client.post("/api/vtanimales/", datosMax, format="json")

    assert responseMin.status_code == 400
    assert responseMax.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    # MÍNIMO
    assert responseMin.data["dosis"][0] == "La dosis suministrada debe ser mayor a 0."

    # MÁXIMO
    # Se comprueba que no se puedan suministrar más dosis de las que tiene el inventario, es decir,
    # de la que tiene esa vacuna o tratamiento.
    assert responseMax.data["dosis"][0] == (f"No hay suficientes unidades en el inventario. "
                                            f"Disponibles: {inventario.unidades}")


# Test para comprobar si se generan códigos duplicados
@pytest.mark.django_db
def test_codigo_duplicado_vtanimales():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo = "VT-100",
        tipo = "Vacuna",
        nombre = "Vacuna Prueba 1",
        unidades = 7,
        cantidad = "Sobre",
        estado = "Activa"
    )
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
    VTAnimales.objects.create(
        codigo="VTA-100",
        fecha_inicio="2024-03-21",
        fecha_finalizacion="2024-03-23",
        responsable= "Pepe",
        dosis = 2,
        id_animal = animal,
        inventario_vt = inventario
    )
    # Se intenta crear un nuevo  con el mismo código ("VT-100").
    datos_duplicados = {
        "codigo": "VTA-100",
        "fecha_inicio": "2024-03-21",
        "fecha_finalizacion": "2024-03-23",
        "responsable": "Pepe",
        "dosis": 1,
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    # Se intenta crear un nuevo tratamiento/vacuna con el mismo código ("VTA-100").
    response = client.post("/api/vtanimales/", datos_duplicados, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data
    assert response.data["codigo"][0] == "El código ya existe en el sistema."  # Se comprueba que se obtiene el mensaje de error personalizado.

# Test para comprobar si se generan códigos con formato incorrecto.
@pytest.mark.django_db
def test_crear_vtanimales_codigo_formato_incorrecto():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo = "VT-100",
        tipo = "Vacuna",
        nombre = "Vacuna Prueba 1",
        unidades = 7,
        cantidad = "Sobre",
        estado = "Activa"
    )
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

    datos_codigo_incorrecto = {
        "codigo": "ABC-999", # Formato de código incorrecto.
        "fecha_inicio": "2024-03-21",
        "fecha_finalizacion": "2024-03-23",
        "responsable": "Pepe",
        "dosis": 1,
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    # Se intenta crear un nuevo tratamiento/vacuna con un código incorrecto ("VTA-100").
    response = client.post("/api/vtanimales/", datos_codigo_incorrecto, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data # Error del campo "código"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["codigo"][0] == "El código debe tener el formato 'VTA-número' (Ej: VTA-1)."


# Test para comprobar que si el usuario no introduce un código, éste se genera de manera automática.
@pytest.mark.django_db
def test_codigo_vtanimales_generado_automaticamente():
    client = APIClient()
    inventario = InventarioVT.objects.create(
        codigo = "VT-100",
        tipo = "Vacuna",
        nombre = "Vacuna Prueba 1",
        unidades = 7,
        cantidad = "Sobre",
        estado = "Activa"
    )
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
    datos = {
        # No se indica el campo "codigo"
        "fecha_inicio": "2024-03-21",
        "fecha_finalizacion": "2024-03-23",
        "responsable": "Pepe",
        "dosis": 1,
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    response = client.post("/api/vtanimales/", datos, format='json')

    assert response.status_code == 201
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("VTA-") # Comprueba que el código comience por "VTA-".
    assert response.data["codigo"][4:].isdigit() # Comprueba que lo que le sigue a "VTA-" son números.

# Test para comprobar que si se selecciona un tipo distinto en el inventario y en la vacuna/tratamiento suministrado,
# se muestra un mensaje de error.
@pytest.mark.django_db
def test_vtanimales_inventario_inactivo_no_permitido():
    client = APIClient()

    # Se crea una vacuna con el estado "INACTIVO"
    inventario = InventarioVT.objects.create(
        codigo="VT-100",
        tipo="Vacuna",
        nombre="Vacuna Prueba 1",
        unidades=7,
        cantidad="Sobre",
        estado="Inactiva" # El estado de la vacuna/tratamiento está "INACTIVO"
    )

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

    datos = {
        "codigo": "VTA-100",
        "tipo":"Vacuna",
        "fecha_inicio": "2024-03-21",
        "fecha_finalizacion": "2024-03-23",
        "responsable": "Pepe",
        "dosis": 1,
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    response = client.post("/api/vtanimales/", datos, format="json")

    assert response.status_code == 400
    mensaje_error = (
        f"{'El' if datos['tipo'].lower() == 'tratamiento' else 'La'} "
        f"{datos['tipo'].lower()} suministrad{'o' if datos['tipo'].lower() == 'tratamiento' else 'a'} "
        f"tiene el estado 'Inactivo' y por tanto, no se puede usar."
    )
    assert response.data["estado"][0] == mensaje_error
    #assert response.data["estado"][0] == (
    #    f"{'El' if inventario.tipo == 'tratamiento' else 'La'} "
    #    f"{inventario.tipo} suministrad{'o' if inventario.tipo == 'tratamiento' else 'a'}"
    #    f" tiene el estado 'Inactivo' y por tanto, no se puede usar."
    #)

@pytest.mark.django_db
def test_vtanimales_tipo_no_coincide_con_inventario():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo="VT-100",
        tipo="Tratamiento",  # Se indica que es un "Tratamiento" el inventario.
        nombre="Tratamiento Prueba",
        unidades=10,
        cantidad="Botella",
        estado="Activa"
    )

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba 1",
        fecha_nacimiento="2022-03-21",
        celulas_somaticas=110000,
        produccion_leche=21.0,
        calidad_patas=Decimal("6.5"),
        calidad_ubres=Decimal("7.0"),
        grasa=4.2,
        proteinas=3.7,
        corral=Corral.objects.create(nombre="Corral 1")
    )

    datos = {
        "codigo": "VTA-100",
        "tipo": "Vacuna",  # No coincide con el tipo del inventario, ya que el del inventario es "Tratamiento.
        "fecha_inicio": "2024-03-21",
        "fecha_finalizacion": "2024-03-23",
        "responsable": "Pepe",
        "dosis": 1,
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    response = client.post("/api/vtanimales/", datos, format="json")

    assert response.status_code == 400
    mensaje_error = (
        f"El tipo '{datos['tipo'].lower()}' seleccionado no coincide con el tipo del inventario: {inventario.tipo}."
    )
    assert response.data["tipo"][0] == mensaje_error



# Test para eliminar una vacuna/tratamiento suministrado correctamente.
@pytest.mark.django_db
def test_codigo_vtanimales_eliminacion_correcta():
    client = APIClient()
    inventario = InventarioVT.objects.create(
        codigo="VT-100",
        tipo="Vacuna",
        nombre="Vacuna Prueba 1",
        unidades=7,
        cantidad="Sobre",
        estado="Activa"
    )

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

    datos = VTAnimales.objects.create(
        codigo="VTA-100",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-03-21",
        fecha_finalizacion="2024-03-23",
        responsable="Pepe",
        dosis=1,
        id_animal=animal,
        inventario_vt=inventario
    )
    response = client.delete(f"/api/vtanimales/{datos.id}/")
    assert response.status_code == 200
    assert not VTAnimales.objects.filter(id=datos.id).exists()

    # Se comprueba que el mensaje personalizado es correcto
    assert response.data["ERROR"] == f"La vacuna suministrada {datos.codigo} ha sido eliminada correctamente."

# Test para comprobar que no se puede eliminar una vacuna/tratamiento suministrado inexistente.
@pytest.mark.django_db
def test_eliminar_vtanimales_no_existente():
    client = APIClient()

    id_inexistente = 9999  # Un ID que seguramente no exista

    response = client.delete(f"/api/vtanimales/{id_inexistente}/")

    assert response.status_code == 404
    assert "ERROR" in response.data
    # Se comprueba que el mensaje personalizado es correcto
    assert response.data["ERROR"] == (
        f"El tratamiento/la vacuna suministrada {id_inexistente} no se ha encontrado. "
        f"Comprueba el identificador introducido."
    )


# --------------------------------------------------------------------------------------------------------------
#                                       Test de VTANIMALES: FILTRADO
# --------------------------------------------------------------------------------------------------------------

# Test para filtrar por las dosis de las vacunas/tratamientos suministrados.
@pytest.mark.django_db
def test_filtrado_vtanimales_por_rango_dosis():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo="VT-100",
        tipo="Vacuna",
        nombre="Vacuna Prueba 1",
        unidades=20,
        cantidad="Sobre",
        estado="Activa"
    )

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
    # No cumple con el filtro (>=6).
    VTAnimales.objects.create(
        codigo="VTA-100",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-03-21",
        fecha_finalizacion="2024-03-23",
        responsable="Pepe",
        dosis=1,
        id_animal=animal,
        inventario_vt=inventario
    )

    # Sí cumple con el filtro (>=6).
    VTAnimales.objects.create(
        codigo="VTA-200",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-03-21",
        fecha_finalizacion="2024-03-23",
        responsable="Pepe",
        dosis=7,
        id_animal=animal,
        inventario_vt=inventario
    )

    # No cumple con el filtro (>=6).
    VTAnimales.objects.create(
        codigo="VTA-300",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-03-21",
        fecha_finalizacion="2024-03-23",
        responsable="Pepe",
        dosis=5,
        id_animal=animal,
        inventario_vt=inventario
    )

    # Sí cumple con el filtro (>=6).
    VTAnimales.objects.create(
        codigo="VTA-400",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-03-21",
        fecha_finalizacion="2024-03-23",
        responsable="Pepe",
        dosis=6,
        id_animal=animal,
        inventario_vt=inventario
    )

    response = client.get("/api/vtanimales/?dosis__gte=6")
    assert response.status_code == 200
    assert len(response.data) == 2 # Se espera que haya dos vacunas/tratamientos válidas.

    # Se crea una lista con todos los nombres de las vacunas/tratamientos que se han obtenido como resultado.
    codigos = [vtanimales["codigo"] for vtanimales in response.data]
    assert "VTA-200" in codigos
    assert "VTA-400" in codigos


# Test para filtrar por el tipo y ruta de las vacunas/tratamientos suministrados.
@pytest.mark.django_db
def test_filtrado_combinado_vtanimales_por_tipo_y_ruta():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo="VT-100",
        tipo="Vacuna",
        nombre="Vacuna Prueba 1",
        unidades=20,
        cantidad="Sobre",
        estado="Activa"
    )

    inventario2 = InventarioVT.objects.create(
        codigo="VT-200",
        tipo="Tratamiento",
        nombre="Tratamiento Prueba 1",
        unidades=20,
        cantidad="Botella",
        estado="Activa"
    )

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
    # Sí cumple ambos filtros
    VTAnimales.objects.create(
        codigo="VTA-100",
        tipo="Vacuna", #Sí
        ruta="Intramamaria", #Sí
        fecha_inicio="2024-03-21",
        fecha_finalizacion="2024-03-23",
        responsable="Pepe",
        dosis=1,
        id_animal=animal,
        inventario_vt=inventario
    )

    # No cumple ruta
    VTAnimales.objects.create(
        codigo="VTA-200",
        tipo="Vacuna",
        ruta="Subcutánea", # No
        fecha_inicio="2024-03-21",
        fecha_finalizacion="2024-03-23",
        responsable="Pepe",
        dosis=1,
        id_animal=animal,
        inventario_vt=inventario
    )

    # No cumple tipo
    VTAnimales.objects.create(
        codigo="VTA-300",
        tipo="Tratamiento", # No
        ruta="Oral",
        fecha_inicio="2024-03-21",
        fecha_finalizacion="2024-03-23",
        responsable="Pepe",
        dosis=1,
        id_animal=animal,
        inventario_vt=inventario2
    )

    # Se aplica filtro combinado: tipo = Vacuna y ruta = Intramamaria
    response = client.get("/api/vtanimales/?tipo=Vacuna&ruta=Intramamaria")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["codigo"] == "VTA-100"