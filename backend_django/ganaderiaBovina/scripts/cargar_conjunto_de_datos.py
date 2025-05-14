# cargar_conjunto_de_datos.py

import pandas as pd
import random
from datetime import date, timedelta
from ganaderiaBovina.models import Animal, Toro, Corral

def cargar_dataset():
    ruta = "backend_django/ganaderiaBovina/cria_ganado_dataset_05_03_25.csv"
    df = pd.read_csv(ruta, delimiter=";")

    # Se genera un corral para almacenar los datos.
    corral_principal, _ = Corral.objects.get_or_create(codigo="CORRAL-1", defaults={"nombre": "Corral principal"})

    toros_unicos = df["id_toro"].unique()
    vacas_unicas = df["id_vaca"].unique()

    # Se genera una fecha de nacimiento aleatoria (comprendida entre 2017 y 2025 [abril] para las vacas)
    def fecha_nacimiento_aleatoria():
        inicio = date(2017, 1, 1)
        fin = date(2025, 4, 30)
        dias = (fin - inicio).days
        return inicio + timedelta(days=random.randint(0, dias))

    # Para indicar cuantos animales se han añadido.
    num_toros = 0
    num_vacas = 0
    num_crias = 0
    # Se van agregando los toros.
    for codigo_toro in toros_unicos:
        if not Toro.objects.filter(codigo=codigo_toro).exists():
            Toro.objects.create(
                codigo=codigo_toro,
                nombre=f"Toro {codigo_toro}",
                estado="Vivo",
                cantidad_semen=random.randint(10, 50),
                celulas_somaticas=df[df["id_toro"] == codigo_toro]["cs_toro"].iloc[0],
                transmision_leche=df[df["id_toro"] == codigo_toro]["pl_toro"].iloc[0],
                calidad_patas=df[df["id_toro"] == codigo_toro]["pa_toro"].iloc[0],
                calidad_ubres=df[df["id_toro"] == codigo_toro]["u_toro"].iloc[0],
                grasa=df[df["id_toro"] == codigo_toro]["g_toro"].iloc[0],
                proteinas=df[df["id_toro"] == codigo_toro]["pr_toro"].iloc[0]
            )
            num_toros = num_toros + 1

    # Se van agregando las vacas.
    for codigo_vaca in vacas_unicas:
        if not Animal.objects.filter(codigo=codigo_vaca).exists():
            Animal.objects.create(
                codigo=codigo_vaca,
                tipo="Vaca",
                nombre=f"Vaca {codigo_vaca}",
                estado="Vacía",
                fecha_nacimiento=fecha_nacimiento_aleatoria(),
                corral=corral_principal,
                celulas_somaticas=df[df["id_vaca"] == codigo_vaca]["cs_vaca"].iloc[0],
                produccion_leche=df[df["id_vaca"] == codigo_vaca]["pl_vaca"].iloc[0],
                calidad_patas=df[df["id_vaca"] == codigo_vaca]["pa_vaca"].iloc[0],
                calidad_ubres=df[df["id_vaca"] == codigo_vaca]["u_vaca"].iloc[0],
                grasa=df[df["id_vaca"] == codigo_vaca]["g_vaca"].iloc[0],
                proteinas=df[df["id_vaca"] == codigo_vaca]["pr_vaca"].iloc[0]
            )
            num_vacas = num_vacas + 1

    # Se van agregando las crías (terneros) de las vacas y toros.
    for _, fila in df.iterrows():
        codigo_cria = fila["id_cria"]
        if not Animal.objects.filter(codigo=codigo_cria).exists():
            madre = Animal.objects.filter(codigo=fila["id_vaca"]).first()
            padre = Toro.objects.filter(codigo=fila["id_toro"]).first()
            if madre and padre:
                Animal.objects.create(
                    codigo=codigo_cria,
                    tipo="Ternero",
                    nombre=f"Ternero {codigo_cria}",
                    estado="Joven",
                    fecha_nacimiento=fecha_nacimiento_aleatoria(),
                    corral=corral_principal,
                    celulas_somaticas=fila["celulas_somaticas"],
                    produccion_leche=fila["produccion_leche"],
                    calidad_patas=fila["calidad_patas"],
                    calidad_ubres=fila["calidad_ubres"],
                    grasa=fila["grasa"],
                    proteinas=fila["proteinas"],
                    madre=madre,
                    padre=padre
                )
                num_crias = num_crias + 1

    print("Se ha realizado con éxito la carga de los datos. Se han añadido:")
    print(f"Toros: {num_toros}")
    print(f"Vacas: {num_vacas}")
    print(f"Crías: {num_crias}")