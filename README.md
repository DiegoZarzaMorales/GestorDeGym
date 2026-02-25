# StronkSystem - Sistema de Gestión de Gimnasio

Sistema web para administración de gimnasio con arquitectura separada en backend (Flask API REST) y frontend (HTML, CSS, JavaScript).

## Descripción General

La aplicación cubre:

- Gestión de miembros con rol (por ejemplo: MIEMBRO, ENTRENADOR)
- Asignación y validación de suscripciones
- Control de inventario
- Registro de entradas y salidas
- Punto de venta (POS) con ventas y métricas
- Portal cliente con publicaciones y recomendaciones
- Persistencia local de datos en JSON

## Funcionalidades Implementadas

### Backend

- API REST con Flask y CORS
- Reglas de negocio para:
   - Acceso permitido con suscripción activa (excepto roles de entrenador)
   - Stock y validaciones de inventario
   - Procesamiento de ventas
   - Estadísticas diarias y estadísticas de ventas
- Persistencia automática en `data/gimnasio_datos.json`

### Frontend

- Panel administrativo principal (`/`)
- Terminal de acceso (`/terminal`)
- Terminal de ventas POS (`/ventas`)
- Portal cliente (`/cliente`)
- Interfaces responsivas con tablas, modales, badges y notificaciones

## Estructura del Proyecto

```text
GestionDeProyectos/
├── backend/
│   ├── __init__.py
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   └── routes.py
├── data/
│   └── gimnasio_datos.json
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   │   ├── styles.css
│   │   │   └── cliente.css
│   │   ├── js/
│   │   │   ├── app.js
│   │   │   └── cliente.js
│   │   └── img/
│   │       ├── backgrounds/
│   │       ├── posts/
│   │       └── stronksystem-gym-logo.svg
│   └── templates/
│       ├── index.html
│       ├── terminal.html
│       ├── terminal-ventas.html
│       └── cliente.html
├── .gitignore
├── requirements.txt
├── run.py
└── README.md
```

## Rutas Web

- `GET /` Panel administrativo
- `GET /terminal` Terminal de acceso
- `GET /ventas` Terminal de ventas
- `GET /cliente` Portal cliente

## API REST

### Miembros

- `GET /api/miembros`
- `GET /api/miembros/<id_miembro>`
- `GET /api/miembros/buscar/telefono/<telefono>`
- `POST /api/miembros`
- `POST /api/miembros/<id_miembro>/suscripcion`
- `GET /api/suscripciones/tipos`

### Inventario y Ventas

- `GET /api/inventario`
- `POST /api/inventario`
- `GET /api/inventario/buscar/codigo/<codigo_barras>`
- `PUT /api/inventario/<id_producto>/stock`
- `POST /api/ventas/procesar`
- `GET /api/ventas`
- `GET /api/estadisticas/ventas`

### Acceso y Estadísticas

- `POST /api/acceso/entrada`
- `POST /api/acceso/salida`
- `GET /api/acceso/registros`
- `GET /api/estadisticas/hoy`

## Modelo de Datos

Entidades principales:

- `Miembro`
   - Campos: id, nombre, apellido, telefono, email, rol, suscripcion, activo
- `Suscripcion`
   - Tipos: `MENSUAL`, `TRIMESTRAL`, `SEMESTRAL`, `ANUAL`
   - Incluye duración, precio, fecha de inicio/fin, estado activo y días restantes
- `ProductoInventario`
   - Incluye código de barras (autogenerable si no se envía)
- `RegistroAcceso`
   - Tipos: `ENTRADA` y `SALIDA`
- `Venta`
   - Incluye lista de productos vendidos, subtotales, total y fecha

## Instalación y Ejecución

### Requisitos

- Python 3.10 o superior recomendado
- `pip`

### 1) (Opcional) Crear entorno virtual

Windows (PowerShell):

```bash
py -m venv .venv
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2) Instalar dependencias

```bash
python -m pip install -r requirements.txt
```

### 3) Ejecutar el proyecto

```bash
python run.py
```

También puedes usar en Windows:

```bash
py run.py
```

### 4) Acceso

- Aplicación: `http://localhost:5000`

### Configuración opcional de arranque

Puedes cambiar host, puerto y modo debug con variables de entorno:

- `HOST` (por defecto: `0.0.0.0`)
- `PORT` (por defecto: `5000`)
- `DEBUG` (por defecto: `true`)

Ejemplo en PowerShell:

```bash
$env:HOST="127.0.0.1"
$env:PORT="8000"
$env:DEBUG="false"
py run.py
```

## Dependencias

Archivo `requirements.txt`:

- `Flask==3.0.0`
- `Flask-CORS==4.0.0`
- `Werkzeug==3.0.1`

## Persistencia

Los datos se guardan en `data/gimnasio_datos.json` con esta estructura base:

- `miembros`
- `inventario`
- `ventas`
- `registros_acceso`

La carga y guardado es automática mediante `backend/database.py`.

## Notas Técnicas

- La lógica del negocio está en `backend/database.py`.
- Las entidades y serialización están en `backend/models.py`.
- Los endpoints están en `backend/routes.py`.
- La configuración de Flask y rutas de plantillas está en `backend/app.py`.

## Estado Actual

- Proyecto limpio de código legado no usado.
- Backend y documentación alineados con la estructura real.
- Checklist de mantenimiento completado y validado sin errores.
