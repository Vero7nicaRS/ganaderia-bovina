# --------------------------------- test_inventariovt.py: ---------------------------------
# Funcionalidad: se encarga de comprobar la API
# (ej: crear, modificar, eliminar, mostrar...)
# -----------------------------------------------------------------------------------

import pytest
from rest_framework.test import APIClient

from ganaderiaBovina.models import Animal, Corral, InventarioVT, VTAnimales, Perfil
from decimal import Decimal
from django.contrib.auth.models import Group
from django.contrib.auth.models import User, Permission
from rest_framework_simplejwt.tokens import RefreshToken


# --------------------------------------------------------------------------------------------------------------
#                                       Test de INVENTARIOVT: LÓGICA
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
    permisos_necesarios = ['add_inventariovt', 'change_inventariovt',
                           'view_inventariovt', 'delete_inventariovt']
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



# Test donde se comprueba que se puede crear un tratamiento/vacuna en el inventario correctamente con datos válidos.
@pytest.mark.django_db
def test_crear_inventariovt_valido():
    client = obtener_usuario_autenticado()

    datos = {
        "tipo": "Vacuna",
        "nombre": "Vacuna Prueba",
        "unidades": 10,
        "cantidad": "Sobre",
        "estado": "Activa"
    }

    response = client.post("/api/inventariovt/", datos, format="json")

    assert response.status_code == 201

    # Se comprueba que el código se ha generado correctamente.
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("VT-")
    assert response.data["codigo"][3:].isdigit()

    # Se comprueba que la vacuna/tratamiento existe en la base de datos.
    assert InventarioVT.objects.filter(nombre="Vacuna Prueba").exists()

# Test para comprobar que debe haber valores en cada uno de los campos.
@pytest.mark.django_db
def test_inventariovt_campos_requeridos_vacios():
    client = obtener_usuario_autenticado()

    datos = {
        "nombre": "",
        "unidades": None,
    }

    response = client.post("/api/inventariovt/", datos, format="json")

    assert response.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    assert response.data["nombre"][0] == "El nombre no puede estar vacío."
    assert response.data["unidades"][0] == "El número de unidades no puede ser nulo."

# Test para comprobar que tienen los valores por defecto correctamente.
@pytest.mark.django_db
def test_inventariovt_campos_por_defecto():
    client = obtener_usuario_autenticado()
    datos = {
        "nombre": "Tratamiento Prueba",
        "unidades": 5
    }

    response = client.post("/api/inventariovt/", datos, format="json")
    assert response.status_code == 201
    assert response.data["tipo"] == "Tratamiento"
    assert response.data["cantidad"] == "Sobre"
    assert response.data["estado"] == "Activa"


# Test para comprobar los valores fuera de rango
@pytest.mark.django_db
def test_inventariovt_valores_fuera_de_rango():
    client = obtener_usuario_autenticado()

    # Los datos tienen se sobresalen del rango mínimo.
    datosMin = {
        "tipo": "Vacuna",
        "nombre": "Tratamiento Prueba",
        "unidades": -3, # Valor negativo.
        "cantidad": "Botella",
        "estado": "Activa"
    }

    # Los datos tienen se sobresalen del rango máximo.
    datosMax = {
        "tipo": "Vacuna",
        "nombre": "Tratamiento Prueba",
        "unidades": 31, # Valor superior a 30.
        "cantidad": "Botella",
        "estado": "Activa"
    }

    responseMin = client.post("/api/inventariovt/", datosMin, format="json")
    responseMax = client.post("/api/inventariovt/", datosMax, format="json")

    assert responseMin.status_code == 400
    assert responseMax.status_code == 400

    # Mensajes de error personalizados esperados en el serializer
    # MÍNIMO
    assert responseMin.data["unidades"][0] == "El valor mínimo permitido es 0."

    # MÁXIMO
    assert responseMax.data["unidades"][0] == "El valor máximo permitido es 30."

# Test para comprobar que no puede haber dos corrales con el mismo nombre.
@pytest.mark.django_db
def test_inventariovt_nombre_duplicado():
    client = obtener_usuario_autenticado()
    vacuna = InventarioVT.objects.create(
        codigo="VT-11",
        tipo= "Vacuna",
        nombre= "Vacuna Prueba",
        unidades= 10,
        cantidad = "Sobre",
        estado =  "Activa"
    )

    datos_duplicados = {
        "tipo": "Vacuna",
        "nombre": "Vacuna Prueba",
        "unidades": 15,
        "cantidad": "Botella",
        "estado": "Activa"
    }

    response = client.post("/api/inventariovt/", datos_duplicados, format="json")

    assert response.status_code == 400
    assert "nombre" in response.data # Error del campo "nombre"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["nombre"][0] == "Ya existe una vacuna/tratamiento con este nombre."


