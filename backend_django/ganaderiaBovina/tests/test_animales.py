# --------------------------------- test_animales.py: ---------------------------------
# Funcionalidad: se encarga de comprobar la API
# (ej: crear, modificar, eliminar, mostrar...)
# -----------------------------------------------------------------------------------

import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from ganaderiaBovina.models import Toro, Animal, Corral, InventarioVT, VTAnimales, ListaInseminaciones
from decimal import Decimal


# --------------------------------------------------------------------------------------------------------------
#                                       Test de ANIMALES: LÓGICA
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
        "nombre": "Vaquita",
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

    # Se comprueba que el código se ha generado correctamente.
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("C-")
    assert response.data["codigo"][2:].isdigit() # Comprueba que lo que le sigue a "T-" son números.

    # Se comprueba que el ternero existe en la base de datos.
    assert Animal.objects.filter(nombre="Vaquita").exists()

# Test para comprobar que debe haber valores en cada uno de los campos.
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

# Test para comprobar los valores fuera de rango
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

    datosMin = {
        "tipo": "Vaca",
        "estado": "Vacía",
        "nombre": "Vaquita",
        "fecha_nacimiento": "2024-01-01",
        "celulas_somaticas": 49999,  # Menor que 50000
        "produccion_leche": -5,        # Negativo
        "calidad_patas": 0.99,         # Menor que 1
        "calidad_ubres": 0.5,          # Menor que 1
        "grasa": 2.49,                 # Menor que 2.5
        "proteinas": 1.5,              # Menor a 2.8
        "padre": toro.id,
        "madre": madre.id,
        "corral": madre.corral.id
    }

    datosMax = {
        "tipo": "Vaca",
        "estado": "Vacía",
        "nombre": "Vaquita",
        "fecha_nacimiento": "2024-01-01",
        "celulas_somaticas": 9999999,  # Mayor que 2000000
        "produccion_leche": -1,        # Negativo
        "calidad_patas": 15,           # Mayor que 9
        "calidad_ubres": 10,           # Mayor que 9
        "grasa": 10,                   # Mayor a 6
        "proteinas": 4.01,              # Mayor que 4
        "padre": toro.id,
        "madre": madre.id,
        "corral": madre.corral.id
    }

    responseMin = client.post("/api/animales/", datosMin, format='json')
    responseMax = client.post("/api/animales/", datosMax, format='json')

    assert responseMin.status_code == 400
    assert responseMax.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    # MÍNIMO
    assert responseMin.data['celulas_somaticas'][0] == "El valor mínimo permitido es 50000."
    assert responseMin.data['produccion_leche'][0] == "El valor mínimo permitido es 0."
    assert responseMin.data['calidad_patas'][0] == "El valor mínimo permitido es 1."
    assert responseMin.data['calidad_ubres'][0] == "El valor mínimo permitido es 1."
    assert responseMin.data['grasa'][0] == "El valor mínimo permitido es 2.5."
    assert responseMin.data['proteinas'][0] == "El valor mínimo permitido es 2.8."

    # MÁXIMO
    assert responseMax.data['celulas_somaticas'][0] == "El valor máximo permitido es 2000000."
    assert responseMax.data['produccion_leche'][0] == "El valor mínimo permitido es 0."
    assert responseMax.data['calidad_patas'][0] == "El valor máximo permitido es 9."
    assert responseMax.data['calidad_ubres'][0] == "El valor máximo permitido es 9."
    assert responseMax.data['grasa'][0] == "El valor máximo permitido es 6."
    assert responseMax.data['proteinas'][0] == "El valor máximo permitido es 4."

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




# Test para comprobar si se generan códigos duplicados
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
        codigo="V-999",
        tipo="Vaca",
        estado="Vacía",
        nombre="MadreTest",
        fecha_nacimiento="2020-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=5.5,
        calidad_ubres=5.5,
        grasa=4.0,
        proteinas=3.5,
        padre=toro,
        corral=None
    )
    corral = Corral.objects.create(nombre="CorralTest")

    # Se crea un animal indicándole un código en específico ("V-100").
    Animal.objects.create(
        codigo="V-100",
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaquita",
        fecha_nacimiento="2025-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=5.5,
        calidad_ubres=6.0,
        grasa=4.0,
        proteinas=3.5,
        padre=toro,
        madre=madre,
        corral=corral
    )

    # Se intenta crear un nuevo animal con el mismo código ("V-100").
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

# Test para comprobar que si el usuario no introduce un código, éste se genera de manera automática.
@pytest.mark.django_db
def test_codigo_animales_generado_automaticamente():
    client = APIClient()

    # Creamos un toro y una vaca para usar como padres
    toro = Toro.objects.create(
        nombre="ToroAuto",
        cantidad_semen=100,
        transmision_leche=Decimal("1.5"),
        celulas_somaticas=Decimal("0.8"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )

    madre = Animal.objects.create(
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
        padre=toro,
        madre=None,
        corral=Corral.objects.create(nombre="Corral 1")
    )

    datos = {
        # No se indica el campo "codigo"
        "tipo": "Vaca",
        "estado": "Vacía",
        "nombre": "Vaca Prueba 2",
        "fecha_nacimiento": "2025-04-01",
        "celulas_somaticas": 120000,
        "produccion_leche": 22.0,
        "calidad_patas": 7.0,
        "calidad_ubres": 6.8,
        "grasa": 4.1,
        "proteinas": 3.9,
        "padre": toro.id,
        "madre": madre.id,
        "corral": madre.corral.id
    }

    response = client.post("/api/animales/", datos, format="json")

    assert response.status_code == 201
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("V-") # Comprueba que el código comience por "V-".
    assert response.data["codigo"][2:].isdigit() # Comprueba que lo que le sigue a "V-" son números.

# Test para comprobar que no se puede eliminar un animal (vaca/ternero) inexistente.
@pytest.mark.django_db
def test_eliminar_vaca_no_existente():
    client = APIClient()

    id_inexistente = 9999  # Un ID que seguramente no exista

    response = client.delete(f"/api/animales/{id_inexistente}/")

    assert response.status_code == 404
    assert "ERROR" in response.data
    # Se comprueba que el mensaje personalizado es correcto
    assert response.data["ERROR"] == (
        f"El Animal {id_inexistente} no ha sido encontrado. "
        f"Comprueba el identificador introducido."
    )

# Test para comprobar la eliminación del animal sin indicarle ningún motivo.
@pytest.mark.django_db
def test_eliminar_animal_sin_motivo():
    client = APIClient()

    corral = Corral.objects.create(nombre="Corral Prueba 1")
    toro = Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=10,
        transmision_leche=3,
        celulas_somaticas=1,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=3,
        proteinas=3
    )
    animal = Animal.objects.create(
        nombre="Vaca Prueba 1",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7,
        calidad_ubres=7,
        grasa=3.5,
        proteinas=3.2,
        padre=toro,
        corral=corral
    )
    inseminacion = ListaInseminaciones.objects.create(
        id_vaca=animal,
        id_toro=toro,
        razon="Celo",
        fecha_inseminacion="2025-04-10",
        hora_inseminacion="09:00",
        es_sexado=True,
        responsable="Vet Final"
    )
    inventario = InventarioVT.objects.create(
        tipo="Vacuna",
        nombre="Vacuna Prueba 1",
        unidades=10,
        cantidad="Botella",
        estado="Activa"
    )
    vt = VTAnimales.objects.create(
        id_animal=animal,
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2025-04-01",
        fecha_finalizacion="2025-04-05",
        responsable="Vet Final",
        inventario_vt=inventario,
        dosis=2
    )

    # Se elimina al animar sin indicarle ningún motivo (NO -> ?motivo=...)
    # Por tanto, se utiliza el destroy normal.
    response = client.delete(f"/api/animales/{animal.id}/")

    assert response.status_code == 200
    # Se comprueba que el mensaje de error sea el mismo.
    mensaje_error = (
        f"{'El' if animal.tipo.lower() == 'Ternero' else 'La'} "
        f"{animal.tipo.lower()} "
        f"{animal.codigo} ha sido eliminad{'o' if animal.tipo.lower() == 'Ternero' else 'a'}"
        f" correctamente."
    )

    assert response.data["mensaje"] == mensaje_error

    assert not Animal.objects.filter(id=animal.id).exists() # Se compruebe que ese animal NO existe en la base de datos.

    # No se usa "animal" porque hemos eliminado su instancia. Por tanto, utilizamos corral para verificarlo.
    # Se comprueba que no esté en ningún corral ese animal.
    assert not corral.animales.filter(id=animal.id).exists() # Se comprueba que no esté en ningún corral ese animal.

    # Se mantienen las relaciones con las inseminaciones y los suministros de vacunas/tratamientos.
    # Deben estar a "null" (None) esas relaciones  (SET_NULL).
    vt.refresh_from_db()
    inseminacion.refresh_from_db()

    assert vt.id_animal is None # La instancia "vt" no tiene un "id_animal".
    assert inseminacion.id_vaca is None # La instancia inseminacion no tiene un "id_vaca"

    assert VTAnimales.objects.filter(inventario_vt=inventario).exists()
    assert VTAnimales.objects.filter(id_animal__isnull=True).exists() # Existe un registro al menos con "id_animal = null"
    assert ListaInseminaciones.objects.filter(id_toro=toro).exists()
    assert ListaInseminaciones.objects.filter(id_vaca__isnull=True).exists() # Existe un registro al menos con "id_vaca = null"

    # Se comprueba que no se haya modificado el tratamiento ni las dosis
    assert vt.dosis == 2
    assert vt.inventario_vt == inventario

