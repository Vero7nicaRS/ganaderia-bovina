from django.db import models

# Create your models here.
# Modelos: Animales (Vacas y Terneros), Corrales, Inventario VT, VT en animales, Lista inseminaciones, Toros
# ---------------------------------------------------------------------------------------------------------------------------------

# Modelo Animales (Vacas y Terneros)
class Animal(models.Model):
    TIPOS_CHOICES = [
        ('Vaca', 'Vaca'),
        ('Ternero', 'Ternero'),
        ('Toro', 'Toro'),
    ]

    ESTADOS_CHOICES = [
        ('Vacía', 'Vacía'),
        ('Joven', 'Joven'),
        ('Gestante', 'Gestante'),
    ]

    # Código identificador como "V-1", "C-1", etc.
    codigo = models.CharField(max_length=10, unique=True)

    tipo = models.CharField(max_length=10, choices=TIPOS_CHOICES)
    estado = models.CharField(max_length=10, choices=ESTADOS_CHOICES)
    nombre = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()

    padre = models.ForeignKey('self', null=True, blank=True, related_name='hijos_padre', on_delete=models.SET_NULL)
    madre = models.ForeignKey('self', null=True, blank=True, related_name='hijos_madre', on_delete=models.SET_NULL)

    corral = models.ForeignKey(Corral, on_delete=models.CASCADE)

    celulas_somaticas = models.IntegerField(null=True, blank=True)
    calidad_patas = models.IntegerField(null=True, blank=True)
    calidad_ubres = models.IntegerField(null=True, blank=True)
    grasa = models.FloatField(null=True, blank=True)
    proteinas = models.FloatField(null=True, blank=True)


# Modelo Corrales
class Corral(models.Model):
    nombre = models.CharField(max_length=100)
    capacidad = models.IntegerField()

# Modelo Inventario VT


# Modelo VT en animales


# Modelo Lista Inseminaciones


# Modelo Toros