# Test para comprobar si se generan códigos duplicados
@pytest.mark.django_db
def test_codigo_duplicado_toro():
    client = obtener_usuario_autenticado()

    # Se crea un toro indicándole un código en específico ("T-100").
    InventarioVT.objects.create(
        codigo = "VT-100",
        tipo = "Vacuna",
        nombre = "Vacuna Prueba 1",
        unidades = 7,
        cantidad = "Sobre",
        estado = "Activa"
    )

    # Se intenta crear un nuevo  con el mismo código ("VT-100").
    datos_duplicados = {
        "codigo": "VT-100",
        "tipo": "Vacuna",
        "nombre": "Vacuna Prueba 2",
        "unidades": 10,
        "cantidad": "Sobre",
        "estado": "Activa"
    }

    # Se intenta crear un nuevo tratamiento/vacuna con el mismo código ("VT-100").
    response = client.post("/api/inventariovt/", datos_duplicados, format='json')

    assert response.status_code == 400
    assert "codigo" in response.data
    assert response.data["codigo"][0] == "El código ya existe en el sistema."  # Se comprueba que se obtiene el mensaje de error personalizado.

# Test para comprobar código con formato incorrecto.
@pytest.mark.django_db
def test_crear_inventariovt_codigo_formato_incorrecto():
    client = obtener_usuario_autenticado()

    InventarioVT.objects.create(
        codigo = "VT-100",
        tipo = "Vacuna",
        nombre = "Vacuna Prueba 1",
        unidades = 7,
        cantidad = "Sobre",
        estado = "Activa"
    )

    datos_codigo_incorrecto = {
        "codigo": "ABC-999", # Formato de código incorrecto.
        "tipo": "Vacuna",
        "nombre": "Vacuna Prueba 2",
        "unidades": 10,
        "cantidad": "Sobre",
        "estado": "Activa"
    }

    response = client.post("/api/inventariovt/", datos_codigo_incorrecto, format="json")

    assert response.status_code == 400
    assert "codigo" in response.data # Error del campo "código"
    # Se comprueba que se obtiene correctamente el mensaje de error personalizado.
    assert response.data["codigo"][0] == "El código debe tener el formato 'VT-número' (Ej: VT-1)."

# Test para comprobar que si el usuario no introduce un código, éste se genera de manera automática.
@pytest.mark.django_db
def test_codigo_inventariovt_generado_automaticamente():
    client = obtener_usuario_autenticado()
    datos = {
        # No se indica el campo "codigo"
        "tipo": "Vacuna",
        "nombre": "Vacuna Prueba",
        "unidades": 10,
        "cantidad": "Sobre",
        "estado": "Activa"
    }

    response = client.post("/api/inventariovt/", datos, format="json")

    assert response.status_code == 201
    assert "codigo" in response.data
    assert response.data["codigo"].startswith("VT-") # Comprueba que el código comience por "VT-".
    assert response.data["codigo"][3:].isdigit() # Comprueba que lo que le sigue a "VT-" son números.


# Test para comprobar que no se puede eliminar un toro inexistente.
@pytest.mark.django_db
def test_eliminar_inventariovt_no_existente():
    client = obtener_usuario_autenticado()

    id_inexistente = 9999  # Un ID que seguramente no exista

    response = client.delete(f"/api/inventariovt/{id_inexistente}/")

    assert response.status_code == 404
    assert "ERROR" in response.data
    # Se comprueba que el mensaje personalizado es correcto
    assert response.data["ERROR"] == (
        f"El tratamiento/la vacuna {id_inexistente} del inventario no se ha encontrado. "
        f"Comprueba el identificador introducido."
    )

