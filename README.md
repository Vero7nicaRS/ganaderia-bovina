BACKEND_DJANGO:
Es la parte backend del TFG y tiene como funcionalidad gestionar
la información de la granja bovina: animales, toros, inseminaciones,
tratamientos...

ESTRUCTURACIÓN DEL PROYECTO:
PROYECTO_TFG_FRONTEND/
├── ganaderia-bovina/          # Frontend (React)
└── backend_django/            # Backend (Django)
├── manage.py
├── settings.py
├── requirements.txt
├── ganaderiaBovina/     # Aplicación principal
└── venv/               # Entorno virtual (no se sube al repositorio)

INSTALACIÓN:
1. Clonar el repositorio y acceder al backend:
cd backend_django.
2. Creación y activación el entorno virtual:
Si se usa Windows:
python -m venv venv
venv\Scripts\activate
Si se usa Linux/MacOs:
   python3 -m venv venv
   source venv/bin/activate
3. Instalación de las dependencias:
    pip install -r requirements.txt
4. Configuración de la base de datos PostgreSQL:
Crear una base de datos "bd_ganaderia_bovina" y comprobar que el archivo
"settings.py" tenga la configuración adecuada:
    DATABASES = {
        'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'bd_ganaderia_bovina',
        'USER': 'postgres',
        'PASSWORD': 'posTPS',
        'HOST': 'localhost',
        'PORT': '5432',
        }
    }
5. Creación y ejecución de las migraciones:
    Windows:
       run.bat makemigrations
       run.bat migrate 
    Linux/MacOs:
      ./run.sh makemigrations
      ./run.sh migrate

6. Iniciar el servidor de desarrollo:
    Windows:
       run.bat runserver
    Linux/MacOs:
       ./run.sh runserver


SCRIPTS DE EJECUCIÓN:
- Windows: Fichero run.bat
  @echo off
  set PYTHONPATH=.
  python backend_django/manage.py %*
- Linux/MacOs: Fichero run.sh (hay que darle permiso: chmod +x run.sh)
  #!/bin/bash
  export PYTHONPATH=.
  python3 backend_django/manage.py "$@"

ENDPOINTS DISPONIBLES:
Una vez el servidor esté operativo, se puede acceder a:

- http://localhost:8000/api/animales/

- http://localhost:8000/api/toros/

- http://localhost:8000/api/corrales/

- http://localhost:8000/api/inventariovt/

- http://localhost:8000/api/vtanimales/

- http://localhost:8000/api/listainseminaciones/


OBSERVACIONES:
- Entorno virtual (/venv) no hay que incluirlo en el repositorio.
