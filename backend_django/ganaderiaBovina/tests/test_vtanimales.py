# --------------------------------- test_vtanimales.py: ---------------------------------
# Funcionalidad: se encarga de comprobar la API
# (ej: crear, modificar, eliminar, mostrar...)
# -----------------------------------------------------------------------------------
import pytest
from rest_framework.test import APIClient
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
        "id_animal": None,
        "inventario_vt": None,
    }

    response = client.post("/api/vtanimales/", datos, format="json")

    assert response.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    assert response.data["fecha_inicio"][0] == "La fecha de inicio no es válida. El formato es AAAA-MM-DD"
    assert response.data["fecha_finalizacion"][0] == "La fecha de finalización no es válida. El formato es AAAA-MM-DD"
    assert response.data["responsable"][0] == "El responsable no puede estar vacío."
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
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    response = client.post("/api/vtanimales/", datos, format="json")
    assert response.status_code == 201
    assert response.data["tipo"] == "Tratamiento"
    assert response.data["ruta"] == "Intravenosa"


@pytest.mark.django_db
def test_vtanimales_fecha_finalizacion_antes_de_fecha_inicio():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        nombre="Vacuna Prueba 1",
        tipo="Vacuna",
        unidades=10,
        cantidad="Sobre",
        estado="Activa"
    )

    animal = Animal.objects.create(
        nombre="Vaca Prueba 1",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=120000,
        produccion_leche=20.0,
        calidad_patas=7,
        calidad_ubres=6.5,
        grasa=4.1,
        proteinas=3.6,
        corral=Corral.objects.create(nombre="Corral 1")
    )

    datos = {
        "tipo": "Vacuna",
        "ruta": "Oral",
        "fecha_inicio": "2025-04-10", # posterior a la fecha de finalización
        "fecha_finalizacion": "2025-04-05",  # anterior a la fecha de inicio
        "responsable": "Veterinario Luis",
        "inventario_vt": inventario.id,
        "id_animal": animal.id
    }

    response = client.post("/api/vtanimales/", datos, format="json")
    assert response.status_code == 400
    assert "fecha_finalizacion" in response.data
    assert response.data["fecha_finalizacion"][0] == "La fecha de finalización debe ser posterior a la fecha de inicio."


# Test para comprobar que al suministrar una vacuna/tratamiento se restan correctamente las unidades en el inventario.
@pytest.mark.django_db
def test_vtanimales_resta_unidades_inventario():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo="VT-22",  # CÓDIGO ÚNICO para evitar choques
        tipo="Vacuna",
        nombre="Vacuna Unidades Test",
        unidades=10,
        cantidad="Sobre",
        estado="Activa"
    )

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Unidades Test",
        fecha_nacimiento="2024-01-01",
        celulas_somaticas=150000,
        produccion_leche=25.0,
        calidad_patas=Decimal("6.5"),
        calidad_ubres=Decimal("7.0"),
        grasa=4.0,
        proteinas=3.5,
        corral=Corral.objects.create(nombre="Corral Unidades Test")
    )

    datos = {
        "tipo": "Vacuna",
        "ruta": "Intramuscular",
        "fecha_inicio": "2025-04-01",
        "fecha_finalizacion": "2025-04-05",
        "responsable": "Veterinario Antonio",
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    response = client.post("/api/vtanimales/", datos, format="json")
    assert response.status_code == 201

    inventario.refresh_from_db()
    assert inventario.unidades == 9  # 10 - 1


# Test para comprobar que no se puede crear una vacuna/tratamiento suministrado
# si esa vacuna/tratamiento en el inventario no tiene ninguna unidad, es decir, 0.
@pytest.mark.django_db
def test_vtanimales_no_crear_con_unidades_negativas():
    client = APIClient()

    # Crear un inventario con 0 unidades disponibles
    inventario = InventarioVT.objects.create(
        codigo="VT-101",
        tipo="Vacuna",
        nombre="Vacuna Prueba 1",
        unidades=0,  # 0 unidades.
        cantidad="Sobre",
        estado="Activa"
    )

    # Crear un animal para suministrar la vacuna
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

    # Intentar suministrar 1 dosis (más de las que hay)
    datos = {
        "tipo": "Vacuna",
        "ruta": "Intravenosa",
        "fecha_inicio": "2025-03-10",
        "fecha_finalizacion": "2025-03-15",
        "responsable": "Veterinario Prueba",
         # Intentamos usar más dosis de las que hay
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    response = client.post("/api/vtanimales/", datos, format="json")

    # Se debe rechazar la operación
    assert response.status_code == 400
    assert "inventario_vt" in response.data
    assert response.data["inventario_vt"] == (
        f"No hay suficientes unidades disponibles de {inventario.tipo.lower()} '"
        f"{inventario.nombre}'."
    )
    # Verificar que las unidades en el inventario NO han cambiado
    inventario.refresh_from_db()
    assert inventario.unidades == 0

# Test para comprobar que al modificar una vacuna/tratamiento suministrado a un animal
# que tiene 0 unidades actualmente, si cambiamos cualquier otro dato se puede modificar.
# Ya que no debe afectar que la vacuna/tratamiento suministrado tenga 0 unidades.
@pytest.mark.django_db
def test_modificar_vtanimales_sin_cambiar_inventario_con_unidades_0():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo="VT-200",
        tipo="Vacuna",
        nombre="Vacuna Existente",
        unidades=0,  # 0 unidades.
        cantidad="Dosis",
        estado="Activa"
    )

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=120000,
        produccion_leche=19.5,
        calidad_patas=Decimal("7.5"),
        calidad_ubres=Decimal("7.5"),
        grasa=4.0,
        proteinas=3.6,
        corral=Corral.objects.create(nombre="Corral Test")
    )

    vt_registro = VTAnimales.objects.create(
        codigo="VTA-10",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-04-01",
        fecha_finalizacion="2024-04-05",
        responsable="Veterinario Prueba",
        id_animal=animal,
        inventario_vt=inventario
    )

    # Se modifca la ruta de la vacuna/tratamiento suministrado, sin cambiar esa vacuna.
    datos_modificados = {
        "tipo": "Vacuna",
        "ruta": "Intramuscular",  # Se cambia la ruta de "Oral" a "Intramuscular".
        "fecha_inicio": "2024-04-01",
        "fecha_finalizacion": "2024-04-05",
        "responsable": "Veterinario Prueba",
        "id_animal": animal.id,
        "inventario_vt": inventario.id
    }

    response = client.put(f"/api/vtanimales/{vt_registro.id}/", datos_modificados, format="json")
    assert response.status_code == 200
    assert response.data["ruta"] == "Intramuscular"