# Test para comprobar la eliminación de una vacuna/tratamiento por el motivo "ERROR" sin relación existente.
# ¿Qué se verifica?
# - El tratamiento/vacuna es eliminado de la base de datos.
# - No hay problemas con las relaciones porque esa vacuna/tratamiento no tiene ninguna referencia
#   a otras relaciones.
@pytest.mark.django_db
def test_eliminar_inventariovt_error_sin_relacion():
    client = obtener_usuario_autenticado()

    inventario = InventarioVT.objects.create(
        nombre="Vacuna Prueba",
        tipo="Vacuna",
        unidades=10,
        cantidad="Sobre",
        estado="Activa"
    )

    # Se elimina la vacuna/tratamiento por el motivo "ERROR"
    response = client.delete(f"/api/inventariovt/{inventario.id}/eliminar/?motivo=ERROR")

    assert response.status_code == 200
    # Se comprueba que el mensaje de error sea el mismo.
    mensaje_error = (
        f"{'El' if inventario.tipo.lower() == 'tratamiento' else 'La'} "
        f"{inventario.tipo.lower()} "
        f"{inventario.codigo} ha sido eliminad{'o' if inventario.tipo.lower() == 'tratamiento' else 'a'} "
        f"correctamente."
    )

    assert response.data["mensaje"] == mensaje_error
    assert not InventarioVT.objects.filter(id=inventario.id).exists() # Se compruebe que esa vacuna/tratamiento NO existe en la base de datos.


# Test para comprobar la eliminación de una vacuna/tratamiento por el motivo "ERROR" con existencia de relaciones.
# ¿Qué se verifica?
# - El tratamiento/vacuna es eliminado de la base de datos.
# - Sí hay problemas con las relaciones porque esa vacuna/tratamiento no tiene ninguna referencia
#   a otras relaciones, por tanto debe lanzar un error.
@pytest.mark.django_db
def test_eliminar_inventariovt_error_con_relacion():
    client = obtener_usuario_autenticado()

    inventario = InventarioVT.objects.create(
        codigo="VT-200",
        tipo="Vacuna",
        nombre="Vacuna Relacionada",
        unidades=10,
        cantidad="Sobre",
        estado="Activa"
    )

    animal = Animal.objects.create(
        tipo="Vaca",
        estado="Vacía",
        nombre="Vaca Relacionada",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=120000,
        produccion_leche=21.0,
        calidad_patas=Decimal("7.5"),
        calidad_ubres=Decimal("6.8"),
        grasa=3.8,
        proteinas=3.2,
        corral=Corral.objects.create(nombre="Corral R")
    )

    VTAnimales.objects.create(
        codigo="VTA-100",
        tipo="Vacuna",
        ruta="Oral",
        fecha_inicio="2025-04-01",
        fecha_finalizacion="2025-04-03",
        responsable="Veterinaria Prueba",
        id_animal=animal,
        inventario_vt=inventario
    )

    # Se intenta eliminar la vacuna/tratamiento por el motivo "ERROR" y con relaciones con vtanimales.
    response = client.delete(f"/api/inventariovt/{inventario.id}/eliminar/?motivo=ERROR")

    assert response.status_code == 400
    assert "ERROR" in response.data
    assert response.data["ERROR"] == f"No se puede eliminar '{inventario.codigo}' porque está asociado a otros registros."
    assert "MOTIVO DEL ERROR" in response.data
    assert "VTA-100" in response.data["MOTIVO DEL ERROR"]

    # Se comprueba que sigue existiendo la vacuna/tratamiento en el inventario.
    assert InventarioVT.objects.filter(id=inventario.id).exists()
    assert VTAnimales.objects.filter(inventario_vt=inventario).exists()



# Test para comprobar la eliminación de un Animal por el motivo "MUERTA o VENDIDA"
# ¿Qué se verifica?
# - La vacuna/tratamiento permanece en la base de datos.
# - Actualización del estado.
# - El historial de VTAnimales se mantiene con el identificador del animal (FK).
@pytest.mark.django_db
def test_eliminar_inventarioVT_con_motivo_actualiza_estado():
    client = obtener_usuario_autenticado()

    inventario = InventarioVT.objects.create(
        nombre="Tratamiento Prueba",
        tipo="Tratamiento",
        unidades=10,
        cantidad="Botella",
        estado="Activa"
    )

    animal = Animal.objects.create(
        nombre="Vaca Prueba",
        tipo="Vaca",
        estado="Vacía",
        fecha_nacimiento="2023-01-01",
        celulas_somaticas=100000,
        produccion_leche=22.0,
        calidad_patas=7.0,
        calidad_ubres=6.5,
        grasa=4.0,
        proteinas=3.5
    )

    vt = VTAnimales.objects.create(
        id_animal=animal,
        tipo="Tratamiento",
        ruta="Oral",
        fecha_inicio="2025-04-01",
        fecha_finalizacion="2025-04-05",
        responsable="Veterinario Prueba",
        inventario_vt=inventario
    )
    # Se elimina al toro por el motivo "INACTIVA"
    response = client.delete(f"/api/inventariovt/{inventario.id}/eliminar/?motivo=INACTIVA")

    inventario.refresh_from_db()
    assert response.status_code == 200
    assert inventario.estado == "Inactiva" # El estado de la vacuna/tratamiento debe estar actualizado
    # al motivo de su eliminación.
    # Se comprueba que no haya habido modificaciones en la lista de vacunas/tratamientos suministrados
    # y se mantienen la relación de la vacuna/tratamiento con las vacunas/tratamientos suministrados.
    vt.refresh_from_db()
    assert vt.inventario_vt == inventario

