#
# --------------------------------- views.py: ---------------------------------
# Funcionalidad: permite realizar todas las operaciones CRUD sin necesidad de
# escribirlas y conectarse con los modelos y sus serializers.  [RECIBE PETICIONES]
# Se consigue:
# GET /.../
# GET /.../{id}/
# GET /.../?... & ...
# POST /.../
# PUT /.../{id}
# DELETE /.../{id}
#
# ¿Qué código se escribe?
# - Manejo de rutas y lógica: viewsets, APIView o generics.
# - Mensajes personalizados (ej: se borra algún elemento y aparece un mensaje indicándolo)
# - Try/catch: manejo de errores.
# - Método destroy(): cuando se hace "DELETE", se ejecuta y se realiza la acción
#   o se muestra error si no se ha podido hacer.
#
# También, se verifica los permisos que tiene el usuario.
# -----------------------------------------------------------------------------------
from datetime import datetime

from django.db.models import ProtectedError
from django.http import Http404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import NotFound
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .filters import AnimalFilter, ToroFilter, CorralFilter, InventarioVTFilter, VTAnimalesFilter, \
    ListaInseminacionesFilter
from .models import Animal, Toro, Corral, InventarioVT, VTAnimales, ListaInseminaciones
from .permisos import EsAdministrador, PermisosPorModelo
from .serializers import AnimalSerializer, ToroSerializer, CorralSerializer, InventarioVTSerializer, \
    VTAnimalesSerializer, ListaInseminacionesSerializer, CustomTokenObtainPairSerializer
from .simulacionCria import simular_cria_optima, agregar_y_reentrenar_cria

import traceback
# --------------------------------------------------------------------------------------------------------------
#                                       Vista de ANIMAL
# --------------------------------------------------------------------------------------------------------------