# Test para comprobar la eliminación de un Animal por el motivo "ERROR"
# ¿Qué se verifica?
# - Animal eliminado de la base de datos.
# - Ya no tiene ningún corral asignado.
# - El historial de VTAnimales y ListaInseminaciones se mantiene a null (FK).
@pytest.mark.django_db
def test_eliminar_animal_error():
    client = APIClient()
    corral = Corral.objects.create(nombre="Corral 1")
    toro = Toro.objects.create(
        nombre="ToroTest",
        cantidad_semen=50,
        transmision_leche=2.0,
        celulas_somaticas=1.0,
        calidad_patas=7.5,
        calidad_ubres=8.0,
        grasa=3.5,
        proteinas=3.0)
    madre = Animal.objects.create(
        nombre="Madre",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7.0,
        calidad_ubres=8.0,
        grasa=4.0,
        proteinas=3.5,
        padre=toro,
        corral=None)

    animal = Animal.objects.create(
        nombre="AnimalEliminar",
        tipo="Ternero",
        estado="Joven",
        fecha_nacimiento="2024-01-01",
        celulas_somaticas=120000,
        produccion_leche=15.0,
        calidad_patas=6.5,
        calidad_ubres=7.5,
        grasa=3.8,
        proteinas=3.2,
        padre=toro,
        madre=madre,
        corral=corral)

    # Se crea la inseminación para el animal.
    inseminacion = ListaInseminaciones.objects.create(
        id_vaca=animal,
        id_toro=toro,
        razon="Celo",
        fecha_inseminacion="2025-04-01",
        hora_inseminacion="12:00",
        es_sexado=True,
        responsable="Pepe"
    )

    # Se crea el tratamiento en el inventario para posteriormente suministrárselo al animal.
    inventario = InventarioVT.objects.create(
        tipo="Tratamiento",
        nombre="Antibiótico",
        unidades=10,
        cantidad="Botella",
        estado="Activa"
    )
    # Se suministra al animal el tratamiento del inventario.
    vt = VTAnimales.objects.create(
        id_animal=animal,
        tipo="Tratamiento",
        ruta="Oral",
        fecha_inicio="2025-04-01",
        fecha_finalizacion="2025-04-05",
        responsable="Veterinario A",
        inventario_vt=inventario,
        dosis=2
    )

    response = client.delete(f"/api/animales/{animal.id}/eliminar/?motivo=ERROR")

    assert response.status_code == 200
    # Se comprueba que el mensaje de error sea el mismo.
    mensaje_error = (
        f"{'El' if animal.tipo.lower() == 'ternero' else 'La'} "
        f"{animal.tipo.lower()} "
        f"{animal.codigo} ha sido eliminad{'o' if animal.tipo.lower() == 'ternero' else 'a'}"
        f" correctamente."
    )

    assert response.data["mensaje"] == mensaje_error
    assert not Animal.objects.filter(id=animal.id).exists() # Se compruebe que ese animal NO existe en la base de datos.

    # No se usa "animal" porque hemos eliminado su instancia. Por tanto, utilizamos corral para verificarlo.
    # Se comprueba que no esté en ningún corral ese animal.
    assert not corral.animales.filter(id=animal.id).exists() # Se comprueba que no esté en ningún corral ese animal.

    # Se mantienen las relaciones con las inseminaciones y los suministros de vacunas/tratamientos.
    # Deben estar a "null" (None) esas relaciones  (SET_NULL).
    vt.refresh_from_db()
    inseminacion.refresh_from_db()

    assert vt.id_animal is None # La instancia "vt" no tiene un "id_animal".
    assert inseminacion.id_vaca is None # La instancia inseminacion no tiene un "id_vaca"

    assert VTAnimales.objects.filter(inventario_vt=inventario).exists()
    assert VTAnimales.objects.filter(id_animal__isnull=True).exists() # Existe un registro al menos con "id_animal = null"
    assert ListaInseminaciones.objects.filter(id_toro=toro).exists()
    assert ListaInseminaciones.objects.filter(id_vaca__isnull=True).exists() # Existe un registro al menos con "id_vaca = null"

    # Se comprueba que no se haya modificado el tratamiento ni las dosis
    assert vt.dosis == 2
    assert vt.inventario_vt == inventario

