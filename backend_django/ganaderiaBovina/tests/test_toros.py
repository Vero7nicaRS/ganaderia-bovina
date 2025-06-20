# --------------------------------- test_toros.py: ---------------------------------
# Funcionalidad: se encarga de comprobar la API
# (ej: crear, modificar, eliminar, mostrar...)
# -----------------------------------------------------------------------------------
import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User, Permission
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from ganaderiaBovina.models import Toro, Animal, ListaInseminaciones, Perfil
from decimal import Decimal
from django.contrib.auth.models import Group


# --------------------------------------------------------------------------------------------------------------
#                                       Test de TOROS: LÓGICA
# --------------------------------------------------------------------------------------------------------------
def obtener_usuario_autenticado():

    # Se crea a un usuario
    user, _ = User.objects.get_or_create(username="usuariotest")
    user.set_password("usuariotest1234")
    user.is_staff = True
    user.save()

    # Se crea un perfil "Administrador" para el usuario
    perfil, _ = Perfil.objects.get_or_create(user=user)
    perfil.rol = "Administrador"
    perfil.save()

    # Se le asigna un grupo al usuario
    grupo_admin, _ = Group.objects.get_or_create(name="Administrador")
    if not user.groups.filter(name="Administrador").exists():
        user.groups.add(grupo_admin)

    # Se le asignan los permisos al usuario
    permisos_necesarios = ['add_toro', 'change_toro', 'view_toro', 'delete_toro']
    for tipo_permiso in permisos_necesarios:
        permiso = Permission.objects.get(codename=tipo_permiso)
        user.user_permissions.add(permiso)

    # Se crea el token para la autenticación
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)

    # Se autentica al usuario
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client


# Test donde se comprueba que se puede crear un toro correctamente con datos válidos.
@pytest.mark.django_db
def test_crear_toro_valido():
    client = obtener_usuario_autenticado()

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

    # Se comprueba que el código se ha generado correctamente.
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("T-") # Comprueba que el código comience por "T-".
    assert response.data["codigo"][2:].isdigit() # Comprueba que lo que le sigue a "T-" son números.

    # Se comprueba que el campo "tipo" esté en la respuesta del endpoint.
    assert "tipo" in response.data
    assert response.data["tipo"] == "Toro"

    # Se comprueba que el toro existe en la base de datos.
    assert Toro.objects.filter(nombre="ToroPrueba").exists()

# Test para comprobar que debe haber valores en cada uno de los campos.
@pytest.mark.django_db
def test_toro_campos_requeridos_vacios():
    client = obtener_usuario_autenticado()

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
    client = obtener_usuario_autenticado()

    datosMin = {
        "nombre": "ToroRango",
        "cantidad_semen": -10,  # Valor negativo.
        "transmision_leche": "no es decimal",  # Tipo inválido
        "celulas_somaticas": "texto",  # Tipo inválido
        "calidad_patas": 0,  # Menor que 1
        "calidad_ubres": -2,  # Menor que 1
        "grasa": "mucho",  # Tipo inválido
        "proteinas": None  # Campo requerido
    }

    datosMax = {
        "nombre": "ToroRango",
        "cantidad_semen": -23,  # Valor negativo.
        "transmision_leche": "no es decimal",  # Tipo inválido
        "celulas_somaticas": "texto",  # Tipo inválido
        "calidad_patas": 10.0,  # Mayor que 9
        "calidad_ubres": 12,  # Mayor que 9
        "grasa": "mucho",  # Tipo inválido
        "proteinas": None  # Campo requerido
    }

    responseMin = client.post("/api/toros/", datosMin, format="json")
    responseMax = client.post("/api/toros/", datosMax, format="json")

    assert responseMin.status_code == 400
    assert responseMax.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    # MÍNIMO
    assert responseMin.data["cantidad_semen"][0] == "El valor mínimo permitido es 0."
    assert responseMin.data["transmision_leche"][0] == "Debe introducir un número válido."
    assert responseMin.data["celulas_somaticas"][0] == "Debe introducir un número entero válido."
    assert responseMin.data["calidad_patas"][0] == "El valor mínimo permitido es 1."
    assert responseMin.data["calidad_ubres"][0] == "El valor mínimo permitido es 1."
    assert responseMin.data["grasa"][0] == "Debe introducir un número válido."
    assert responseMin.data["proteinas"][0] == "El porcentaje de proteínas no puede ser nulo."

    # MÁXIMO
    assert responseMax.data["cantidad_semen"][0] == "El valor mínimo permitido es 0."
    assert responseMax.data["transmision_leche"][0] == "Debe introducir un número válido."
    assert responseMax.data["celulas_somaticas"][0] == "Debe introducir un número entero válido."
    assert responseMax.data["calidad_patas"][0] == "El valor máximo permitido es 9."
    assert responseMax.data["calidad_ubres"][0] == "El valor máximo permitido es 9."
    assert responseMax.data["grasa"][0] == "Debe introducir un número válido."
    assert responseMax.data["proteinas"][0] == "El porcentaje de proteínas no puede ser nulo."