# Test para comprobar que no se puede modificar una vacuna a otra que no tenga unidades.
@pytest.mark.django_db
def test_modificar_vtanimales_cambiando_a_inventario_sin_unidades():
    client = APIClient()

    inventario_con_unidades = InventarioVT.objects.create(
        codigo="VT-1",
        tipo="Vacuna",
        nombre="Vacuna Origen",
        unidades=5, # 5 unidades.
        cantidad="Dosis",
        estado="Activa"
    )

    inventario_sin_unidades = InventarioVT.objects.create(
        codigo="VT-2",
        tipo="Vacuna",
        nombre="Vacuna Destino",
        unidades=0, # 0 unidades.
        cantidad="Dosis",
        estado="Activa"
    )

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=120000,
        produccion_leche=19.5,
        calidad_patas=Decimal("7.5"),
        calidad_ubres=Decimal("7.5"),
        grasa=4.0,
        proteinas=3.6,
        corral=Corral.objects.create(nombre="Corral Test")
    )

    vt_registro = VTAnimales.objects.create(
        codigo="VTA-100",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-04-01",
        fecha_finalizacion="2024-04-05",
        responsable="Veterinario Prueba",
        id_animal=animal,
        inventario_vt=inventario_con_unidades
    )

    # Se intenca cambiar la vacuna a otra vacuna que no tenga unidades en su inventario.
    datos_modificados = {
        "tipo": "Vacuna",
        "ruta": "Oral",
        "fecha_inicio": "2024-04-01",
        "fecha_finalizacion": "2024-04-05",
        "responsable": "Veterinario Prueba",
        "id_animal": animal.id,
        "inventario_vt": inventario_sin_unidades.id
    }

    # Se modifica la vacuna a otra que no tenga unidades, teniendo que mostrar un mensaje de error.
    response = client.put(f"/api/vtanimales/{vt_registro.id}/", datos_modificados, format="json")
    assert response.status_code == 400
    assert "inventario_vt" in response.data
    assert response.data["inventario_vt"] == (
        f"No hay suficientes unidades disponibles de {inventario_sin_unidades.tipo.lower()} '"
        f"{inventario_sin_unidades.nombre}'."
    )