# Test para comprobar la eliminación de un Animal por el motivo "MUERTA o VENDIDA"
# ¿Qué se verifica?
# - El Animal permanece en la base de datos.
# - Ya no tiene ningún corral asignado.
# - Actualización del estado y de la fecha de eliminación.
# - El historial de VTAnimales y ListaInseminaciones se mantiene con el identificador del animal (FK).
# - Las relaciones con sus reproductores no se ven alteradas.
@pytest.mark.django_db
@pytest.mark.parametrize("motivo", ["MUERTA", "VENDIDA"])
def test_eliminar_animal_con_motivo_actualiza_estado(motivo):
    client = APIClient()

    corral = Corral.objects.create(nombre="Corral 1")
    toro = Toro.objects.create(
        nombre="ToroTest",
        cantidad_semen=50,
        transmision_leche=2.0,
        celulas_somaticas=1.0,
        calidad_patas=7.5,
        calidad_ubres=8.0,
        grasa=3.5,
        proteinas=3.0)
    madre = Animal.objects.create(
        nombre="Madre",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7.0,
        calidad_ubres=8.0,
        grasa=4.0,
        proteinas=3.5,
        padre=toro,
        corral=corral)
    animal = Animal.objects.create(
        nombre="AnimalEstado",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2024-01-01",
        celulas_somaticas=100000,
        produccion_leche=18.0,
        calidad_patas=7.0,
        calidad_ubres=7.0,
        grasa=3.8,
        proteinas=3.2,
        padre=toro,
        madre=madre,
        corral=corral)
    # Crear inseminación asociada al animal
    inseminacion = ListaInseminaciones.objects.create(
        id_vaca=animal,
        id_toro=toro,
        razon="Celo",
        fecha_inseminacion="2025-04-01",
        hora_inseminacion="12:00",
        es_sexado=True,
        responsable="Veterinario A"
    )

    # Crear tratamiento asociado al animal
    inventario = InventarioVT.objects.create(
        tipo="Tratamiento",
        nombre="Antibiótico",
        unidades=10,
        cantidad="Botella",
        estado="Activa"
    )

    vt = VTAnimales.objects.create(
        id_animal=animal,
        tipo="Tratamiento",
        ruta="Oral",
        fecha_inicio="2025-04-01",
        fecha_finalizacion="2025-04-05",
        responsable="Veterinario A",
        inventario_vt=inventario,
        dosis=2
    )
    response = client.delete(f"/api/animales/{animal.id}/eliminar/?motivo={motivo}")

    animal.refresh_from_db()
    assert animal.corral is None  # El animal ya no está en el corral.
    assert response.status_code == 200
    assert animal.estado == motivo.capitalize() # El estado del animal debe estar actualizado al motivo de su eliminación.
    assert animal.fecha_eliminacion is not None # La fecha de eliminación tiene que tener algún valor.
    # Verificamos que ningún animal en el corral tenga el mismo ID
    assert not corral.animales.filter(id=animal.id).exists()
    # No se usa "animal" porque hemos eliminado su instancia. Por tanto, utilizamos corral para verificarlo.
    # Se comprueba que no esté en ningún corral ese animal.

    # Se comprueba que no haya habido modificaciones en los tratamientos/vacunas e inseminaciones y se mantienen la
    # relación del toro con la vacuna/tratamiento:
    #   - id_vaca: para asegurarnos de que la inseminación no se ha eliminado.
    #   - id_toro: ""        ""     la relación con el toro se mantiene y no se pone a null.
    assert VTAnimales.objects.filter(id_animal=animal).exists()
    assert ListaInseminaciones.objects.filter(id_vaca=animal).exists()
    assert ListaInseminaciones.objects.filter(id_toro=toro).exists()
    # Se comprueba que las relaciones con sus reproductores se sigue manteniendo.
    assert animal.padre == toro
    assert animal.madre == madre

    # Se comprueba que no se haya modificado el tratamiento ni las dosis
    vt.refresh_from_db()
    assert vt.dosis == 2
    assert vt.inventario_vt == inventario

