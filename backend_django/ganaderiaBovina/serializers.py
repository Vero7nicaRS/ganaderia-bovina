#
# --------------------------------- serializers.py: ---------------------------------
# Funcionalidad: Se encarga de establecer cómo se van a convertir los modelos Django
# en formatos que se puedan enviar y recibir mediente la API.
# En resumen, se consigue realizar CRUD.
# ¿Qué código se escribe?
# - Indicar qué atributos se van o no a mostrar (aunque estos no se guarden en la bd).
# - Realizar comprobaciones de los datos antes de que se guarden (ej: que los valores estén en un rango determinado)
#   Además de incluir mensajitos indicándolo.
# - Método validate(): comprobar entradar antes de que pasen al modelo.
# -----------------------------------------------------------------------------------
import re

from rest_framework import serializers
from .models import Animal, Toro, Corral, InventarioVT, VTAnimales, ListaInseminaciones
from django.core.exceptions import ValidationError


# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de ANIMAL
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo Animal, por tanto se podrá hacer CRUD mediante la API
class AnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = '__all__'
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'required': 'El nombre es obligatorio.',
                    'blank': 'El nombre no puede estar vacío.'
                }
            },
            'fecha_nacimiento': {
                'error_messages': {
                    'required': 'La fecha de nacimiento es obligatoria.',
                    'invalid': 'La fecha de nacimiento no es válida. El formato es AAAA-MM-DD',
                }
            },
            'celulas_somaticas': {
                'error_messages': {
                    'required': 'El número de células somáticas es obligatorio.',
                    'invalid': 'Debe introducir un número entero válido.',
                    'blank': 'El número de células somáticas no puede estar vacía.',
                    'min_value': "El valor mínimo permitido es 50000.",
                    'max_value': "El valor máximo permitido es 2000000.",
                }
            },
            'produccion_leche': {
                'error_messages': {
                    'required': 'La producción de leche es obligatoria.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 0."
                }
            },
            'grasa': {
                'error_messages': {
                    'required': 'El porcentaje de grasa es obligatorio.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 2.5.",
                    'max_value': "El valor máximo permitido es 6."
                }
            },
            'proteinas': {
                'error_messages': {
                    'required': 'El porcentaje de proteínas es obligatorio.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 2.8.",
                    'max_value': "El valor máximo permitido es 4."
                }
            },
            'calidad_patas': {
                'error_messages': {
                    'required': 'La calidad de patas es obligatoria.',
                    'invalid': 'Debe ser un número decimal entre 1 y 9.',
                    'min_value': 'El valor mínimo permitido es 1.',
                    'max_value': 'El valor máximo permitido es 9.'
                }
            },
            'calidad_ubres': {
                'error_messages': {
                    'required': 'La calidad de ubres es obligatoria.',
                    'invalid': 'Debe ser un número decimal entre 1 y 9.',
                    'min_value': 'El valor mínimo permitido es 1.',
                    'max_value': 'El valor máximo permitido es 9.'
                }
            }
        }

    # Validaciones correspondiente al campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        tipo = self.initial_data.get('tipo')  # Se obtiene el tipo del payload original
        prefijo = 'V' if tipo == 'Vaca' else 'C' # Se pone un prefijo distinto si es una vaca (V-x) o un ternero (C-x)
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"ERROR: El código debe tener el formato '{prefijo}-número' (Ej:'{prefijo}-1)'.")

        # Si el código existe en el sistema, se lanza un mensaje de error.
        if Animal.objects.filter(codigo=value).exists():
            raise serializers.ValidationError(f"ERROR: El código '{value}' existe.")

        return value

    # Validaciones generales. Se ejecuta después después de las validaciones de cada uno de los campos.
    # Se manejan los campos: padre, madre y corral.
    def validate(self, data):
        errores = {}

        if data.get('padre') in [None, '']:
            errores['padre'] = 'Debe seleccionar un padre válido.'
        if data.get('madre') in [None, '']:
            errores['madre'] = 'Debe seleccionar una madre válida.'
        if data.get('corral') in [None, '']:
            errores['corral'] = 'Debe seleccionar un corral válido.'

        if errores:
            raise serializers.ValidationError(errores)

        return data


# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de TORO
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo Toro, por tanto se podrá hacer CRUD mediante la API
class ToroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Toro
        fields = '__all__'
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'required': 'El nombre es obligatorio.',
                    'blank': 'El nombre no puede estar vacío.'
                }
            },
            'cantidad_semen': {
                'error_messages': {
                    'required': 'La cantidad de semen es obligatoria.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 0."
                }
            },
            'transmision_leche': {
                'error_messages': {
                    'required': 'La producción de leche es obligatoria.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 0."
                }
            },
            'celulas_somaticas': {
                'error_messages': {
                    'required': 'El número de células somáticas es obligatorio.',
                    'invalid': 'Debe introducir un número entero válido.',
                    'min_value': "El valor mínimo permitido es 50000.",
                    'max_value': "El valor máximo permitido es 2000000.",
                }
            },
            'calidad_patas': {
                'error_messages': {
                    'required': 'La calidad de patas es obligatoria.',
                    'invalid': 'Debe ser un número decimal entre 1 y 9.',
                    'min_value': 'El valor mínimo permitido es 1.',
                    'max_value': 'El valor máximo permitido es 9.'
                }
            },
            'calidad_ubres': {
                'error_messages': {
                    'required': 'La calidad de ubres es obligatoria.',
                    'invalid': 'Debe ser un número decimal entre 1 y 9.',
                    'min_value': 'El valor mínimo permitido es 1.',
                    'max_value': 'El valor máximo permitido es 9.'
                }
            },
            'grasa': {
                'error_messages': {
                    'required': 'El porcentaje de grasa es obligatorio.',
                    'invalid': 'Debe introducir un número válido.',
                }
            },
            'proteinas': {
                'error_messages': {
                    'required': 'El porcentaje de proteínas es obligatorio.',
                    'invalid': 'Debe introducir un número válido.',
                }
            }
        }

    # Validaciones correspondiente al campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'T'  # Se pone el prefijo 'T-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"ERROR: El código debe tener el formato '{prefijo}-número' (Ej:'{prefijo}-1)'.")

        # Si el código existe en el sistema, se lanza un mensaje de error.
        if Toro.objects.filter(codigo=value).exists():
            raise serializers.ValidationError(f"ERROR: El código '{value}' existe.")

        return value


# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de CORRAL
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo Corral, por tanto se podrá hacer CRUD mediante la API
class CorralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Corral
        fields = '__all__'
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'required': 'El nombre es obligatorio.',
                    'blank': 'El nombre no puede estar vacío.'
                }
            }
        }

    # Validaciones correspondiente al campo "codigo".
    def validate_codigo(self, value):
        if not value:
                return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'CORRAL'  # Se pone el prefijo 'CORRAL-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"ERROR: El código debe tener el formato '{prefijo}-número' (Ej:'{prefijo}-1)'.")

        # Si el código existe en el sistema, se lanza un mensaje de error.
        if Corral.objects.filter(codigo=value).exists():
            raise serializers.ValidationError(f"ERROR: El código '{value}' existe.")

        return value

# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de INVENTARIOVT (Vacunas y tratamientos del inventario)
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo InventarioVT, por tanto se podrá hacer CRUD mediante la API
class InventarioVTSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventarioVT
        fields = '__all__'
        extra_kwargs = {
            'nombre': {
                'error_messages': {
                    'required': 'El nombre es obligatorio.',
                    'blank': 'El nombre no puede estar vacío.'
                }
            },
            'unidades': {
                'error_messages': {
                    'required': 'El número de unidades es obligatorio.',
                    'invalid': 'Se debe introducir un número entero válido.',
                    'min_value': "El valor mínimo permitido es 1.",
                    'max_value': "El valor máximo permitido es 30.",
                }
            }
        }

    # Validaciones correspondiente al campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'VT'  # Se pone el prefijo 'VT-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"ERROR: El código debe tener el formato '{prefijo}-número' (Ej:'{prefijo}-1)'.")

        # Si el código existe en el sistema, se lanza un mensaje de error.
        if Toro.objects.filter(codigo=value).exists():
            raise serializers.ValidationError(f"ERROR: El código '{value}' existe.")

        return value

# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de VTANIMALES (Vacunas y tratamientos suministrados a los animales)
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo VTAnimales, por tanto se podrá hacer CRUD mediante la API
# FK: id_animal e inventario_vt.
class VTAnimalesSerializer(serializers.ModelSerializer):
    # Se guarda el campo "nombre_vt" como respuesta a las peticiones, por tanto se muestra cuando se hace
    # GET y POST aunque NO se guarde en la base de datos.
    nombre_vt = serializers.CharField(source="inventario_vt.nombre", read_only=True)
    class Meta:
        model = VTAnimales
        fields = '__all__'
        extra_kwargs = {
            'fecha_inicio': {
                'error_messages': {
                    'required': 'La fecha de inicio es obligatoria.',
                    'invalid': 'La fecha de inicio no es válida. El formato es AAAA-MM-DD',
                }
            },
            'fecha_finalizacion': {
                'error_messages': {
                    'required': 'La fecha de finalización es obligatoria.',
                    'invalid': 'La fecha de finalización no es válida. El formato es AAAA-MM-DD',
                }
            },
            'responsable': {
                'error_messages': {
                    'required': 'El responsable es obligatorio.',
                    'blank': 'El responsable no puede estar vacío.'
                }
            },
            'dosis': {
                'error_messages': {
                    'required': 'La dosis es obligatorio.',
                    'invalid': 'Se debe introducir un número entero válido.'
                }
            },
            'id_animal': {
                'error_messages': {
                    'required': 'El identificador del animal es obligatorio.',
                    'invalid': 'Se debe introducir un identificador de animal válido.'
                }
            }

        }

    # Validaciones correspondiente al campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'VTA'  # Se pone el prefijo 'VTA-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"ERROR: El código debe tener el formato '{prefijo}-número' (Ej:'{prefijo}-1)'.")

        # Si el código existe en el sistema, se lanza un mensaje de error.
        if VTAnimales.objects.filter(codigo=value).exists():
            raise serializers.ValidationError(f"ERROR: El código '{value}' existe.")

        return value


    # Hacemos las validaciones relacionadas con el tipo (vacuna/tratamiento) y el nombre escogido
    def validate(self, data):
        inventario = data.get('inventario_vt')
        tipo = data.get('tipo')  # Tipo del inventario.
        dosis = data.get('dosis')

        if inventario:
            # Se comprueba que que el tipo seleccionado en VTAnimales coincida con el del InventarioVT
            # Si no coincide la vacuna/tratamiento con el tipo escogido, muestra un error.
            if tipo and inventario.tipo != tipo:
                raise serializers.ValidationError(
                    f"El {tipo.lower()} seleccionado no coincide con el tipo del inventario: {inventario.tipo}."
                )
            # Se comprueba que la dosis no supere las unidades disponibles del inventario
            # Si la dosis que se desea suministrar es mayor que la del inventario, se muestra un error.
            if dosis and dosis > inventario.unidades:
                raise serializers.ValidationError(
                    f"No hay suficientes unidades en el inventario. Disponibles: {inventario.unidades}"
                )
            # Se comprueba que no se suministre 0 dosis.
            # Si la dosis es 0, se muestra un error.
            if dosis == 0:
                raise serializers.ValidationError(
                    f"La dosis suministrada debe ser mayor a 0."
                )
            #if inventario.unidades == 0:
            #    raise serializers.ValidationError(
            #        f". No hay suficientes dosis en el inventario KK. Disponibles: {inventario.unidades}"
            #    )
            # Se comprueba que se seleccione una vacuna o tratamiento que esté ACTIVA y NO INACTIVA.
            # Si es "INACTIVA", se muestra un error.
            if inventario.estado != "Activa":
                raise serializers.ValidationError(
                    f"El {tipo.lower()} seleccionado tiene el estado 'Inactivo' y por tanto, no se puede usar."
                )
        if not inventario:
             raise serializers.ValidationError("Se debe eleccionar una vacuna o tratamiento del inventario.")
        return data


# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de LISTAINSEMINACIONES (Inventario de inseminaciones)
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo ListaInseminaciones, por tanto se podrá hacer CRUD mediante la API
# Tiene referencias a Toro y Animal.
class ListaInseminacionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListaInseminaciones
        fields = '__all__'
        extra_kwargs = {
            'fecha_inseminacion': {
                'error_messages': {
                    'required': 'La fecha de inseminación es obligatoria.',
                    'invalid': 'La fecha de inseminación no es válida. El formato es AAAA-MM-DD',
                }
            },
            'hora_inseminacion': {
                'error_messages': {
                    'required': 'La hora de inseminación es obligatoria.',
                    'invalid': 'La hora de inseminación no es válida. El formato es HH:MM:[SS[.mmmmmm]]',
                }
            },

            'responsable': {
                'error_messages': {
                    'required': 'El responsable es obligatorio.',
                    'blank': 'El responsable no puede estar vacío.'
                }
            }
        }
    # Validaciones correspondiente al campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'I'  # Se pone el prefijo 'I-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"ERROR: El código debe tener el formato '{prefijo}-número' (Ej:'{prefijo}-1)'.")

        # Si el código existe en el sistema, se lanza un mensaje de error.
        if ListaInseminaciones.objects.filter(codigo=value).exists():
            raise serializers.ValidationError(f"ERROR: El código '{value}' existe.")

        return value

    # Validaciones generales. Se ejecuta después después de las validaciones de cada uno de los campos.
    # Se manejan los campos: id_vaca e id_toro.
    def validate(self, data):
        errores = {}

        if data.get('id_vaca') in [None, '']:
            errores['id_vaca'] = 'Debe seleccionar una vaca válida.'
        if data.get('id_toro') in [None, '']:
            errores['id_toro'] = 'Debe seleccionar un toro válido.'

        if errores:
            raise serializers.ValidationError(errores)

        return data