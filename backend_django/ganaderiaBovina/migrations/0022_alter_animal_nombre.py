# Generated by Django 5.1.6 on 2025-05-05 16:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ganaderiaBovina', '0021_alter_inventariovt_nombre'),
    ]

    operations = [
        migrations.AlterField(
            model_name='animal',
            name='nombre',
            field=models.CharField(max_length=100, unique='True'),
        ),
    ]