# Test para comprobar la eliminación de un Animal por un motivo no correcto.
@pytest.mark.django_db
def test_eliminar_animal_motivo_invalido():
    client = APIClient()

    corral = Corral.objects.create(nombre="Corral 1")
    toro = Toro.objects.create(
        nombre="ToroTest",
        cantidad_semen=50,
        transmision_leche=2.0,
        celulas_somaticas=1.0,
        calidad_patas=7.5,
        calidad_ubres=8.0,
        grasa=3.5,
        proteinas=3.0)
    madre = Animal.objects.create(
        nombre="Madre",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=20.0,
        calidad_patas=7.0,
        calidad_ubres=8.0,
        grasa=4.0,
        proteinas=3.5,
        padre=toro,
        corral=None)
    animal = Animal.objects.create(
        nombre="AnimalMotivo",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2024-01-01",
        celulas_somaticas=100000,
        produccion_leche=18.0,
        calidad_patas=7.0,
        calidad_ubres=7.0,
        grasa=3.8,
        proteinas=3.2,
        padre=toro,
        madre=madre,
        corral=corral)

    # Se elimina al toro por un motivo erróneo, en este caso "INCORRECTO".
    response = client.delete(f"/api/animales/{animal.id}/eliminar/?motivo=INCORRECTO")

    assert response.status_code == 400
    assert response.data["ERROR"] == "El motivo seleccionado no es correcto. Usa 'ERROR', 'MUERTA' o 'VENDIDA'."
    # ERROR': "El Motivo indicado no es válido. Usa 'ERROR', 'MUERTA' o 'VENDIDA'


# --------------------------------------------------------------------------------------------------------------
#                                       Test de TOROS: FILTRADO
# --------------------------------------------------------------------------------------------------------------