# Test para comprobar la eliminación de un Animal por un motivo no correcto.
@pytest.mark.django_db
def test_eliminar_inventariovt_motivo_invalido():
    client = obtener_usuario_autenticado()

    inventario = InventarioVT.objects.create(
        nombre="Tratamiento Prueba",
        tipo="Tratamiento",
        unidades=10,
        cantidad="Botella",
        estado="Activa"
    )
    # Se elimina al toro por un motivo erróneo, en este caso "INCORRECTO".
    response = client.delete(f"/api/inventariovt/{inventario.id}/eliminar/?motivo=INCORRECTO")
    assert response.status_code == 400
    assert response.data["ERROR"] == "El motivo seleccionado no es correcto: Usa 'ERROR' o 'INACTIVA'."



# --------------------------------------------------------------------------------------------------------------
#                                       Test de INVENTARIOVT: FILTRADO
# --------------------------------------------------------------------------------------------------------------
# Test para filtrar por las unidades de las vacunas/tratamientos del inventario.
@pytest.mark.django_db
def test_filtrado_inventariovt_por_rango_unidades():
    client = obtener_usuario_autenticado()

    # No cumple con el filtro (>=6).
    InventarioVT.objects.create(
        nombre="Tratamiento Prueba 1",
        tipo="Tratamiento",
        unidades=3,
        cantidad="Botella",
        estado="Activa"
    )

    # Sí cumple con el filtro (>=6).
    InventarioVT.objects.create(
        nombre="Tratamiento Prueba 2",
        tipo="Tratamiento",
        unidades=6,
        cantidad="Botella",
        estado="Activa"
    )

    # No cumple con el filtro (>=6).
    InventarioVT.objects.create(
        nombre="Tratamiento Prueba 3",
        tipo="Tratamiento",
        unidades=5,
        cantidad="Botella",
        estado="Activa"
    )
    # Sí cumple con el filtro (>=6).
    InventarioVT.objects.create(
        nombre="Vacuna Prueba 4",
        tipo="Vacuna",
        unidades=10,
        cantidad="Botella",
        estado="Activa"
    )

    response = client.get("/api/inventariovt/?unidades__gte=6")
    assert response.status_code == 200
    assert len(response.data) == 2 # Se espera que haya dos vacunas/tratamientos válidas.

    # Se crea una lista con todos los nombres de las vacunas/tratamientos que se han obtenido como resultado.
    nombres = [inventariovt["nombre"] for inventariovt in response.data]
    assert "Tratamiento Prueba 2" in nombres
    assert "Vacuna Prueba 4" in nombres

# Test para filtrar por el tipo y estado de las vacunas/tratamientos del inventario.
@pytest.mark.django_db
def test_filtrado_combinado_inventariovt_por_tipo_y_estado():
    client = obtener_usuario_autenticado()

    # Sí cumple ambos filtros
    InventarioVT.objects.create(
        nombre="Vacuna Prueba 1",
        tipo="Vacuna",
        unidades=3,
        cantidad="Botella",
        estado="Activa"
    )

    # No cumple estado
    InventarioVT.objects.create(
        nombre="Tratamiento Prueba 1",
        tipo="Tratamiento",
        unidades=3,
        cantidad="Botella",
        estado="Inactiva" # No
    )

    # No cumple tipo
    InventarioVT.objects.create(
        nombre="Tratamiento Prueba 2",
        tipo="Tratamiento", # No
        unidades=3,
        cantidad="Botella",
        estado="Activa"
    )

    # Se aplica filtro combinado: tipo = Vacuna y estado = Activa
    response = client.get("/api/inventariovt/?tipo=Vacuna&estado=Activa")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["nombre"] == "Vacuna Prueba 1"