# Test para comprobar que no puede haber dos corrales con el mismo nombre.
@pytest.mark.django_db
def test_toro_nombre_duplicado():
    client = obtener_usuario_autenticado()
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

    datos_duplicados = {
        "nombre":"ToroPrueba",
        "estado":"Vivo",
        "cantidad_semen":100,
        "transmision_leche":3.0,
        "celulas_somaticas":1.0,
        "calidad_patas":7.0,
        "calidad_ubres":7.0,
        "grasa":4.0,
        "proteinas":3.5
    }

    response = client.post("/api/toros/", datos_duplicados, format="json")

    assert response.status_code == 400
    assert "nombre" in response.data # Error del campo "nombre"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["nombre"][0] == "Ya existe un toro con este nombre."


# Test para comprobar si se generan códigos duplicados
@pytest.mark.django_db
def test_codigo_duplicado_toro():
    client = obtener_usuario_autenticado()

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

    # Se intenta crear un nuevo toro con el mismo código ("T-100").
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
    assert "codigo" in response.data # Error del campo "código"
    assert response.data["codigo"][0] == "El código ya existe en el sistema."  # Se comprueba que se obtiene el mensaje de error personalizado.

# Test para comprobar código con formato incorrecto.
@pytest.mark.django_db
def test_crear_toro_codigo_formato_incorrecto():
    client = obtener_usuario_autenticado()

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
def test_codigo_toro_generado_automaticamente():
    client = obtener_usuario_autenticado()
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


# Test para comprobar que no se puede eliminar un toro inexistente.
@pytest.mark.django_db
def test_eliminar_toro_no_existente():
    client = obtener_usuario_autenticado()

    id_inexistente = 9999  # Un ID que seguramente no exista

    response = client.delete(f"/api/toros/{id_inexistente}/")

    assert response.status_code == 404
    assert "ERROR" in response.data
    # Se comprueba que el mensaje personalizado es correcto
    assert response.data["ERROR"] == (
        f"El Toro {id_inexistente} no ha sido encontrado. "
        f"Comprueba el identificador introducido."
    )

# Test para comprobar la eliminación del toro sin indicarle ningún motivo.
@pytest.mark.django_db
def test_eliminar_toro_destroy_sin_motivo():
    client = obtener_usuario_autenticado()

    toro = Toro.objects.create(
        nombre="ToroDestroy",
        cantidad_semen=80,
        transmision_leche=2.0,
        celulas_somaticas=1.0,
        calidad_patas=7.0,
        calidad_ubres=6.5,
        grasa=3.8,
        proteinas=3.3
    )

    vaca = Animal.objects.create(
        nombre="VacaDestroy",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-02-01",
        celulas_somaticas=95000,
        produccion_leche=24.0,
        calidad_patas=6.0,
        calidad_ubres=7.0,
        grasa=4.0,
        proteinas=3.5
    )

    inseminacion = ListaInseminaciones.objects.create(
        id_vaca=vaca,
        id_toro=toro,
        razon="Celo",
        fecha_inseminacion="2025-05-01",
        hora_inseminacion="10:00",
        es_sexado=False,
        responsable="VetDestroy"
    )

    response = client.delete(f"/api/toros/{toro.id}/")

    assert response.status_code == 200
    # Se comprueba que el mensaje de error sea el mismo.
    mensaje_error = (
        f"El toro {toro.codigo} ha sido eliminado correctamente."
    )

    assert response.data["mensaje"] == mensaje_error
    assert not Toro.objects.filter(id=toro.id).exists()

    # Se comprueba que la inseminación permanece con id_toro a null (por SET_NULL)
    inseminacion.refresh_from_db()
    assert inseminacion.id_toro is None

