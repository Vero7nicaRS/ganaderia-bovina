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
from datetime import timedelta
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Animal, Toro, Corral, InventarioVT, VTAnimales, ListaInseminaciones


# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de ANIMAL
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo Animal, por tanto se podrá hacer CRUD mediante la API
class AnimalSerializer(serializers.ModelSerializer):
    #Ya está incluido en el '__al__' --> comentario = serializers.CharField(required=False, allow_blank=True)
    # La comprobación del campo "unique" se hace antes que la del validate_codigo.
    # Por ello, se hace la comprobación aquí.
    # Si el código existe en el sistema, se lanza un mensaje de error
    codigo = serializers.CharField(
        required=False,
        allow_null=True,
        validators=[
            UniqueValidator(
                queryset=Animal.objects.all(),
                message=f"El código ya existe en el sistema."
            )
        ]
    )
    nombre = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=Animal.objects.all(),
                message="Ya existe un animal (vaca/ternero) con este nombre."
            )
        ],
        error_messages={
            'required': 'El nombre es obligatorio.',
            'blank': 'El nombre no puede estar vacío.'
        }
    )
    class Meta:
        model = Animal
        fields = '__all__'
        extra_kwargs = {
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
                    'null': 'El número de células somáticas no puede ser nulo.'
                }
            },
            'produccion_leche': {
                'error_messages': {
                    'required': 'La producción de leche es obligatoria.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 0.",
                    'null': 'La producción de leche no puede ser nulo.'

                }
            },
            'grasa': {
                'error_messages': {
                    'required': 'El porcentaje de grasa es obligatorio.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 2.5.",
                    'max_value': "El valor máximo permitido es 6.",
                    'null': 'El porcentaje de grasa no puede ser nulo.'
                }
            },
            'proteinas': {
                'error_messages': {
                    'required': 'El porcentaje de proteínas es obligatorio.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 2.8.",
                    'max_value': "El valor máximo permitido es 4.",
                    'null': 'El porcentaje de proteínas no puede ser nulo.'
                }
            },
            'calidad_patas': {
                'error_messages': {
                    'required': 'La calidad de patas es obligatoria.',
                    'invalid': 'Debe ser un número decimal entre 1 y 9.',
                    'min_value': 'El valor mínimo permitido es 1.',
                    'max_value': 'El valor máximo permitido es 9.',
                    'null': 'La calidad de patas no puede ser nulo.'
                }
            },
            'calidad_ubres': {
                'error_messages': {
                    'required': 'La calidad de ubres es obligatoria.',
                    'invalid': 'Debe ser un número decimal entre 1 y 9.',
                    'min_value': 'El valor mínimo permitido es 1.',
                    'max_value': 'El valor máximo permitido es 9.',
                    'null': 'La calidad de ubres no puede ser nulo.'
                }
            },
            'padre': {
                'error_messages': {
                    'required': 'El padre es obligatorio.',
                    'null': 'Debe seleccionar un padre válido.',
                    'invalid': 'El valor del padre no es válido.'
                }
            },
        }

    # validate_<campo>: Validación para el campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        tipo = self.initial_data.get('tipo')  # Se obtiene el tipo del payload original
        prefijo = 'V' if tipo == 'Vaca' else 'C' # Se pone un prefijo distinto si es una vaca (V-x) o un ternero (C-x)
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"El código debe tener el formato '{prefijo}-número' (Ej: {prefijo}-1).")

        # OBSERVACIÓN:
        # El campo 'codigo' tiene un UniqueValidator, controlando si el código existe en la creación o modificación
        # del objeto.
        # En este caso, el código NO se puede modificar una vez creado. Por tanto, no hace falta hacer
        # ".exclude(id=self.instance.id)."
        # Sin embargo, si en el futuro se permite cambiar el código, se tendría que incluir esa validación de
        # manera manual en el "validate_codigo".
        # -----------------------  NO USAR ACTUALMENTE EL CÓDIGO DE ABAJO: --------------------------
        # Si el código existe en el sistema, se lanza un mensaje de error.
        # También, si se modifica el animal se excluye ese "id" de la lista para que no haya conflicto en el filtrado.

        # No funciona aquí, porque unique se ejecuta antes que el validate_codigo
        # Si el código existe en el sistema, se lanza un mensaje de error.
        # if Animal.objects.filter(codigo=value).exclude(id=self.instance.id).exists():
        #    raise serializers.ValidationError(
        #        f"El código '{value}' ya existe en el sistema."
        #    )

        return value

    # validate_<campo>: Validación para el campo "padre".
    # def validate_padre(self, value):
    #    if value in [None, '']:
    #        raise serializers.ValidationError('Debe seleccionar un padre válido.')
    #    return value
    def validate_padre(self, value):
        if not self.instance and value in [None, '']:
            # Si se está creando un animal (no hay instancia), y no se indica padre
            raise serializers.ValidationError('Debe seleccionar un padre válido.')
        return value

    # validate_<campo>: Validación para el campo "madre".
    #def validate_madre(self, value):
    #    if value in [None, '']:
    #        raise serializers.ValidationError('Debe seleccionar una madre válida.')
    #    return value

    def validate_madre(self, value):
        if not self.instance and value in [None, '']:
            # Si se está creando un animal (no hay instancia), y no se indica madre
            raise serializers.ValidationError('Debe seleccionar una madre válida.')
        return value
    # validate_<campo>: Validación para el campo "corral".
    def validate_corral(self, value):
        if value in [None, '']:
            raise serializers.ValidationError('Debe seleccionar un corral válido.')
        return value

    # Se comprueba que la fecha de eliminación del animal sea POSTERIOR o IGUAL a la fecha de nacimiento.
    def validate(self,data):

        # Se obtienen los valores que hay en los campos: fecha_nacimiento, fecha_eliminacion y estado.
        fecha_nacimiento = data.get('fecha_nacimiento')
        fecha_eliminacion = data.get('fecha_eliminacion')
        estado = data.get('estado')

        # Si el estado es "MUERTE" o "VENDIDA" y no tiene fecha de eliminación, se muestra mensaje de error.
        if estado and (estado == "Muerte" or estado == "Vendida") and not fecha_eliminacion :
            raise serializers.ValidationError({
                "fecha_eliminacion": f"Debe indicar la fecha de eliminación si el estado es: Muerte o Vendida."
            })

        # Si el estado NO es "MUERTE" o "VENDIDA" y tiene fecha de eliminación, se muestra mensaje de error.
        if estado and not(estado == "Muerte" or estado == "Vendida") and  fecha_eliminacion :
            raise serializers.ValidationError({
                "fecha_eliminacion": f"Solo debe indicar fecha de eliminación si el estado es:"
                                     f" Muerte o Vendida."
            })

        # Si la fecha de nacimiento es POSTERIOR a la de eliminación, se muestra un mensaje de error.
        if fecha_nacimiento and fecha_eliminacion and fecha_nacimiento > fecha_eliminacion:
            raise serializers.ValidationError({
                "fecha_eliminacion": "La fecha de eliminación debe ser posterior o igual a la fecha de nacimiento."
            })
        return data

# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de TORO
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo Toro, por tanto, se podrá hacer CRUD mediante la API
class ToroSerializer(serializers.ModelSerializer):

    codigo = serializers.CharField(
        required=False,
        allow_null=True,
        validators=[
            UniqueValidator(
                queryset=Toro.objects.all(),
                message=f"El código ya existe en el sistema."
            )
        ]
    )
    nombre = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=Toro.objects.all(),
                message="Ya existe un toro con este nombre."
            )
        ],
        error_messages={
            'required': 'El nombre es obligatorio.',
            'blank': 'El nombre no puede estar vacío.'
        }
    )

    class Meta:
        model = Toro
        fields = '__all__'
        extra_kwargs = {
            'cantidad_semen': {
                'error_messages': {
                    'required': 'La cantidad de semen es obligatoria.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 0.",
                    'null': 'La cantidad de semen no puede ser nulo.'
                }
            },
            'transmision_leche': {
                'error_messages': {
                    'required': 'La producción de leche es obligatoria.',
                    'invalid': 'Debe introducir un número válido.',
                    'min_value': "El valor mínimo permitido es 0.",
                    'null': 'La producción de leche no puede ser nulo.'
                }
            },
            'celulas_somaticas': {
                'error_messages': {
                    'required': 'El número de células somáticas es obligatorio.',
                    'invalid': 'Debe introducir un número entero válido.',
                    'null': 'El número de células somáticas no puede ser nulo.'
                }
            },
            'calidad_patas': {
                'error_messages': {
                    'required': 'La calidad de patas es obligatoria.',
                    'invalid': 'Debe ser un número decimal entre 1 y 9.',
                    'min_value': 'El valor mínimo permitido es 1.',
                    'max_value': 'El valor máximo permitido es 9.',
                    'null': 'La calidad de patas no puede ser nulo.'
                }
            },
            'calidad_ubres': {
                'error_messages': {
                    'required': 'La calidad de ubres es obligatoria.',
                    'invalid': 'Debe ser un número decimal entre 1 y 9.',
                    'min_value': 'El valor mínimo permitido es 1.',
                    'max_value': 'El valor máximo permitido es 9.',
                    'null': 'La calidad de ubres no puede ser nulo.'
                }
            },
            'grasa': {
                'error_messages': {
                    'required': 'El porcentaje de grasa es obligatorio.',
                    'invalid': 'Debe introducir un número válido.',
                    'null': 'El porcentaje de proteínas no puede ser nulo.'
                }
            },
            'proteinas': {
                'error_messages': {
                    'required': 'El porcentaje de proteínas es obligatorio.',
                    'invalid': 'Debe introducir un número válido.',
                    'null': 'El porcentaje de proteínas no puede ser nulo.'
                }
            }
        }

    # to_representation: cuando se llame a /toros/ (endpoint), se devuelve { "id":3 , "codigo": "T-3", "tipo":Toro, ...}
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['tipo'] = 'Toro'
        return data
    # validate_<campo>: Validación para el campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'T'  # Se pone el prefijo 'T-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"El código debe tener el formato '{prefijo}-número' (Ej: {prefijo}-1).")

        return value


# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de CORRAL
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo Corral, por tanto se podrá hacer CRUD mediante la API
class CorralSerializer(serializers.ModelSerializer):
    cantidad_animales = serializers.SerializerMethodField() # Número de animales en el corral.
    animales = serializers.SerializerMethodField() # Animales que hay en el corral.
    codigo = serializers.CharField(
                required=False,
                allow_null=True,
                validators=[
                    UniqueValidator(
                        queryset=Corral.objects.all(),
                        message=f"El código ya existe en el sistema."
                    )
                ]
            )
    nombre = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=Corral.objects.all(),
                message="Ya existe un corral con este nombre."
            )
        ],
        error_messages={
            'required': 'El nombre es obligatorio.',
            'blank': 'El nombre no puede estar vacío.'
        }
    )
    class Meta:
        model = Corral
        fields = '__all__'

    # validate_<campo>: Validación para el campo "codigo".
    def validate_codigo(self, value):
        if not value:
                return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'CORRAL'  # Se pone el prefijo 'CORRAL-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"El código debe tener el formato '{prefijo}-número' (Ej: {prefijo}-1).")

        return value

    # Se obtiene el número de animales que tiene el corral con el campo calculado.
    def get_cantidad_animales(self, obj):
        return obj.animales.count()

    # Se obtienen los animales que hay en el corral gracias a la relación con Animal.
    def get_animales(self, obj):
        # return [str(animal) for animal in obj.animales.all()]
       return [{
           "codigo": animal.codigo,
           "nombre": animal.nombre
       } for animal in obj.animales.all()]

# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de INVENTARIOVT (Vacunas y tratamientos del inventario)
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo InventarioVT, por tanto se podrá hacer CRUD mediante la API
class InventarioVTSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(
        required=False,
        allow_null=True,
        validators=[
            UniqueValidator(
                queryset=InventarioVT.objects.all(),
                message=f"El código ya existe en el sistema."
            )
        ]
    )
    nombre = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=InventarioVT.objects.all(),
                message="Ya existe una vacuna/tratamiento con este nombre."
            )
        ],
        error_messages={
            'required': 'El nombre es obligatorio.',
            'blank': 'El nombre no puede estar vacío.'
        }
    )
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
                    'min_value': "El valor mínimo permitido es 0.",
                    'max_value': "El valor máximo permitido es 30.",
                    'null': "El número de unidades no puede ser nulo."
                }
            }
        }

    # validate_<campo>: Validación para el campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'VT'  # Se pone el prefijo 'VT-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"El código debe tener el formato '{prefijo}-número' (Ej: {prefijo}-1).")

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
    codigo = serializers.CharField(
        required=False,
        allow_null=True,
        validators=[
            UniqueValidator(
                queryset=VTAnimales.objects.all(),
                message=f"El código ya existe en el sistema."
            )
        ]
    )
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
            }
        }

    # validate_<campo>: Validación para el campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'VTA'  # Se pone el prefijo 'VTA-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"El código debe tener el formato '{prefijo}-número' (Ej: {prefijo}-1).")

        return value

    # validate_<campo>: Validación para el campo "id_animal".
    def validate_id_animal(self,value):
        if value in [None, '']:
            raise serializers.ValidationError('Se debe seleccionar un identificador de animal válido.')
        return value


    # validate_<campo>: Validación para el campo "inventario_vt".
    def validate_inventario_vt(self,value):
        if value in [None, '']:
            raise serializers.ValidationError("Se debe seleccionar una vacuna o tratamiento del inventario.")
        return value

    # Hacemos las validaciones relacionadas con el tipo (vacuna/tratamiento) y el nombre escogido
    def validate(self, data):
        animal = data.get("id_animal")
        fecha = data.get("fecha_inicio")

        inventario = data.get('inventario_vt')
        tipo = data.get('tipo')  # Tipo del inventario.
        dosis = data.get('dosis')
        fecha_inicio = data.get('fecha_inicio')
        fecha_finalizacion = data.get('fecha_finalizacion')

        if fecha_inicio and fecha_finalizacion and fecha_inicio > fecha_finalizacion:
            raise serializers.ValidationError({
                "fecha_finalizacion": "La fecha de finalización debe ser posterior a la fecha de inicio."
            })

        if inventario:
            # Se comprueba que el tipo seleccionado en VTAnimales coincida con el del InventarioVT
            # Si no coincide la vacuna/tratamiento con el tipo escogido, muestra un error.
            if tipo and inventario.tipo != tipo:
                raise serializers.ValidationError(
                   # f"El {tipo.lower()} seleccionado no coincide con el tipo del inventario: {inventario.tipo}."
                    # El error se asocia al campo "tipo" y arriba no se asociaba (cambiado para los test)
                    {"tipo": f"El tipo '{tipo.lower()}' seleccionado no coincide con el tipo del inventario: {inventario.tipo}."}
                )

            # Se comprueba que se seleccione una vacuna o tratamiento que esté ACTIVA y NO INACTIVA.
            # Si es "INACTIVA", se muestra un error.
            if inventario.estado != "Activa":
                raise serializers.ValidationError(
                    {"estado": f"{'El' if tipo.lower() == 'tratamiento' else 'La'} "
                               f"{tipo.lower()} suministrad{'o' if inventario.tipo.lower() == 'tratamiento' else 'a'}"
                               f" tiene el estado 'Inactivo' y por tanto, no se puede usar."}
                )

        # Se comprueba que NO se repitan vacuna/tratamiento suministrados en el mismo año (<365 días)
        if animal and inventario and fecha:
            intervalo = fecha - timedelta(days=365)
            mismo_anio = VTAnimales.objects.filter(
                id_animal=animal,
                inventario_vt=inventario,
                fecha_inicio__gte=intervalo,
                fecha_inicio__lte=fecha
            )
            if self.instance:
                mismo_anio = mismo_anio.exclude(pk=self.instance.pk)

            if mismo_anio.exists():
                raise serializers.ValidationError({
                    "inventario_vt": f"Est{'e tratamiento' if inventario.tipo.lower() == 'tratamiento' else 'a vacuna'} "
                                     f"ya fue suministrad{'o' if inventario.tipo.lower() == 'tratamiento' else 'a'} "
                                     f"a {animal.codigo} en los últimos 365 días."
                })
        return data

    def create(self, validated_data):
        inventario = validated_data.get('inventario_vt')

        if inventario.unidades < 1:
            # Si no hay suficientes unidades (0) en el inventario cuando se va a suministrar la vacuna/tratamiento,
            # se muestra un mensaje de error.
            raise serializers.ValidationError({
                 "inventario_vt": f"No hay suficientes unidades disponibles de "
                                 f"{inventario.tipo.lower()} '{inventario.nombre}'."
            })

        # Cuando se crea esa vacuna, se resta automáticamente una unidad a su inventario.
        inventario.unidades -= 1
        inventario.save()
            # Se crea el registro de VTAnimales como normalmente
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Se busca la vacuna/tratamiento que ha sido suministrada, por si ha habido algún cambio en la modificación.
        inventario_anterior = instance.inventario_vt
        inventario_nuevo = validated_data.get("inventario_vt", inventario_anterior)

        # Si modifico una vacuna/tratamiento y le cambio la vacuna/tratamiento suministrado.
        # Hay que hacer "sumas" y "restas", ya que la vacuna antigua (origen) pasará a tener +1 en el inventario,
        # dado que no ha sido suministrada. Y la vacuna nueva (destino) pasará a tener -1 en el inventario.
        # Ej:
        # -> Inventario Vacuna "X": 10.
        # Se usa Vacuna "X" en V-35.
        # -> Inventario Vacuna "X": 9.
        # Se modifica Vacuna "X" por Tratamiento "Y" en V-35.
        # -> Inventario de Vacuna "Y" tenía 5 y pasa a tener 4.
        # -> Inventario de Vacuna "X" tenía 9 y pasa a tener 10.
        # Se hacen suma/resta de las unidades de los inventarios, si ha cambiado esa vacuna/tratamiendo suministrado
        if inventario_anterior != inventario_nuevo:
            if inventario_nuevo.unidades < 1:
                raise serializers.ValidationError({
                    "inventario_vt": f"No hay suficientes unidades disponibles de {inventario_nuevo.tipo.lower()} '"
                                     f"{inventario_nuevo.nombre}'."
                })
            # Se suma 1 a la unidad del inventario anterior
            inventario_anterior.unidades += 1
            inventario_anterior.save()

            # Se resta 1 a la unidad del nuevo inventario
            inventario_nuevo.unidades -= 1
            inventario_nuevo.save()

        return super().update(instance, validated_data)

# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de LISTAINSEMINACIONES (Inventario de inseminaciones)
# --------------------------------------------------------------------------------------------------------------

# Incluye todos los campos del modelo ListaInseminaciones, por tanto se podrá hacer CRUD mediante la API
# Tiene referencias a Toro y Animal.
class ListaInseminacionesSerializer(serializers.ModelSerializer):

    codigo = serializers.CharField(
        required=False,
        allow_null=True,
        validators=[
            UniqueValidator(
                queryset=ListaInseminaciones.objects.all(),
                message=f"El código ya existe en el sistema."
            )
        ]
    )
    class Meta:
        model = ListaInseminaciones
        fields = '__all__'
        extra_kwargs = {
            'fecha_inseminacion': {
                'error_messages': {
                    'required': 'La fecha de inseminación es obligatoria.',
                    'invalid': 'La fecha de inseminación no es válida. El formato es AAAA-MM-DD.',
                }
            },
            'hora_inseminacion': {
                'error_messages': {
                    'required': 'La hora de inseminación es obligatoria.',
                    'invalid': 'La hora de inseminación no es válida. El formato es HH:MM:[SS[.mmmmmm]].',
                }
            },

            'responsable': {
                'error_messages': {
                    'required': 'El responsable es obligatorio.',
                    'blank': 'El responsable no puede estar vacío.'
                }
            }
        }
    # validate_<campo>: Validación para el campo "codigo".
    def validate_codigo(self, value):
        if not value:
            return value  # Se genera el código de manera automática-
        # Si el usuario introduce el código se va a comprobar si tiene el formato adecuado y si existe.
        prefijo = 'I'  # Se pone el prefijo 'I-x'
        patron = rf"^{prefijo}-\d+$"

        # Si el código no tiene el formato adecuado, se lanza un mensaje de error.
        if not re.match(patron, value):
            raise serializers.ValidationError(f"El código debe tener el formato '{prefijo}-número' (Ej: {prefijo}-1).")

        return value

     # validate_<campo>: Validación para el campo "id_vaca".
    def validate_id_vaca(self,value):
        if value in [None, '']:
            raise serializers.ValidationError('Debe seleccionar una vaca válida.')
        return value

    # validate_<campo>: Validación para el campo "id_toro".
    def validate_id_toro(self,value):
        if value in [None, '']:
            raise serializers.ValidationError('Debe seleccionar un toro válido.')
        return value

    # Al crearse una inseminación, se actualiza la cantidad semen que tiene el toro.
    # Una inseminación solo usa 1 cantidad de semen del toro.
    def create(self, validated_data):
        toro = validated_data["id_toro"]
        if toro and toro.cantidad_semen <= 0:
            raise serializers.ValidationError({
                "id_toro": f"El toro {toro.codigo} no tiene suficiente cantidad de semen para inseminar."
            })
        toro.cantidad_semen -= 1 # Se decrementa la cantidad de semen a 1.
        toro.save() # Se guarda la información actualizada del toro.
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Se busca al toro que ya estaba en la inseminación por si ha habido algún cambio en la modificación.
        toro_anterior = instance.id_toro
        toro_nuevo = validated_data.get("id_toro", toro_anterior)
        # Si modifico el "id" del toro y lo cambio por otro toro.
        # Hay que hacer "sumas" y "restas" de la cantidad de semen del toro,
        # Hay que hacer "sumas" y "restas" de la cantidad de semen del toro,
        # ya que el toro (origen) pasará a tener +1 en su cantidad de semen, dado que no ha sido suministrada.
        # Y el nuevo toro (destino) pasará a tener -1 en su cantidad de semen.
        # Ej:
        # -> Cantidad semen del toro "T-12": 10.
        # Se usa el toro "T-12" en V-35.
        # -> Cantidad semen del toro "T-12": 9.
        # Se modifica el toro "T-12" por el toro "T-14" en V-35.
        # -> Cantidad semen del toro "T-14" tenía 5 y pasa a tener 4.
        # -> Cantidad semen del toro "T-12" tenía 9 y pasa a tener 10.

        # Si el toro ha cambiado, se modifica las cantidades del semen del toro antiguo y del toro nuevo.
        if toro_anterior != toro_nuevo:
            if toro_nuevo.cantidad_semen <= 0:
                raise serializers.ValidationError({
                    "id_toro": f"El toro {toro_nuevo.codigo} no tiene suficiente cantidad de semen para inseminar."
                })
            # Se suma 1 a la cantidad de semen del toro anterior.
            toro_anterior.cantidad_semen += 1
            toro_anterior.save()
            # Se quita 1 a la cantidad de semen del nuevo toro.
            toro_nuevo.cantidad_semen -= 1
            toro_nuevo.save()

        return super().update(instance, validated_data)

# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de CustonTokenObtainPain
# --------------------------------------------------------------------------------------------------------------

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Se comprueba que el usuario tiene un perfil
        if hasattr(user, 'perfil') and user.perfil:
            token['rol'] = user.perfil.rol  # Suponiendo que tiene un perfil con campo "rol"
        else:
            token['rol'] = 'Desconocido'  # o lanza una excepción controlada
        token['username'] = user.username
        return token