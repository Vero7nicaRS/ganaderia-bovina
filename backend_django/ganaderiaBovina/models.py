# --------------------------------- models.py: ---------------------------------
# Funcionalidad: se encarga de definir la estructura de los datos (convirtiendo la
# información en tablas de la base de datos). [ESQUELETO/ESTRUCTURA]
# ¿Qué código se escribe?
# - Se incluirán los atributos y relaciones (FK).
# - Reglas de validación: unique, null, validators...
# - Método save(): se ejecuta antes de guardar esa fila en la base de datos. Se emplea para:
# - Modificación de los datos antes de guardarlos.
# - Validación de los datos.
# - Generar datos de manera automática (ej: códigos/identificadores)
# - ___str___: lo que se ve cuando se imprime el objeto.
# -----------------------------------------------------------------------------------

import re

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.db import models
from django.db.models import PROTECT
from decimal import Decimal
# Create your models here.
# Modelos: Animales (Vacas y Terneros), Corrales, Inventario VT, VT en animales, Lista inseminaciones, Toros
# ---------------------------------------------------------------------------------------------------------------------------------


def generar_codigo_animal(tipo):
    prefijo = 'V' if tipo == 'Vaca' else 'C'
    codigos = Animal.objects.filter(codigo__startswith=f"{prefijo}-").values_list('codigo', flat=True)

    max_num = 0
    for cod in codigos:
        try:
            num = int(cod.split('-')[1])
            if num > max_num:
                max_num = num
        except (IndexError, ValueError):
            continue

    siguiente = max_num + 1
    return f"{prefijo}-{siguiente}"

def generar_codigo_toro():
    prefijo = 'T'
    codigos = Toro.objects.filter(codigo__startswith=f"{prefijo}-").values_list('codigo', flat=True)

    max_num = 0
    for cod in codigos:
        try:
            num = int(cod.split('-')[1])
            if num > max_num:
                max_num = num
        except (IndexError, ValueError):
            continue

    siguiente = max_num + 1
    return f"{prefijo}-{siguiente}"


def generar_codigo_inseminaciones():
    prefijo = 'I'
    codigos = ListaInseminaciones.objects.filter(codigo__startswith=f"{prefijo}-").values_list('codigo', flat=True)

    max_num = 0
    for cod in codigos:
        try:
            num = int(cod.split('-')[1])
            if num > max_num:
                max_num = num
        except (IndexError, ValueError):
            continue

    siguiente = max_num + 1
    return f"{prefijo}-{siguiente}"


def generar_codigo_inventariovt():
    prefijo = 'VT'
    codigos = InventarioVT.objects.filter(codigo__startswith=f"{prefijo}-").values_list('codigo', flat=True)
    max_num = 0
    for cod in codigos:
        try:
            num = int(cod.split('-')[1])
            if num > max_num:
                max_num = num
        except (IndexError, ValueError):
            continue

    siguiente = max_num + 1
    return f"{prefijo}-{siguiente}"

def generar_codigo_corral():
    prefijo = 'CORRAL'
    codigos = Corral.objects.filter(codigo__startswith=f"{prefijo}-").values_list('codigo', flat=True)
    max_num = 0
    for cod in codigos:
        try:
            num = int(cod.split('-')[1])
            if num > max_num:
                max_num = num
        except (IndexError, ValueError):
            continue

    siguiente = max_num + 1
    return f"{prefijo}-{siguiente}"


def generar_codigo_vtanimales():
    prefijo = 'VTA'
    codigos = VTAnimales.objects.filter(codigo__startswith=f"{prefijo}-").values_list('codigo', flat=True)

    max_num = 0
    for cod in codigos:
        try:
            num = int(cod.split('-')[1])
            if num > max_num:
                max_num = num
        except (IndexError, ValueError):
            continue

    siguiente = max_num + 1
    return f"{prefijo}-{siguiente}"

# --------------------------------------------------------------------------------------------------------------
#                                       Modelo de CORRAL
# --------------------------------------------------------------------------------------------------------------

class Corral(models.Model):

    # Se le indica el código (key) para los corrales ("CORRAL-x", siendo "x" un número).
    codigo = models.CharField(max_length=10, unique=True, blank=True, null=True)

    # El nombre del corral debe ser único, ya que no puede haber dos corrales con el mismo nombre.
    nombre = models.CharField(max_length=100, unique=True)
    # --- OBSERVACIONES ---
    # No hace falta guardar el campo: número de animales porque es un dato calculable mediante
    # la relación Animal y Corral. Usando: corral.animales.count()

    # No hace falta guardar el campo: animales del corral porque ya hay una relación entre
    # Animal y Corral.
    # En Animal está: corral = models.ForeignKey(Corral, on_delete=models.PROTECT, related_name='animales', null=True, blank=True)
    # Esto es debido a "related_name = 'animales", ya que desde cualquier objeto Corral se puede
    # obtener los animales que tiene. Usando: corral.animales.all()

    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = generar_codigo_corral()
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.codigo} {self.nombre}"

# --------------------------------------------------------------------------------------------------------------
#                                       Modelo de ANIMAL
# --------------------------------------------------------------------------------------------------------------

class Animal(models.Model):
    # LISTA = [ (Se guarda en al BD, Se muestra en la INTERFAZ) ]
    TIPOS_CHOICES = [
        ('Vaca', 'Vaca'),
        ('Ternero', 'Ternero')
    ]

    ESTADOS_CHOICES = [
        ('Vacía', 'Vacía'),
        ('Inseminada', 'Inseminada'),
        ('Preñada', 'Preñada'),
        ('No inseminar', 'No inseminar'),
        ('Joven', 'Joven'),
        ('Muerte', 'Muerte'),
        ('Vendida', 'Vendida')
    ]

    # Se le indica el código (key) para las vacas y terneros ("V-x", "C-x" siendo "x" un número).
    # codigo = models.CharField(max_length=10, unique=True)
    codigo = models.CharField(
        max_length=10,
        unique=True,
        blank=True,
        null=True  # Permite dejarlo vacío para que se genere automáticamente
    )
    tipo = models.CharField(max_length=15, choices=TIPOS_CHOICES, default='Vaca')
    estado = models.CharField(max_length=15, choices=ESTADOS_CHOICES, default='Vacía')
    nombre = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()

    #Los reproductores se quedarán a "NULL" si es "Error".
    # En caso de que sea "Vendida" o "Muerta", se mantienen los identificadores de los reproductores.
    # Observaciones:
    # - "Self" se referencia así mismo (FK), ya que "Animal" es una "Vaca" o "Ternero".
    # - 'Toro' se referencia a la FK del modelo "Toro" ya que este contiene un "Toro".
    # - related_name = es para acceder a los hijos de los reproductores.
    padre = models.ForeignKey('Toro', null=True, blank=True, related_name='hijos_padre', on_delete=models.SET_NULL)
    madre = models.ForeignKey('self', null=True, blank=True, related_name='hijos_madre', on_delete=models.SET_NULL)

    # Cada animal está vinculado a un corral.
    # Por tanto, desde un objeto Corral se pueden acceder a los animales que tiene.
    # El corral no puede ser eliminado hasta que no haya ningún animal en el corral (PROTECT).
    corral = models.ForeignKey(Corral, on_delete=models.PROTECT, related_name='animales', null=True, blank=True)

    # Células somáticas: (min. 50.000 - max. 2.000.000, sin decimales)
    celulas_somaticas = models.IntegerField(
        validators=[MinValueValidator(50000),MaxValueValidator(2000000)]
    )

    # Producción de leche: (min. 0)
    produccion_leche = models.FloatField(validators=[MinValueValidator(0)])

    # Calidad ubres: (comprendido entre 1 y 9, con dos decimales)
    # Usamos Decimal porque estamos siendo muy específicos.
    calidad_patas = models.DecimalField(
        max_digits=4, decimal_places= 2,
        validators=[MinValueValidator(Decimal('1')), MaxValueValidator(Decimal('9'))]
    )

    # Calidad ubres: (comprendido entre 1 y 9, con dos decimales)
    # Usamos Decimal porque estamos siendo muy específicos.
    calidad_ubres = models.DecimalField(
        max_digits=4, decimal_places= 2,
        validators=[MinValueValidator(Decimal('1')), MaxValueValidator(Decimal('9'))]
    )


    # Grasa: (Porcentaje [%] comprendido entre 2.5 y 6)
    grasa = models.FloatField(
        validators=[MinValueValidator(2.5), MaxValueValidator(6)]
    )

    # Proteinas: (Porcentaje [%] comprendido entre 2.8 y 4)
    proteinas = models.FloatField(
        validators=[MinValueValidator(2.8), MaxValueValidator(4)]
    )

    comentario = models.TextField(null=True, blank=True)
    fecha_eliminacion = models.DateField(null=True, blank=True)  # Se añade fecha de eliminación si hay eliminación de "Vendida" o "Muerta"
    comentario = models.TextField(blank=True, null=True) # Se añade comentario si hay eliminación de "Vendida" o "Muerta"

    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = generar_codigo_animal(self.tipo)
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.codigo}"

# --------------------------------------------------------------------------------------------------------------
#                                       Modelo de INVENTARIOVT (Vacunas y tratamientos del inventario)
# --------------------------------------------------------------------------------------------------------------

class InventarioVT(models.Model):
    # LISTA = [ (Se guarda en al BD, Se muestra en la INTERFAZ) ]
    TIPOS_CHOICES = [
        ('Tratamiento', 'Tratamiento'),
        ('Vacuna', 'Vacuna')
    ]

    CANTIDAD_CHOICES = [
        ('Sobre', 'Sobre'),
        ('Botella', 'Botella')
    ]

    ESTADO_CHOICES = [
        ('Activa', 'Activa'),
        ('Inactiva', 'Inactiva')
    ]

    # Se le indica el código (key) para las vacunas y tratamientos del inventario ("VT-x").
    codigo = models.CharField(max_length=10, unique=True, blank=True, null=True)

    tipo = models.CharField(max_length=15, choices=TIPOS_CHOICES, default='Tratamiento')
    # El nombre de la vacuna/tratamiento debe ser único, ya que no puede haber dos vacunas y/o tratamientos
    # con el mismo nombre.
    nombre = models.CharField(max_length=100, unique=True)

    # Unidades del tratamiento/vacuna (Rango comprendido entre 0 y 30)
    unidades = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(30)]
    )
    cantidad = models.CharField(max_length=15, choices=CANTIDAD_CHOICES, default='Sobre')

    # Creamos un atributo "estado" que indica si la vacuna/tratamiento está activo o inactivo.
    #  - Si es activo, significa que esta siendo usado o se seguirá usando.
    #  - Si es inactivo, significa que se ha eliminado esa vacuna/tratamiento y por tanto, no se seguirá usando.
    # PERO se guardará en el sistema para tenerlo como historial (al igual que las vacas/terneros y toros)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='Activa')
    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = generar_codigo_inventariovt()

        if not self.estado:
            self.estado = "Activa"
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

# --------------------------------------------------------------------------------------------------------------
#                                       Serializer de VTANIMALES (Vacunas y tratamientos suministrados a los animales)
# --------------------------------------------------------------------------------------------------------------

# Modelo VT en animales
class VTAnimales(models.Model):
    # LISTA = [ (Se guarda en al BD, Se muestra en la INTERFAZ) ]
    TIPOS_CHOICES = [
        ('Tratamiento', 'Tratamiento'),
        ('Vacuna', 'Vacuna')
    ]

    RUTA_CHOICES = [
        ('Intravenosa', 'Intravenosa'),
        ('Intramamaria', 'Intramamaria'),
        ('Intramuscular', 'Intramuscular'),
        ('Intravaginal', 'Intravaginal'),
        ('Oral', 'Oral'),
        ('Nasal', 'Nasal'),
        ('Subcutánea', 'Subcutánea'),
    ]
    # Se le indica el código (key) para las vacas y terneros ("V-x", "C-x" siendo "x" un número).
    codigo = models.CharField(max_length=10, unique=True, blank=True, null=True)

    # No se emplea "self" porque VTAnimales NO es una "Vaca" o "Ternero".
    id_animal = models.ForeignKey('Animal', on_delete=models.SET_NULL, null=True)

    tipo = models.CharField(max_length=15, choices=TIPOS_CHOICES, default='Tratamiento')

    #nombre
    # nombre_vt = models.CharField(max_length=100, null= True, blank=True)

    ruta = models.CharField(max_length=15, choices=RUTA_CHOICES, default='Intravenosa')
    fecha_inicio = models.DateField()
    fecha_finalizacion = models.DateField()
    responsable = models.CharField(max_length=100)

    # Relación de VTAnimales con InventarioVT (inventario de vacunas y tratamientos)
    # Cada elemento de VTAnimales se encuentra vinculado a un elemento de InventarioVT
    # Ya que hay una relación entre el tipo (Tratamiento/Vacuna), nombre (del Tratamiento/Vacuna)
    inventario_vt = models.ForeignKey(InventarioVT, null=True, blank=True, on_delete=models.PROTECT)


    # Dosis indica lo que se le va a suministrar al animal
    # dosis = models.IntegerField()

    # "Save" me permite personalizar la lógica antes de que se almacene la información en la base de datos.
    # *args y **kwargs permite que se envien cualquier tipo de parámetros y palabras.

    # 1º Seleccionamos tipo
    # 2º Seleccionamos nombre (que son todas las vacunas/tratamientos disponibles para ese tipo)
    # 3º Se muestra las dosis (número de unidades que hay disponibles en el inventario de ese tratamiento/vacuna)
    def save(self, *args, **kwargs):

        # Se comprueba que hay un InventarioVT asociado.
        #if self.inventario_vt is not None:
            # Se realizan las asociaciones de tipo y nombre.
            # Se indica el nombre de esa vacuna/tratamiento seleccionado para guardarlo.

            # Se actualiza el número de unidades del inventario, restándole la dosis suministrada que siempre es 1.
        #    self.inventario_vt.unidades -= 1
        #    self.inventario_vt.save()

        if not self.codigo:
            self.codigo = generar_codigo_vtanimales()
        super().save(*args, **kwargs)

        # -------------------------------------------------------------------------------------------------------- MIRAR NOMBRE
    def __str__(self):
        nombre_inventario = self.inventario_vt.nombre if self.inventario_vt else 'Sin nombre'
        return f"{self.codigo} - {self.tipo} - {nombre_inventario}"

# --------------------------------------------------------------------------------------------------------------
#                                       Modelo de LISTAINSEMINACIONES (Inventario de inseminaciones)
# --------------------------------------------------------------------------------------------------------------

class ListaInseminaciones(models.Model):
    # LISTA = [ (Se guarda en al BD, Se muestra en la INTERFAZ) ]
    TIPOS_CHOICES = [
        ('Inseminacion', 'Inseminacion')
    ]

    RAZON_CHOICES = [
        ('Celo', 'Celo'),
        ('Programada', 'Programada')
    ]

    # Se le indica el código (key) para las vacas y terneros ("V-x", "C-x" siendo "x" un número).
    codigo = models.CharField(max_length=10, unique=True, blank=True, null=True)

    tipo = models.CharField(max_length=15, choices=TIPOS_CHOICES, default='Inseminacion')

    #Los reproductores se quedarán a "NULL" si es "Error".
    # En caso de que sea "Vendida" o "Muerta", se mantienen los identificadores de los reproductores.
    # No se emplea "self" porque ListaInseminaciones NO es un "Toro" o una "Vaca".
    id_vaca = models.ForeignKey('Animal', on_delete=models.SET_NULL, null=True)
    id_toro = models.ForeignKey('Toro', on_delete=models.SET_NULL, null=True)

    razon = models.CharField(max_length=15, choices=RAZON_CHOICES, default='Celo')
    fecha_inseminacion = models.DateField()
    hora_inseminacion = models.TimeField()

    # El tipo de semen: se indica si es Sexado o No sexado (boolean)
    es_sexado = models.BooleanField(default=True, null=False, blank=False)
    responsable = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = generar_codigo_inseminaciones()
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.codigo} - {self.tipo}"

# --------------------------------------------------------------------------------------------------------------
#                                       Modelo de TORO
# --------------------------------------------------------------------------------------------------------------

class Toro(models.Model):
    # LISTA = [ (Se guarda en al BD, Se muestra en la INTERFAZ) ]
    ESTADOS_CHOICES = [
        ('Vivo', 'Vivo'),
        ('Muerte', 'Muerte'),
        ('Otros', 'Otros')
    ]

    # Se le indica el código (key) para los toros ("T-x", siendo "x" un número).
    codigo = models.CharField(max_length=10, unique=True, blank=True, null=True)

    # El nombre del toro debe ser único, ya que no puede haber dos toros con el mismo nombre.
    nombre = models.CharField(max_length=100, unique=True)

    estado = models.CharField(max_length=15, choices=ESTADOS_CHOICES, default='Vivo')

    # Cantidad de semen: no tiene un valor negativo.
    cantidad_semen = models.IntegerField(
        validators=[MinValueValidator(0)]
    )

    # Transmisión de producción de leche: (Media 30 y desviación 20. Tiene 2 decimales.)
    transmision_leche = models.DecimalField(
        max_digits=4, decimal_places= 2,
        # validators=[MinValueValidator(Decimal('1')), MaxValueValidator(Decimal('9'))]
    )

    # Transmisión de células somáticas: (Media 0.5 y desviación 1.5. Tiene 2 decimales.)
    celulas_somaticas = models.DecimalField(
        max_digits=4, decimal_places= 2,
        # validators=[MinValueValidator(Decimal('1')), MaxValueValidator(Decimal('9'))]
    )

    # Calidad ubres: (comprendido entre 1 y 9, con dos decimales)
    # Usamos Decimal porque estamos siendo muy específicos.
    calidad_patas = models.DecimalField(
        max_digits=4, decimal_places= 2,
        validators=[MinValueValidator(Decimal('1')), MaxValueValidator(Decimal('9'))]
    )

    # Calidad ubres: (comprendido entre 1 y 9, con dos decimales)
    # Usamos Decimal porque estamos siendo muy específicos.
    calidad_ubres = models.DecimalField(
        max_digits=4, decimal_places= 2,
        validators=[MinValueValidator(Decimal('1')), MaxValueValidator(Decimal('9'))]
    )

    # Transmisión de grasa: (Porcentaje [%]. Media 0.16 y desviación 0.18)
    grasa = models.FloatField()

    # Transmisión de proteinas: (Porcentaje [%]. Media 0.07 y desviación 0.14)
    proteinas = models.FloatField()

    comentario = models.TextField(null=True, blank=True)

    # ---------------------  OBSERVACIÓN: ----------------------------------------------------------------------------
    # Para el TORO no se va a almacenar la fecha de eliminación, ya que los datos del toro solamente
    # se utilizan para realizar la simulación de las crías. Además, no se tiene ni la fecha de nacimiento del mismo.
    # Por otra parte, al ser una ganadería bovina solamente se va a encargar de los terneros y vacas, dado a que
    # no gestionan toros.

    # fecha_eliminacion = models.DateField(null=True, blank=True)   # Se añade fecha de eliminación si hay eliminación de "Vendida" o "Muerta"
    # ----------------------------------------------------------------------------------------------------------------
    def save(self, *args, **kwargs):
        if not self.codigo:
            self.codigo = generar_codigo_toro() # Para generar el código secuencial.
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"