# Test para filtrar por nombre del animal ignorando mayúsculas y minúsculas.
@pytest.mark.django_db
def test_filtrado_animales_por_nombre():
    client = APIClient()
    corral = Corral.objects.create(nombre="CorralFiltro")
    toro = Toro.objects.create(
        nombre="ToroFiltro",
        cantidad_semen=100,
        transmision_leche=Decimal("3.0"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )

    Animal.objects.create(
        nombre="Filtrable1",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=150000,
        produccion_leche=22.0,
        calidad_patas=7.0,
        calidad_ubres=7.0,
        grasa=4.0,
        proteinas=3.4,
        padre=toro,
        corral=corral
    )

    Animal.objects.create(
        nombre="OtroNombre",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2021-01-01",
        celulas_somaticas=250000,
        produccion_leche=18.0,
        calidad_patas=6.0,
        calidad_ubres=6.0,
        grasa=4.5,
        proteinas=3.0,
        padre=toro,
        corral=corral
    )

    response = client.get("/api/animales/?nombre=filtrable")
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["nombre"] == "Filtrable1"

# --------------------------------------------------------------------------------------------------------------
#                                       Test de ANIMALES: FILTRADO
# --------------------------------------------------------------------------------------------------------------

# Test para filtrar por la producción de leche del animal.
@pytest.mark.django_db
def test_filtrado_animales_por_rango_produccion_leche():
    client = APIClient()
    corral = Corral.objects.create(nombre="CorralFiltro")
    toro = Toro.objects.create(
        nombre="ToroFiltro",
        cantidad_semen=100,
        transmision_leche=Decimal("3.0"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )

    # No cumple con el filtro (>=20).
    Animal.objects.create(
        nombre="Vaca Prueba 1",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2021-01-01",
        celulas_somaticas=250000,
        produccion_leche=19.0,
        calidad_patas=6.0,
        calidad_ubres=6.0,
        grasa=4.5,
        proteinas=3.0,
        padre=toro,
        corral=corral
    )

    # Sí cumple con el filtro (>=20).
    Animal.objects.create(
        nombre="Vaca Prueba 2",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=150000,
        produccion_leche=22.0,
        calidad_patas=7.0,
        calidad_ubres=7.0,
        grasa=4.0,
        proteinas=3.4,
        padre=toro,
        corral=corral
    )

    # No cumple con el filtro (>=20).
    Animal.objects.create(
        nombre="Vaca Prueba 3",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2021-01-01",
        celulas_somaticas=250000,
        produccion_leche=10.0,
        calidad_patas=6.0,
        calidad_ubres=6.0,
        grasa=4.5,
        proteinas=3.0,
        padre=toro,
        corral=corral
    )

    # Sí cumple con el filtro (>=20).
    Animal.objects.create(
        nombre="Vaca Prueba 4",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2021-01-01",
        celulas_somaticas=250000,
        produccion_leche=28.0,
        calidad_patas=6.0,
        calidad_ubres=6.0,
        grasa=4.5,
        proteinas=3.0,
        padre=toro,
        corral=corral
    )

    response = client.get("/api/animales/?produccion_leche__gte=20")
    assert response.status_code == 200
    assert len(response.data) == 2 # Se espera que haya dos vacas válidas.

    # Se crea una lista con todos los nombres de las vacas que se han obtenido como resultado.
    nombres = [animal["nombre"] for animal in response.data]
    assert "Vaca Prueba 2" in nombres
    assert "Vaca Prueba 4" in nombres

# Test para filtrar por la el tipo y la calidad de ubres del animal.
@pytest.mark.django_db
def test_filtrado_combinado_animales_por_tipo_y_calidad_ubres():
    client = APIClient()

    corral = Corral.objects.create(nombre="Corral Filtro")
    toro = Toro.objects.create(
        nombre="ToroFiltro",
        cantidad_semen=100,
        transmision_leche=Decimal("3.0"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )

    # Animal que sí cumple ambos filtros
    Animal.objects.create(
        nombre="VacaBuena",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=150000,
        produccion_leche=22.0,
        calidad_patas=7.0,
        calidad_ubres=6.5,  # cumple filtro
        grasa=4.0,
        proteinas=3.4,
        padre=toro,
        corral=corral
    )

    # Animal que no cumple calidad_ubres
    Animal.objects.create(
        nombre="VacaMala",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2022-01-01",
        celulas_somaticas=150000,
        produccion_leche=22.0,
        calidad_patas=7.0,
        calidad_ubres=8.5,  # no cumple
        grasa=4.0,
        proteinas=3.4,
        padre=toro,
        corral=corral
    )

    # Animal que no cumple tipo
    Animal.objects.create(
        nombre="Ternerito",
        tipo="Ternero",
        estado="Joven",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=10.0,
        calidad_patas=6.5,
        calidad_ubres=6.0,  # cumple calidad pero no tipo
        grasa=3.8,
        proteinas=3.2,
        padre=toro,
        corral=corral
    )

    # Se aplica filtro combinado: tipo = "vaca", calidad_ubres menor o igual a 7
    response = client.get("/api/animales/?tipo=vaca&calidad_ubres__lte=7")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["nombre"] == "VacaBuena"
