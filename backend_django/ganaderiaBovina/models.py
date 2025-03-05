from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

# Create your models here.
# Modelos: Animales (Vacas y Terneros), Corrales, Inventario VT, VT en animales, Lista inseminaciones, Toros
# ---------------------------------------------------------------------------------------------------------------------------------

# Modelo Corrales
class Corral(models.Model):

    # Se le indica el código (key) para los corrales ("CORRAL-x", siendo "x" un número).
    codigo = models.CharField(max_length=10, unique=True)

    nombre = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.codigo} {self.nombre}"

# Modelo Animales (Vacas y Terneros)
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
        ('Muerta', 'Muerta'),
        ('Vendida', 'Vendida')
    ]

    # Se le indica el código (key) para las vacas y terneros ("V-x", "C-x" siendo "x" un número).
    codigo = models.CharField(max_length=10, unique=True)

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

    corral = models.ForeignKey(Corral, on_delete=models.CASCADE, related_name='animales')

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
        validators=[MinValueValidator(1), MaxValueValidator(9)]
    )

    # Calidad ubres: (comprendido entre 1 y 9, con dos decimales)
    # Usamos Decimal porque estamos siendo muy específicos.
    calidad_ubres = models.DecimalField(
        max_digits=4, decimal_places= 2,
        validators=[MinValueValidator(1), MaxValueValidator(9)]
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
    fecha_eliminacion = models.DateTimeField(null=True, blank=True)  # Se añade fecha de eliminación si hay eliminación de "Vendida" o "Muerta"


    def __str__(self):
            return f"{self.codigo}"

# Modelo Inventario VT
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

    # Se le indica el código (key) para las vacas y terneros ("V-x", "C-x" siendo "x" un número).
    codigo = models.CharField(max_length=10, unique=True)

    tipo = models.CharField(max_length=15, choices=TIPOS_CHOICES, default='Vaca')
    nombre = models.CharField(max_length=100)

    # Unidades del tratamiento/vacuna (Rango comprendido entre 1 y 30)
    unidades = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(30)]
    )
    cantidad = models.CharField(max_length=15, choices=CANTIDAD_CHOICES, default='Vacía')


    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


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
    codigo = models.CharField(max_length=10, unique=True)

    # No se emplea "self" porque VTAnimales NO es una "Vaca" o "Ternero".
    id_animal = models.ForeignKey('Animal', on_delete=models.SET_NULL, null=True)

    tipo = models.CharField(max_length=15, choices=TIPOS_CHOICES, default='Tratamiento')
    #nombre y dosis

    ruta = models.CharField(max_length=15, choices=RUTA_CHOICES, default='Intravenosa')
    fecha_inicio = models.DateField()
    fecha_finalizacion = models.DateField()

    responsable = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.codigo} - {self.tipo}"


# Modelo Lista Inseminaciones
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
    codigo = models.CharField(max_length=10, unique=True)

    tipo = models.CharField(max_length=15, choices=TIPOS_CHOICES, default='Inseminacion')

    #Los reproductores se quedarán a "NULL" si es "Error".
    # En caso de que sea "Vendida" o "Muerta", se mantienen los identificadores de los reproductores.
    # No se emplea "self" porque ListaInseminaciones NO es un "Toro" o una "Vaca".
    id_vaca = models.ForeignKey('Vaca', on_delete=models.SET_NULL, null=True)
    id_toro = models.ForeignKey('Toro', on_delete=models.SET_NULL, null=True)

    razon = models.CharField(max_length=15, choices=RAZON_CHOICES, default='Celo')
    fecha_inseminacion = models.DateField()
    hora_inseminacion = models.TimeField()

    # El tipo de semen: se indica si es Sexado o No sexado (boolean)
    es_sexado = models.BooleanField()
    responsable = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.codigo} - {self.tipo}"


# Modelo Toro
class Toro(models.Model):
    # LISTA = [ (Se guarda en al BD, Se muestra en la INTERFAZ) ]
    ESTADOS_CHOICES = [
        ('Vivo', 'Vivo'),
        ('Muerte', 'Muerte'),
        ('Otros', 'Otros')
    ]

    # Se le indica el código (key) para los toros ("T-x", siendo "x" un número).
    codigo = models.CharField(max_length=10, unique=True)

    nombre = models.CharField(max_length=100)

    estado = models.CharField(max_length=15, choices=ESTADOS_CHOICES, default='Vivo')

    # Cantidad de semen
    cantidad_semen = models.IntegerField()

    # Transmisión de producción de leche: (Media 30 y desviación 20. Tiene 2 decimales.)
    transmision_leche = models.DecimalField(
        max_digits=4, decimal_places= 2
    )

    # Transmisión de células somáticas: (Media 0.5 y desviación 1.5. Tiene 2 decimales.)
    celulas_somaticas = models.DecimalField(
        max_digits=4, decimal_places= 2
    )

    # Calidad ubres: (comprendido entre 1 y 9, con dos decimales)
    # Usamos Decimal porque estamos siendo muy específicos.
    calidad_patas = models.DecimalField(
        max_digits=4, decimal_places= 2,
        validators=[MinValueValidator(1), MaxValueValidator(9)]
    )

    # Calidad ubres: (comprendido entre 1 y 9, con dos decimales)
    # Usamos Decimal porque estamos siendo muy específicos.
    calidad_ubres = models.DecimalField(
        max_digits=4, decimal_places= 2,
        validators=[MinValueValidator(1), MaxValueValidator(9)]
    )

    # Transmisión de grasa: (Porcentaje [%]. Media 0.16 y desviación 0.18)
    grasa = models.FloatField()

    # Transmisión de proteinas: (Porcentaje [%]. Media 0.07 y desviación 0.14)
    proteinas = models.FloatField()

    comentario = models.TextField(null=True, blank=True)
    fecha_eliminacion = models.DateTimeField(null=True, blank=True)  # Se añade fecha de eliminación si hay eliminación de "Vendida" o "Muerta"


    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