class AnimalViewSet(viewsets.ModelViewSet):
    # Se usan los permisos del modelo.
    # Django se encarga de asignar el permiso según la petición que se realice.
    permission_classes = [PermisosPorModelo]
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer

    # Para realizar filtrado de los datos mediante la URL
    # filter_backends y filterset_class son clases predefinidas (NO CAMBIAR EL NOMBRE) de Django REST.
    # filter_backend: indica que clase se encarga de aplicar los filtros y activa el filtrado. También, permite que la información se ordene de manera
    #                 ascendente o descendente.
    # filterset_class: indica que campos de la clase "X" pueden ser usados en la URL como filtros.
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = AnimalFilter
    # Se van a filtrar los datos de los animales (Vacas/Terneros) por:
    # Células somáticas, produccion_leche, calidad_patas, calidad_ubres, grasa, proteintas,
    # tipo (Vaca o Ternero), estado (Vacía, Inseminada, Preñada, No inseminar, Joven, Muerte y Vendida),
    # corral donde estén, identificador de sus reproductores,nombre, fecha_nacimiento y fecha_eliminacion.

    # Se pueden ordenar los campos indicados en la URL.
    # Ascendente: animales/?ordering = (No se le indica nada)
    # Descentente: animales/?ordering= - ... (Se le indica un símbolo "-")
    ordering_fields = ['nombre', 'celulas_somaticas','produccion_leche', 'calidad_patas',
                       'calidad_ubres','grasa','proteinas','corral','padre','madre', 'fecha_nacimiento',
                       'fecha_eliminacion']
    ordering = ['nombre'] # Ordenación por defecto.

    # get_object: obtiene la instancia del modelo en la base de datos y lanza excepción si no lo encuentra.
    def get_object(self):
        try:
            return super().get_object()
        # Si se accede a un animal (vaca/ternero) que no existe.
        except Http404:
            pk = self.kwargs.get("pk")   # Se obtiene el identificador de la URL
            raise NotFound({"ERROR": f"El Animal {pk} no ha sido encontrado. "
                                     f"Comprueba el identificador introducido."})

    # Eliminar usando el botón "ELIMINAR".
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        codigo = instance.codigo
        tipo = instance.tipo.lower()

        try:
            self.perform_destroy(instance)
            return Response(
                {"mensaje": f"{'El' if tipo.lower() == 'ternero' else 'La'} "
                 f"{tipo.lower()} "
                 f"{codigo} ha sido eliminad{'o' if tipo.lower() == 'ternero' else 'a'} correctamente."},
                status=status.HTTP_200_OK
            )
        # OBSERVACIÓN:
        # La excepción PROTECTED no se ha a ejecutar en ningún momento, ya que se usa SET_NULL en las relaciones.
        # Sin embargo, se va a dejar esta excepción indicada por si en el futuro se cambia la lógica de eliminación.
        except ProtectedError as e:
            return Response(
                {
                    "ERROR": f"No se puede eliminar {'el' if tipo == 'Ternero' else 'la'} {tipo} {codigo} "
                             f"porque está asociado a otros registros.",
                    "MOTIVO DEL ERROR": "\n".join(f"- {obj}" for obj in e.protected_objects)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({
                "ERROR": "Error inesperado.",
                "MOTIVO DEL ERROR": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Eliminar cuando se le indica un motivo: ERROR, VENDIDA o MUERTE (URL: /eliminar/?motivo=)
    @action(detail=True, methods=['delete'], url_path='eliminar')
    def eliminar_animal(self, request, pk=None):
        instance = self.get_object()
        codigo = instance.codigo
        tipo = instance.tipo.lower()
        try:


            motivo = request.query_params.get('motivo', '').upper()
            if motivo == "ERROR":
                return self.destroy(request, pk=pk)  # Se utiliza el método destroy de arriba.

            elif motivo in ["MUERTE", "VENDIDA"]:
                # Se le da la posibilidad al usuario que introduzca una fecha de eliminación.
                # Si no se indica, se tomará la del día actual.
                fecha_eliminacion = request.query_params.get('fechaEliminacion')
                if fecha_eliminacion:
                    try:
                        instance.fecha_eliminacion = datetime.strptime(fecha_eliminacion, "%Y-%m-%d").date()
                    except ValueError:
                        return Response({
                            "ERROR": "Formato de fecha inválido. Usa AAAA-MM-DD (ejemplo: 2025-04-20)."
                        }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    instance.fecha_eliminacion = datetime.now().date()

                instance.estado = motivo.capitalize()
                instance.corral = None  # Eliminar del corral
                # Se añade el comentario que se ha podido indicar en la eliminación.
                comentario = request.query_params.get('comentario', '')
                instance.comentario = comentario
                instance.save()
                return Response(
                    {f"{'El' if tipo == 'Ternero' else 'La'} "
                     f"{tipo} "
                     f"{codigo}"
                     f" ha actualizado su Estado a {motivo}. Se ha Eliminado {codigo} del corral."}
                )

            else:
                return Response({"ERROR": "El motivo seleccionado no es correcto. Usa 'ERROR', 'MUERTE' o 'VENDIDA'."},
                                status=status.HTTP_400_BAD_REQUEST)

        # Si se produce una excepción por relaciones protegidas de los animales.
        except ProtectedError as e:
            return Response({"ERROR": "No se puede eliminar"
                                      f"{'El' if tipo == 'Ternero' else 'La'} "
                                      f"{tipo} "
                                      f"{codigo}"
                                      " por relaciones protegidas.", "MOTIVO DE ERROR": str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"ERROR": "Error inesperado.", "MOTIVO DE ERROR": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --------------------------------------------------------------------------------------------------------------
#                                       Vista de TORO
# --------------------------------------------------------------------------------------------------------------

class ToroViewSet(viewsets.ModelViewSet):
    # Se usan los permisos del modelo.
    # Django se encarga de asignar el permiso según la petición que se realice.
    permission_classes = [PermisosPorModelo]
    queryset = Toro.objects.all()
    serializer_class = ToroSerializer

    # Para realizar filtrado de los datos mediante la URL
    # filter_backends y filterset_class son clases predefinidas (NO CAMBIAR EL NOMBRE) de Django REST.
    # filter_backend: indica que clase se encarga de aplicar los filtros y activa el filtrado. También, permite que la información se ordene de manera
    #                 ascendente o descendente.
    # filterset_class: indica que campos de la clase "X" pueden ser usados en la URL como filtros.
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ToroFilter
    # Se van a filtrar los datos de los Toros por:
    # El estado (Vivo, muerte u otros), nombre, celulas_somaticas, transmision_leche, cantidad_semen,
    # calidad_patas, calidad_ubres, grasa, proteinas y fecha_eliminacion

    # Se pueden ordenar los campos indicados en la URL.
    # Ascendente: toros/?ordering= ... (No se le indica nada)
    # Descentente: toros/?ordering= - ... (Se le indica un símbolo "-")
    ordering_fields = ['nombre', 'celulas_somaticas','transmision_leche', 'cantidad_semen',
                       'calidad_patas', 'calidad_ubres','grasa','proteinas']
    ordering = ['nombre'] # Ordenación por defecto.

    # get_object: obtiene la instancia del modelo en la base de datos y lanza excepción si no lo encuentra.
    def get_object(self):
        try:
            return super().get_object()
        # Si se accede a un toro que no existe.
        except Http404:
            pk = self.kwargs.get("pk")   # Se obtiene el identificador de la URL
            raise NotFound({"ERROR": f"El Toro {pk} no ha sido encontrado. "
                                     f"Comprueba el identificador introducido."})

    # Eliminar usando el botón "ELIMINAR".
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        codigo = instance.codigo
        try:
            self.perform_destroy(instance)
            return Response(
                {
                 "mensaje": f"El toro {codigo} ha sido eliminado correctamente."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({
                "ERROR": "Error inesperado.",
                "MOTIVO DEL ERROR": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Eliminar cuando se le indica un motivo: ERROR, MUERTE U OTROS (URL: /eliminar/?motivo=)
    @action(detail=True, methods=['delete'], url_path='eliminar')
    def eliminar_toro(self, request, pk=None):
        instance = self.get_object()
        motivo = request.query_params.get('motivo', '').upper()
        codigo = instance.codigo
        try:

            if motivo == 'ERROR':
                return self.destroy(request, pk=pk)  # Se utiliza el método destroy de arriba.
            elif motivo in ['MUERTE', 'OTROS']:
                instance.estado = 'Muerte' if motivo == 'MUERTE' else 'Otros'
                # instance.fecha_eliminacion = datetime.now()
                instance.save()
                return Response(
                    {"mensaje": f'El Toro {codigo} ha cambiado su estado a {instance.estado.lower()} '
                                            f'(ha sido eliminado pero se mentiene en el sistema).'},
                                status=status.HTTP_200_OK)

            else:
                return Response({'ERROR': "El motivo seleccionado no es correcto. Usa: 'ERROR', 'MUERTE' u 'OTROS'."},
                                status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'ERROR': 'Error inesperado.', 'detalles': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --------------------------------------------------------------------------------------------------------------
#                                       Vista de CORRAL
# --------------------------------------------------------------------------------------------------------------

class CorralViewSet(viewsets.ModelViewSet):
    # Se usan los permisos del modelo.
    # Django se encarga de asignar el permiso según la petición que se realice.
    permission_classes = [PermisosPorModelo]
    queryset = Corral.objects.all()
    serializer_class = CorralSerializer

    # Para realizar filtrado de los datos mediante la URL
    # filter_backends y filterset_class son clases predefinidas (NO CAMBIAR EL NOMBRE) de Django REST.
    # filter_backend: indica que clase se encarga de aplicar los filtros y activa el filtrado. También, permite que la información se ordene de manera
    #                 ascendente o descendente.
    # filterset_class: indica que campos pueden ser usados en la URL como filtros.
    filter_backends = [DjangoFilterBackend]
    filterset_class = CorralFilter
    # Se van a filtrar los datos del Corral por el nombre del corral.

    # Se pueden ordenar los campos indicados en la URL.
    # Ascendente: corrales/?ordering= ... (No se le indica nada)
    # Descentente: corrales/?ordering= - ... (Se le indica un símbolo "-")
    ordering_fields = ['nombre']
    ordering = ['nombre'] # Ordenación por defecto.

    # get_object: obtiene la instancia del modelo en la base de datos y lanza excepción si no lo encuentra.
    def get_object(self):
        try:
            return super().get_object()
        # Si se accede a un corral que no existe.
        except Http404:
            pk = self.kwargs.get("pk")   # Se obtiene el identificador de la URL
            raise NotFound({"ERROR": f"El Corral {pk} no ha sido encontrado. "
                                     f"Comprueba el identificador introducido."})

    # Eliminar usando el botón "ELIMINAR".
    def destroy(self, request, *args, **kwargs):
            instance = self.get_object()
            codigo = instance.codigo
            try:
                self.perform_destroy(instance)
                return Response(
                    {"mensaje": f"El corral {codigo} ha sido eliminado correctamente."},
                    status=status.HTTP_200_OK
                )
            except ProtectedError:
                return Response(
                    {"ERROR": f"No se puede eliminar el corral {codigo} porque contiene animales asociados."},
                    status=status.HTTP_400_BAD_REQUEST
                )

# --------------------------------------------------------------------------------------------------------------
#                                       Vista de INVENTARIOVT (Vacunas y tratamientos del inventario)
# --------------------------------------------------------------------------------------------------------------

class InventarioVTViewSet(viewsets.ModelViewSet):
    # Se usan los permisos del modelo.
    # Django se encarga de asignar el permiso según la petición que se realice.
    permission_classes = [PermisosPorModelo]
    queryset = InventarioVT.objects.all()
    serializer_class = InventarioVTSerializer

    # Para realizar filtrado de los datos mediante la URL
    # filter_backends y filterset_class son clases predefinidas (NO CAMBIAR EL NOMBRE) de Django REST.
    # filter_backend: indica que clase se encarga de aplicar los filtros y activa el filtrado. También, permite que la información se ordene de manera
    #                 ascendente o descendente.
    # filterset_class: indica que campos pueden ser usados en la URL como filtros.
    filter_backends = [DjangoFilterBackend]
    filterset_class = InventarioVTFilter
    # Se van a filtrar los datos del InventarioVT por:
    # El nombre, tipo (tratamiento y vacuna), estado (activa e inactiva),
    # unidades que hay de ese tratamiento/vacuna (pudiendo ser una cantidad o un rango) y
    # cantidad (sobre y botella).

    # Se pueden ordenar los campos indicados en la URL.
    # Ascendente: inventariovt/?ordering= ... ... (No se le indica nada)
    # Descentente: inventariovt/?ordering= - ... (Se le indica un símbolo "-")
    ordering_fields = ['nombre', 'cantidad','cantidad', 'unidades']
    ordering = ['nombre'] # Ordenación por defecto.

    # get_object: obtiene la instancia del modelo en la base de datos y lanza excepción si no lo encuentra.
    def get_object(self):
        try:
            return super().get_object()
        # Si se accede a un tratamiento/vacuna del inventario que no existe.
        except Http404:
            pk = self.kwargs.get("pk")   # Se obtiene el identificador de la URL
            raise NotFound({"ERROR": f"El tratamiento/la vacuna {pk} del inventario no se ha encontrado. "
                                     f"Comprueba el identificador introducido."})

    # Eliminar usando el botón "ELIMINAR".
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        codigo = instance.codigo
        tipo = instance.tipo.lower()

        try:
            self.perform_destroy(instance)
            return Response(
                {"mensaje": f"{'El' if tipo.lower() == 'tratamiento' else 'La'} "
                            f"{tipo.lower()} "
                            f"{codigo} ha sido eliminad{'o' if tipo == 'tratamiento' else 'a'} correctamente."},
                status=status.HTTP_200_OK
            )
        except ProtectedError as e:
            relaciones = "\n".join(f"- {obj}" for obj in e.protected_objects)
            return Response({
                "ERROR": f"No se puede eliminar '{codigo}' porque está asociado a otros registros.",
                "MOTIVO DEL ERROR": relaciones
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "ERROR": "Error inesperado.",
                "MOTIVO DEL ERROR": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Eliminar cuando se le indica un motivo: ERROR O INACTIVA.
    @action(detail=True, methods=['delete'], url_path='eliminar')
    def eliminar_vt_inventario(self, request, pk=None):
        instance = self.get_object()
        codigo = instance.codigo
        tipo = instance.tipo.lower()  # lo pasamos a minúsculas para construir el mensaje
        motivo = request.query_params.get('motivo', '').upper()
        try:
            if motivo == "ERROR":
                return self.destroy(request, pk=pk)  # Se utiliza el método destroy de arriba.
            elif motivo == "INACTIVA":

                instance.estado = motivo.capitalize()
                instance .save()
                return Response({"mensaje": f"{'El' if tipo == 'tratamiento' else 'La'} "
                                             f"{tipo} {codigo} se ha eliminado y permanece en el sistema. "
                                            f" El Estado se ha actualizado a {motivo}."})

            else:
                return Response({"ERROR": "El motivo seleccionado no es correcto: Usa 'ERROR' o 'INACTIVA'."},
                                status=status.HTTP_400_BAD_REQUEST)

        except ProtectedError as e:
            return Response({"ERROR": "No se puede eliminar por relaciones protegidas.", "detalles": str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"ERROR": "Error inesperado.", "detalles": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vista personalizada para filtrar inventario por tipo
@api_view(['GET'])
def inventario_por_tipo(request):
    tipo = request.query_params.get('tipo')

    if not tipo:
        return Response({'ERROR': 'Debes proporcionar el tipo (Tratamiento o Vacuna).'}, status=status.HTTP_400_BAD_REQUEST)

    if tipo not in ['Tratamiento', 'Vacuna']:
        return Response({'ERROR': 'Tipo no válido. Debe ser Tratamiento o Vacuna.'}, status=status.HTTP_400_BAD_REQUEST)

    inventario_filtrado = InventarioVT.objects.filter(tipo=tipo)
    serializer = InventarioVTSerializer(inventario_filtrado, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# --------------------------------------------------------------------------------------------------------------
#                                       Vista de VTANIMALES (Vacunas y tratamientos suministrados a los animales)
# --------------------------------------------------------------------------------------------------------------

class VTAnimalesViewSet(viewsets.ModelViewSet):
    # Se usan los permisos del modelo.
    # Django se encarga de asignar el permiso según la petición que se realice.
    permission_classes = [PermisosPorModelo]
    queryset = VTAnimales.objects.all()
    serializer_class = VTAnimalesSerializer
    # Para realizar filtrado de los datos mediante la URL
    # filter_backends y filterset_class son clases predefinidas (NO CAMBIAR EL NOMBRE) de Django REST.
    # filter_backend: indica que clase se encarga de aplicar los filtros y activa el filtrado. También, permite que la información se ordene de manera
    #                 ascendente o descendente.
    # filterset_class: indica que campos pueden ser usados en la URL como filtros.
    filter_backends = [DjangoFilterBackend]
    filterset_class = VTAnimalesFilter
    # Se van a filtrar los datos de VTAnimales por:
    # El tipo (tratamiento y vacuna), ruta (Intravenosa, Intramamaria, Intramuscular, Intravaginal, Oral,
    # nasal y subcutánea), id del animal, dosis suministrada, responsable, fecha_inicio y fecha_finalizacion.

    # Se pueden ordenar los campos indicados en la URL.
    # Ascendente: vtanimales/?ordering= ... (No se le indica nada)
    # Descentente: vtanimales/?ordering= - ... (Se le indica un símbolo "-")
    ordering_fields = ['responsable', 'id_vaca','id_toro', 'fecha_inseminacion', 'hora_inseminacion']
    ordering = ['fecha_inseminacion'] # Ordenación por defecto.


    # get_object: obtiene la instancia del modelo en la base de datos y lanza excepción si no lo encuentra.
    def get_object(self):
        try:
            return super().get_object()
        # Si se accede a un tratamientoo que no existe.
        except Http404:
            pk = self.kwargs.get("pk")   # Se obtiene el identificador de la URL
            raise NotFound({"ERROR": f"El tratamiento/la vacuna suministrada {pk} no se ha encontrado. "
                                     f"Comprueba el identificador introducido."})

    # Eliminar usando el botón "ELIMINAR".
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        codigo = instance.codigo
        tipo = instance.tipo.lower()  # lo pasamos a minúsculas para construir el mensaje
        try:
            self.perform_destroy(instance)
            return Response(
                {"mensaje": f"{'El' if tipo == 'tratamiento' else 'La'} "
                            f"{tipo} suministrad{'o' if tipo == 'tratamiento' else 'a'} "
                            f"{codigo} ha sido eliminad{'o' if tipo == 'tratamiento' else 'a'} "
                            f"correctamente."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"ERROR": f"No se pudo eliminar el suministro {codigo}.", "MOTIVO DEL ERROR": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

# --------------------------------------------------------------------------------------------------------------
#                                       Vista de LISTAINSEMINACIONES (Inventario de inseminaciones)
# --------------------------------------------------------------------------------------------------------------

class ListaInseminacionesViewSet(viewsets.ModelViewSet):
    # Se usan los permisos del modelo.
    # Django se encarga de asignar el permiso según la petición que se realice.
    permission_classes = [PermisosPorModelo]
    queryset = ListaInseminaciones.objects.all()
    serializer_class = ListaInseminacionesSerializer

    # Para realizar filtrado de los datos mediante la URL
    # filter_backends y filterset_class son clases predefinidas (NO CAMBIAR EL NOMBRE) de Django REST.
    # filter_backend: indica que clase se encarga de aplicar los filtros y activa el filtrado.
    # filterset_class: indica que campos pueden ser usados en la URL como filtros.
    filter_backends = [DjangoFilterBackend]
    filterset_class = ListaInseminacionesFilter
    # Se van a filtrar los datos de ListaInseminaciones por:
    # La razón (Celo o Programada), id_vaca, id_toro, es_sexado, responsable, fecha_inseminacion y hora_inseminacion.

    # get_object: obtiene la instancia del modelo en la base de datos y lanza excepción si no lo encuentra.
    def get_object(self):
        try:
            return super().get_object()
        # Si se accede a un tratamientoo que no existe.
        except Http404:
            pk = self.kwargs.get("pk")  # Se obtiene el identificador de la URL
            raise NotFound({"ERROR": f"La Inseminación {pk} no se ha encontrado. "
                                     f"Comprueba el identificador introducido."})

    # Eliminar usando el botón "ELIMINAR".
    def destroy(self, request, *args, **kwargs):
            instance = self.get_object()
            codigo = instance.codigo
            try:
                self.perform_destroy(instance)
                return Response(
                    {"mensaje":f"La inseminación {codigo} ha sido eliminada correctamente."},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"ERROR": f"No se pudo eliminar la inseminación {codigo}.", "MOTIVO DEL ERROR": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )


# --------------------------------------------------------------------------------------------------------------
#                                       Vista de SIMULACIONCRIA (Simulación de la cría)
# --------------------------------------------------------------------------------------------------------------

class SimulacionCriaView(APIView):
    # Solamente se indica que el usuario debe estar autenticado para poder realizar la simulación.
    permission_classes = [IsAuthenticated]
    def post(self, request):
        vacas = request.data.get("codigo_vacas")
        toro = request.data.get("codigo_toro")
        atributo = request.data.get("atributo_prioridad")

        if not vacas or not toro or not atributo:
            return Response({"simulacion_cria": "Faltan datos obligatorios."},
                            status=status.HTTP_400_BAD_REQUEST)

        resultado = simular_cria_optima(vacas, toro, atributo)
        if not resultado:
            return Response({"simulacion_cria": "No se pudo calcular la cría óptima."},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({"cria_mas_optima":resultado})

class ReentrenarCriaView(APIView):
    # Solo pueden acceder administradores.
    permission_classes = [EsAdministrador]

    def post(self, request):
        nueva_cria = request.data

        try:
            exito = agregar_y_reentrenar_cria(nueva_cria)
            if exito:
                return Response({"mensaje": "Cría añadida y modelo actualizado correctamente."})
            else:
                return Response({"error": "No se pudo actualizar el modelo."}, status=400)
        except Exception as e:
            return Response({
                "error": str(e),
                "traceback": traceback.format_exc()
            }, status=500)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer