# Generated by Django 5.1.6 on 2025-03-30 12:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('ganaderiaBovina', '0005_alter_toro_fecha_eliminacion'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='vtanimales',
            name='nombre_vt',
        ),
    ]