# Test para comprobar que si se modifica el campo de nombre de una vacuna/tratamiento,
# se actualizan las unidades del inventario de origen y destino correctamente.
@pytest.mark.django_db
def test_modificar_vtanimales_actualiza_unidades_entre_inventarios():
    client = APIClient()

    # El inventario de origen tiene 5 unidades.
    inventario_origen = InventarioVT.objects.create(
        codigo="VT-100",
        tipo="Vacuna",
        nombre="Vacuna Origen",
        unidades=5, # 5 unidades.
        cantidad="Dosis",
        estado="Activa"
    )

    # El inventario de destino tiene 3 unidades
    inventario_nuevo = InventarioVT.objects.create(
        codigo="VT-20O",
        tipo="Vacuna",
        nombre="Vacuna Destino",
        unidades=3, # 3 unidades.
        cantidad="Dosis",
        estado="Activa"
    )

    # Animal que se le va a suministrar la vacuna/tratamiento
    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=110000,
        produccion_leche=20.0,
        calidad_patas=Decimal("7.0"),
        calidad_ubres=Decimal("7.0"),
        grasa=4.0,
        proteinas=3.5,
        corral=Corral.objects.create(nombre="Corral Test")
    )

    # Hay una vacuna suministrada a una vaca con la vacuna VT-100 (origen)
    vt = VTAnimales.objects.create(
        codigo="VTA-100",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-04-01",
        fecha_finalizacion="2024-04-05",
        responsable="Veterinario Prueba",
        id_animal=animal,
        inventario_vt=inventario_origen # Vacuna de origen.
    )

    # Se quiere modificar esa vacuna suministrada por otra vacuna VT-200 (destino)
    datos_modificados = {
        "tipo": "Vacuna",
        "ruta": "Oral",
        "fecha_inicio": "2024-04-01",
        "fecha_finalizacion": "2024-04-05",
        "responsable": "Veterinario Prueba",
        "id_animal": animal.id,
        "inventario_vt": inventario_nuevo.id # Vacuna de destino.
    }

    # Se modifica la vacuna de origen por la de destino.
    response = client.put(f"/api/vtanimales/{vt.id}/", datos_modificados, format="json")
    assert response.status_code == 200

    inventario_origen.refresh_from_db()
    inventario_nuevo.refresh_from_db()

    # Se tienen que actualizar los inventarios, sumándole 1 a la vacuna de origen.
    # Y restándole 1 a la vacuna de destino.
    assert inventario_origen.unidades == 6  # Se suma una unidad (5+1 = 6)
    assert inventario_nuevo.unidades == 2   # Se resta una unidad (3-1 = 2)

# Test para comprobar que no haya un mismo tratamiento/vacuna para un animal en el mismo año.
@pytest.mark.django_db
def test_vtanimales_no_permitir_repetir_vactrac_mismo_anio():
    client = APIClient()

    # Hay una vacuna en el inventario que será la primera que se le suministre al animal.
    inventario = InventarioVT.objects.create(
        codigo="VT-100",
        tipo="Vacuna",
        nombre="Vacuna Prueba",
        unidades=5,
        cantidad="Dosis",
        estado="Activa"
    )

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba Año",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=110000,
        produccion_leche=20.0,
        calidad_patas=Decimal("7.0"),
        calidad_ubres=Decimal("7.0"),
        grasa=4.0,
        proteinas=3.5,
        corral=Corral.objects.create(nombre="Corral Año")
    )

    # El animal tiene la vacuna VT-100 como suministrada en 2024
    VTAnimales.objects.create(
        codigo="VTA-200",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-04-01", # Se le suministra la vacuna el 2024-04-01
        fecha_finalizacion="2024-04-05",
        responsable="Veterinaro Prueba",
        id_animal=animal,
        inventario_vt=inventario # Se le ha suministrado la vacuna VT-100
    )

    # Se intenta suministrar al animal la misma vacuna en el mismo año 2024
    datos = {
        "tipo": "Vacuna",
        "ruta": "Oral",
        "fecha_inicio": "2024-05-01",  # Mismo año
        "fecha_finalizacion": "2024-05-05",
        "responsable": "Vet",
        "id_animal": animal.id,
        "inventario_vt": inventario.id # Vacuna VT-100
    }

    response = client.post("/api/vtanimales/", datos, format="json")
    assert response.status_code == 400
    assert "inventario_vt" in response.data
    mensaje_error = (
        f"Est{'e tratamiento' if inventario.tipo.lower() == 'tratamiento' else 'a vacuna'} "
        f"ya fue suministrad{'o' if inventario.tipo.lower() == 'tratamiento' else 'a'} "
        f"a {animal.codigo} en el mismo año."
    )
    assert response.data["inventario_vt"] == [mensaje_error]