# Test para comprobar la eliminación de un Toro por el motivo "ERROR"
# ¿Qué se verifica?
# - Toro eliminado de la base de datos.
# - El historial de ListaInseminaciones se mantiene a null (FK).
@pytest.mark.django_db
def test_eliminar_toro_error():
    client = obtener_usuario_autenticado()

    # Se crea un toro
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

    # Se crea una vaca para poder crear la inseminación.
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

    # Se crea una inseminación con el toro que se va a eliminar.
    inseminacion = ListaInseminaciones.objects.create(
        id_vaca=vaca,
        id_toro=toro,
        razon="Celo",
        fecha_inseminacion="2025-04-01",
        hora_inseminacion="12:00",
        es_sexado=True,
        responsable="Veterinario A"
    )

    # Se elimina al toro por el motivo "ERROR"
    response = client.delete(f"/api/toros/{toro.id}/eliminar/?motivo=ERROR")

    assert response.status_code == 200
    # Se comprueba que el mensaje de error sea el mismo.
    mensaje_error = (
        f"El toro {toro.codigo} ha sido eliminado correctamente."
    )

    assert response.data["mensaje"] == mensaje_error
    assert not Toro.objects.filter(id=toro.id).exists() # Se compruebe que ese toro NO existe en la base de datos.

    # Se comprueba que no haya habido modificaciones en la lista de inseminación
    inseminacion.refresh_from_db()
    assert ListaInseminaciones.objects.filter(id_vaca=vaca).exists()
    assert inseminacion.id_toro is None



# Test para comprobar la eliminación de un Animal por el motivo "MUERTA o VENDIDA"
# ¿Qué se verifica?
# - El Toro permanece en la base de datos.
# - Actualización del estado y de la fecha de eliminación.
# - El historial de ListaInseminaciones se mantiene con el identificador del animal (FK).
# - El historial con los animales se sigue manteniendo (FK).
@pytest.mark.django_db
@pytest.mark.parametrize("motivo", ["MUERTE", "OTROS"])
def test_eliminar_toro_con_motivo_actualiza_estado(motivo):
    client = obtener_usuario_autenticado()

    # Se crea un toro
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

    # Se crea una vaca para poder crear la inseminación.
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

    # Se crea un hijo del toro y la vaca anteriores
    hijo_toro = Animal.objects.create(
        nombre="CríaPrueba",
        tipo="Ternero",
        estado="Joven",
        fecha_nacimiento="2025-05-01",
        celulas_somaticas=120000,
        produccion_leche=15.0,
        calidad_patas=6.0,
        calidad_ubres=7.0,
        grasa=4.0,
        proteinas=3.2,
        padre=toro,
        madre=vaca,
    )

    # Se crea una inseminación con el toro que se va a eliminar.
    inseminacion = ListaInseminaciones.objects.create(
        id_vaca=vaca,
        id_toro=toro,
        razon="Celo",
        fecha_inseminacion="2025-04-01",
        hora_inseminacion="12:00",
        es_sexado=True,
        responsable="Veterinario A"
    )

    # Se elimina al toro por el motivo "MUERTE" u "OTROS"
    response = client.delete(f"/api/toros/{toro.id}/eliminar/?motivo={motivo}")

    toro.refresh_from_db()
    assert response.status_code == 200
    # Se comprueba que el mensaje de error sea el mismo.
    mensaje_error = (
        f'El Toro {toro.codigo} ha cambiado su estado a {toro.estado.lower()} '
        f'(ha sido eliminado pero se mentiene en el sistema).'
    )

    assert response.data["mensaje"] == mensaje_error
    assert toro.estado == motivo.capitalize() # El estado del toro debe estar actualizado al motivo de su eliminación.

    # Se comprueba que se mantiene el historial en las inseminaciones.
    assert ListaInseminaciones.objects.filter(id_toro=toro).exists()

    # Se comprueba que no haya habido modificaciones en la lista de inseminación y se mantienen la
    # relación del toro con la vacuna/tratamiento:
    #   - id_vaca: para asegurarnos de que la inseminación no se ha eliminado.
    #   - id_toro: ""        ""     la relación con el toro se mantiene y no se pone a null.
    inseminacion.refresh_from_db()
    assert ListaInseminaciones.objects.filter(id_vaca=vaca).exists()
    assert ListaInseminaciones.objects.filter(id_toro=toro).exists()

    # Se comprueba que siga existiendo las relaciones con otros animales.
    hijo_toro.refresh_from_db()
    assert hijo_toro.padre == toro  # El toro sigue siendo su padre

