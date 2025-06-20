
# --------------------------------- simulacionCria.py: ---------------------------------
# Funcionalidad: permite realizar la simulación y el reentrenamiento del modelo
# --------------------------------------------------------------------------------------
# Bibliotecas que se utilizan.
import numpy as np # Biblioteca Numpy.
import pandas as pd # Biblioteca Pandas.
from sklearn.linear_model import LinearRegression # Modelo de Regresión Lineal.
import os # Construye automáticamente la ruta del archivo CSV.
from django.conf import settings

def simular_cria_optima(id_vacas, id_toro, atributo_prioridad):

    # Se carga el conjunto de datos almacenado en el archivo .csv (localizado en la misma carpeta).
    ruta_csv = os.path.join(settings.BASE_DIR, 'backend_django', 'ganaderiaBovina', 'cria_ganado_dataset_05_03_25.csv')
    print(" Ruta final del CSV:", ruta_csv)
    crias_df = pd.read_csv(ruta_csv, delimiter=";")

    # A partir de aquí, se va a realizar el entrenamiento del modelo.
    # Se definen las variables de entrada (input: X) y salida (output: Y)
    x = crias_df[['cs_vaca', 'pl_vaca', 'pa_vaca', 'u_vaca', 'g_vaca', 'pr_vaca',
                  'cs_toro', 'pl_toro', 'pa_toro', 'u_toro', 'g_toro', 'pr_toro']]
    y = crias_df[['celulas_somaticas', 'produccion_leche', 'calidad_patas', 'calidad_ubres', 'grasa', 'proteinas']]

    # Se selecciona el modelo de aprendizaje: Regresión Lineal.
    modelo = LinearRegression()
    # Se entrena el modelo de aprendizaje.
    modelo.fit(x, y)

    # Preparar vacas y toro seleccionados
    vacas_df = crias_df[crias_df['id_vaca'].isin(id_vacas)]
    toro_df = crias_df[crias_df['id_toro'] == id_toro]

    # Lista para almacenar el resultado final: vaca, toro, cría más óptima y atributo.
    resultados = []

    # Se predicen las características de la cría para "x" (_) vacas seleccionadas y un toro indicado.
    for _, vaca in vacas_df.iterrows():
        if toro_df.empty:
            continue

        # Se selecciona el toro indicado.
        toro = toro_df.iloc[0]

        # Columnas usadas para el DataFrame
        columnas = ['cs_vaca', 'pl_vaca', 'pa_vaca', 'u_vaca', 'g_vaca', 'pr_vaca',
                    'cs_toro', 'pl_toro', 'pa_toro', 'u_toro', 'g_toro', 'pr_toro']

        # Se crean las entradas para la predicción (características de la vaca y el toro)
        x_input = pd.DataFrame([[
            vaca['cs_vaca'], vaca['pl_vaca'], vaca['pa_vaca'], vaca['u_vaca'], vaca['g_vaca'], vaca['pr_vaca'],
            toro['cs_toro'], toro['pl_toro'], toro['pa_toro'], toro['u_toro'], toro['g_toro'], toro['pr_toro']
        ]], columns=columnas)

        # Se predicen las características de la cría
        pred = modelo.predict(x_input)[0]

        # Se realiza el ajuste de las predicciones (dependiendo el atributo que se desea predecir)
        atributos_cria_futura = {
            'celulas_somaticas': np.clip(pred[0], 50000, 2000000),
            'produccion_leche': np.clip(pred[1], 0, 200000),
            'calidad_patas': np.clip(pred[2], 1, 9),
            'calidad_ubres': np.clip(pred[3], 1, 9),
            'grasa': np.clip(pred[4], 2.5, 6),
            'proteinas': np.clip(pred[5], 2.8, 4),
        }

        # Se almacena el resultado: la combinación de vaca, toro y el índice combinado
        resultados.append({
            'id_vaca': vaca['id_vaca'],
            'id_toro': toro['id_toro'],
            'atributos': atributos_cria_futura,
            'valor_prioridad': atributos_cria_futura[atributo_prioridad]
        })

    # Se ordenan las crías por el valor más alto del atributo que se ha querido potenciar (de mayor a menor)
    resultados_ordenados = sorted(resultados, key=lambda r: r['valor_prioridad'], reverse=True)
    print(" ID vacas recibidas:", id_vacas)
    print(" ID toro recibido:", id_toro)
    print(" Vacas encontradas en el CSV:", crias_df[crias_df['id_vaca'].isin(id_vacas)].shape[0])
    print(" Toro encontrado en el CSV:", crias_df[crias_df['id_toro'] == id_toro].shape[0])

    # Se devuelve el resultado de la cría más óptima dado el atributo que se ha querido mejorar.
    return resultados_ordenados[0] if resultados_ordenados else None



def agregar_y_reentrenar_cria(nueva_cria):

    # nueva_cria: diccionario con los siguientes campos:
    # - id_vaca, id_toro, id_cria, celulas_somaticas, produccion_leche, calidad_patas, calidad_ubres, grasa, proteínas.
    # - cs_vaca, pl_vaca, pa_vaca, u_vaca, g_vaca, pr_vaca
    # - cs_toro, pl_toro, pa_toro, u_toro, g_toro, pr_toro

    ruta_csv = os.path.join(settings.BASE_DIR, 'backend_django', 'ganaderiaBovina', 'cria_ganado_dataset_05_03_25.csv')

    # Se carga el conjunto de datos actual.
    df = pd.read_csv(ruta_csv, delimiter=";")

    # Se convierte la nueva cría a un DataFrame de una fila.
    nueva_fila = pd.DataFrame([nueva_cria])

    # Se añade y se guarda esa fila al conjunto de datos.
    df = pd.concat([df, nueva_fila], ignore_index=True)
    df.to_csv(ruta_csv, sep=";", index=False)

    return True