# 🏋️ Sistema de Gestión para Gimnasio - GymPro

Sistema web profesional con arquitectura Frontend/Backend para la gestión integral de gimnasios.

## 📋 Características

### Backend (API REST)
- ✅ API RESTful con Flask
- ✅ Gestión de miembros y suscripciones
- ✅ Control de inventario
- ✅ Registro de entradas/salidas
- ✅ Persistencia de datos en JSON
- ✅ Estadísticas en tiempo real

### Frontend (Web Visual)
- ✅ Interfaz moderna y responsiva
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión visual de miembros
- ✅ Control de inventario con alertas de stock
- ✅ Sistema de acceso con validación de suscripciones
- ✅ Notificaciones y modales interactivos

## 🗂️ Estructura del Proyecto

```
GestionDeProyectos/
│
├── backend/                    # Backend (API)
│   ├── __init__.py
│   ├── app.py                 # Aplicación Flask
│   ├── models.py              # Modelos de datos
│   ├── database.py            # Gestión de base de datos
│   └── routes.py              # Rutas de la API
│
├── frontend/                   # Frontend (Interfaz Web)
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css     # Estilos CSS
│   │   └── js/
│   │       └── app.js         # JavaScript de la aplicación
│   └── templates/
│       └── index.html         # Página principal
│
├── data/                       # Datos persistentes
│   └── gimnasio_datos.json
│
├── run.py                      # Archivo principal de ejecución
├── requirements.txt            # Dependencias Python
└── README.md
```

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2. Ejecutar la aplicación

```bash
python run.py
```

### 3. Acceder a la aplicación

Abre tu navegador en: **http://localhost:5000**

## 🎯 Uso de la Aplicación

### Dashboard
- Visualiza estadísticas en tiempo real
- Total de miembros y miembros activos
- Entradas del día y personas en el gimnasio
- Últimos accesos registrados

### Gestión de Miembros
1. Click en "Nuevo Miembro" para agregar miembros
2. Ingresa datos: nombre, apellido, teléfono, email
3. Asigna suscripciones con el botón "Suscripción"
4. 4 tipos disponibles: Mensual, Trimestral, Semestral, Anual

### Gestión de Inventario
1. Click en "Nuevo Producto" para agregar productos
2. Gestiona stock con el botón "Stock"
3. Alertas de stock bajo (rojo < 10, amarillo < 20)

### Control de Acceso

**Terminal de Acceso** (http://localhost:5000/terminal):
- Interfaz simplificada para usuarios
- Ingreso por número de teléfono (simula huella dactilar)
- Registro rápido de entradas y salidas
- Visualización inmediata de estado de suscripción
- Auto-retorno a pantalla de inicio

**Panel de Administración**:
1. **Registrar Entrada/Salida**: Ingresa ID o teléfono del miembro
   - El sistema valida que la suscripción esté activa
   - Muestra días restantes de suscripción
2. Visualiza el historial completo de accesos
3. Estadísticas en tiempo real

## 📊 API Endpoints

### Miembros
- `GET /api/miembros` - Obtener todos los miembros
- `POST /api/miembros` - Agregar nuevo miembro
- `GET /api/miembros/<id>` - Obtener miembro específico
- `POST /api/miembros/<id>/suscripcion` - Asignar suscripción

### Inventario
- `GET /api/inventario` - Obtener todos los productos
- `POST /api/inventario` - Agregar nuevo producto
- `PUT /api/inventario/<id>/stock` - Modificar stock

### Acceso
- `POST /api/acceso/entrada` - Registrar entrada
- `POST /api/acceso/salida` - Registrar salida
- `GET /api/acceso/registros` - Obtener historial de accesos

### Estadísticas
- `GET /api/estadisticas/hoy` - Estadísticas del día

## 🎨 Características de la Interfaz

- **Diseño moderno** con gradientes y animaciones
- **Sidebar de navegación** intuitiva
- **Dashboard con tarjetas** de estadísticas
- **Tablas interactivas** con datos en tiempo real
- **Modales** para formularios
- **Notificaciones** visuales de acciones
- **Badges de estado** con códigos de color
- **Responsive design** para diferentes pantallas

## 🔐 Tipos de Suscripciones

| Tipo | Duración | Precio |
|------|----------|--------|
| Mensual | 30 días | $50.00 |
| Trimestral | 90 días | $135.00 |
| Semestral | 180 días | $250.00 |
| Anual | 365 días | $450.00 |

## 💾 Persistencia de Datos

- Los datos se guardan automáticamente en `data/gimnasio_datos.json`
- Carga automática al iniciar la aplicación
- Incluye: miembros, inventario y registros de acceso

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask** - Framework web
- **Python 3.x** - Lenguaje de programación
- **JSON** - Almacenamiento de datos

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y animaciones
- **JavaScript (Vanilla)** - Interactividad
- **Font Awesome** - Iconos

## 🎯 Características Destacadas

✅ Arquitectura profesional Frontend/Backend separada  
✅ API REST completa y documentada  
✅ Interfaz visual moderna y responsiva  
✅ Validación de suscripciones en tiempo real  
✅ Sistema de notificaciones visuales  
✅ Dashboard con estadísticas actualizadas  
✅ Gestión completa de inventario con alertas  
✅ Control de acceso con historial detallado  
✅ Código organizado y bien estructurado  
✅ Fácil de extender y mantener  

## 📝 Notas de Desarrollo

- **Separación de responsabilidades**: Backend maneja la lógica de negocio, Frontend la presentación
- **API RESTful**: Permite futuras integraciones con apps móviles
- **Modular**: Fácil agregar nuevas funcionalidades
- **Escalable**: Preparado para migrar a base de datos SQL si es necesario

---

**Desarrollado con 💪 para la gestión profesional de gimnasios**