# Test para comprobar que aparece "nombre_vt" cuando se hace una petición GET
# Ya que no lo registramos en el modelo pero sí lo tenemos añadido cuando hacemos la petición
@pytest.mark.django_db
def test_vtanimales_nombrevt_aparece_en_get():
    client = APIClient()

    inventario = InventarioVT.objects.create(
        codigo="VT-100",
        tipo="Vacuna",
        nombre="Vacuna Prueba",
        unidades=5,
        cantidad="Dosis",
        estado="Activa"
    )

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Prueba",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=110000,
        produccion_leche=20.0,
        calidad_patas=Decimal("7.0"),
        calidad_ubres=Decimal("7.0"),
        grasa=4.0,
        proteinas=3.5,
        corral=Corral.objects.create(nombre="Corral Vista")
    )

    vt = VTAnimales.objects.create(
        codigo="VTA-100",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-04-01",
        fecha_finalizacion="2024-04-05",
        responsable="Vet",
        id_animal=animal,
        inventario_vt=inventario
    )

    response = client.get(f"/api/vtanimales/{vt.id}/")
    assert response.status_code == 200
    assert "nombre_vt" in response.data
    assert response.data["nombre_vt"] == "Vacuna Prueba"


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
        id_animal = animal,
        inventario_vt = inventario
    )
    # Se intenta crear un nuevo  con el mismo código ("VT-100").
    datos_duplicados = {
        "codigo": "VTA-100",
        "fecha_inicio": "2024-03-21",
        "fecha_finalizacion": "2024-03-23",
        "responsable": "Pepe",
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    # Se intenta crear un nuevo tratamiento/vacuna con el mismo código ("VTA-100").
    response = client.post("/api/vtanimales/", datos_duplicados, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data # Error del campo "código"
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
        "id_animal": animal.id,
        "inventario_vt": inventario.id,
    }

    # Se intenta crear un nuevo tratamiento/vacuna para suministrar con un código incorrecto ("ABC-999").
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
        id_animal=animal,
        inventario_vt=inventario
    )
    response = client.delete(f"/api/vtanimales/{datos.id}/")
    assert response.status_code == 200
    assert not VTAnimales.objects.filter(id=datos.id).exists()

    # Se comprueba que el mensaje personalizado es correcto
    assert response.data["mensaje"] == f"La vacuna suministrada {datos.codigo} ha sido eliminada correctamente."

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

# Test para filtrar por la fecha de inicio de las vacunas/tratamientos suministrados.
@pytest.mark.django_db
def test_filtrado_vtanimales_por_rango_fecha_inicio():
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
    # No cumple con el filtro (>= 2024-03-20, es decir, antes de 2024-03-20).
    VTAnimales.objects.create(
        codigo="VTA-100",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-03-10",
        fecha_finalizacion="2024-02-23",
        responsable="Pepe",
        id_animal=animal,
        inventario_vt=inventario
    )

    # Sí cumple con el filtro (>= 2024-03-20, es decir, antes de 2024-03-20).
    VTAnimales.objects.create(
        codigo="VTA-200",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-03-20",
        fecha_finalizacion="2024-03-25",
        responsable="Pepe",
        id_animal=animal,
        inventario_vt=inventario
    )

    # No cumple con el filtro (>= 2024-03-20, es decir, antes de 2024-03-20).
    VTAnimales.objects.create(
        codigo="VTA-300",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-01-15",
        fecha_finalizacion="2024-01-02",
        responsable="Pepe",
        id_animal=animal,
        inventario_vt=inventario
    )

    # Sí cumple con el filtro (>= 2024-03-20, es decir, antes de 2024-03-20).
    VTAnimales.objects.create(
        codigo="VTA-400",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2024-07-13",
        fecha_finalizacion="2024-07-16",
        responsable="Pepe",
        id_animal=animal,
        inventario_vt=inventario
    )

    #fechaInicio = "fecha_inicio"

    # Se buscan fechas que sean posteriores al día "2024-04-20".
    response = client.get("/api/vtanimales/?fecha_inicio__gte=2024-03-20")
    #response = client.get(f"/api/vtanimales/?{fechaInicio}__gte=2024-03-20")
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
        id_animal=animal,
        inventario_vt=inventario2
    )

    # Se aplica filtro combinado: tipo = Vacuna y ruta = Intramamaria
    response = client.get("/api/vtanimales/?tipo=Vacuna&ruta=Intramamaria")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["codigo"] == "VTA-100"