# Test para comprobar la eliminación de un Animal por un motivo no correcto.
@pytest.mark.django_db
def test_eliminar_toro_motivo_invalido():
    client = obtener_usuario_autenticado()

    # Se crea un toro
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

    # Se crea una vaca para poder crear la inseminación.
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

    # Se crea una inseminación con el toro que se va a eliminar.
    inseminacion = ListaInseminaciones.objects.create(
        id_vaca=vaca,
        id_toro=toro,
        razon="Celo",
        fecha_inseminacion="2025-04-01",
        hora_inseminacion="12:00",
        es_sexado=True,
        responsable="Veterinario A"
    )

    # Se elimina al toro por un motivo erróneo, en este caso "INCORRECTO".
    response = client.delete(f"/api/toros/{toro.id}/eliminar/?motivo=INCORRECTO")

    assert response.status_code == 400
    assert response.data["ERROR"] == "El motivo seleccionado no es correcto. Usa: 'ERROR', 'MUERTE' u 'OTROS'."


# --------------------------------------------------------------------------------------------------------------
#                                       Test de TOROS: FILTRADO
# --------------------------------------------------------------------------------------------------------------

# Test para filtrar por la transmisión de leche del toro.
@pytest.mark.django_db
def test_filtrado_toro_por_rango_transmision_leche():
    client = obtener_usuario_autenticado()

    # No cumple con el filtro (>=3).
    Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=100,
        transmision_leche=Decimal("3.0"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )

    # Sí cumple con el filtro (>=3).
    Toro.objects.create(
        nombre="Toro Prueba 2",
        cantidad_semen=100,
        transmision_leche=Decimal("3.08"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )

    # No cumple con el filtro (>=3).
    Toro.objects.create(
        nombre="Toro Prueba 3",
        cantidad_semen=100,
        transmision_leche=Decimal("2.99"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )
    # Sí cumple con el filtro (>=3).
    Toro.objects.create(
        nombre="Toro Prueba 4",
        cantidad_semen=100,
        transmision_leche=Decimal("3.01"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"),
        grasa=3.5,
        proteinas=3.2
    )

    response = client.get("/api/toros/?transmision_leche__gte=3.01")
    assert response.status_code == 200
    assert len(response.data) == 2 # Se espera que haya dos vacas válidas.

    # Se crea una lista con todos los nombres de las vacas que se han obtenido como resultado.
    nombres = [toro["nombre"] for toro in response.data]
    assert "Toro Prueba 2" in nombres
    assert "Toro Prueba 4" in nombres


# Test para filtrar por la cantidad de semen y la calidad de ubres del toro.
@pytest.mark.django_db
def test_filtrado_combinado_toros_por_cantidad_semen_y_calidad_ubres():
    client = obtener_usuario_autenticado()

    # Toro que sí cumple ambos filtros
    Toro.objects.create(
        nombre="Toro Prueba 1",
        cantidad_semen=50, # Lo cumple
        transmision_leche=Decimal("3.0"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("7.00"), # Lo cumple
        grasa=3.5,
        proteinas=3.2
    )

    # Toro que no cumple calidad_ubres
    Toro.objects.create(
        nombre="Toro Prueba 2",
        cantidad_semen=50, # Lo cumple
        transmision_leche=Decimal("3.0"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("8.55"), # No lo cumple
        grasa=3.5,
        proteinas=3.2
    )

    # Toro que no cumple cantidad de semen
    Toro.objects.create(
        nombre="Toro Prueba 3",
        cantidad_semen=49, # No lo cumple
        transmision_leche=Decimal("3.0"),
        celulas_somaticas=Decimal("1.0"),
        calidad_patas=Decimal("7.00"),
        calidad_ubres=Decimal("8.55"), # Lo cumple
        grasa=3.5,
        proteinas=3.2
    )

    # Se aplica filtro combinado: cantidad_semen = 50 y calidad_ubres menor o igual a 7
    response = client.get("/api/toros/?cantidad_semen=50&calidad_ubres__lte=7")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["nombre"] == "Toro Prueba 1"
