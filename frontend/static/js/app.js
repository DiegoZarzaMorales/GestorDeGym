// API Base URL
const API_URL = 'http://localhost:5000/api';

// Estado de la aplicación
let currentSection = 'dashboard';
let miembros = [];
let inventario = [];
let registros = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initModals();
    initForms();
    initRefresh();
    
    // Cargar datos iniciales
    cargarDashboard();
});

// ===== NAVEGACIÓN =====
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Actualizar navegación activa
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Cambiar sección
            const section = this.dataset.section;
            changeSection(section);
        });
    });
}

function changeSection(section) {
    currentSection = section;
    
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Mostrar sección seleccionada
    document.getElementById(section).classList.add('active');
    
    // Actualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'miembros': 'Gestión de Miembros',
        'inventario': 'Gestión de Inventario',
        'acceso': 'Control de Acceso'
    };
    document.getElementById('page-title').textContent = titles[section];
    
    // Cargar datos de la sección
    switch(section) {
        case 'dashboard':
            cargarDashboard();
            break;
        case 'miembros':
            cargarMiembros();
            break;
        case 'inventario':
            cargarInventario();
            break;
        case 'acceso':
            cargarAccesos();
            break;
    }
}

// ===== MODALES =====
function initModals() {
    // Cerrar modales con la X
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(this.dataset.modal);
        });
    });
    
    // Cerrar modales con botón cancelar
    document.querySelectorAll('[data-modal]').forEach(btn => {
        if (btn.classList.contains('btn-secondary')) {
            btn.addEventListener('click', function() {
                closeModal(this.dataset.modal);
            });
        }
    });
    
    // Cerrar modal al hacer click fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Abrir modales
    document.getElementById('btn-nuevo-miembro').addEventListener('click', () => openModal('modal-nuevo-miembro'));
    document.getElementById('btn-nuevo-producto').addEventListener('click', () => openModal('modal-nuevo-producto'));
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// ===== FORMULARIOS =====
function initForms() {
    // Form: Nuevo Miembro
    document.getElementById('form-nuevo-miembro').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(`${API_URL}/miembros`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Miembro agregado exitosamente', 'success');
                closeModal('modal-nuevo-miembro');
                this.reset();
                cargarMiembros();
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            showNotification('Error al agregar miembro', 'error');
        }
    });
    
    // Form: Asignar Suscripción
    document.getElementById('form-suscripcion').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const idMiembro = document.getElementById('suscripcion-miembro-id').value;
        const tipo = formData.get('tipo');
        
        try {
            const response = await fetch(`${API_URL}/miembros/${idMiembro}/suscripcion`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({tipo})
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Suscripción asignada exitosamente', 'success');
                closeModal('modal-suscripcion');
                cargarMiembros();
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            showNotification('Error al asignar suscripción', 'error');
        }
    });
    
    // Form: Nuevo Producto
    document.getElementById('form-nuevo-producto').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(`${API_URL}/inventario`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Producto agregado exitosamente', 'success');
                closeModal('modal-nuevo-producto');
                this.reset();
                cargarInventario();
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            showNotification('Error al agregar producto', 'error');
        }
    });
    
    // Form: Modificar Stock
    document.getElementById('form-stock').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const idProducto = document.getElementById('stock-producto-id').value;
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(`${API_URL}/inventario/${idProducto}/stock`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Stock modificado exitosamente', 'success');
                closeModal('modal-stock');
                this.reset();
                cargarInventario();
            } else {
                showNotification(result.error, 'error');
            }
        } catch (error) {
            showNotification('Error al modificar stock', 'error');
        }
    });
    
    // Botones de acceso
    document.getElementById('btn-registrar-entrada').addEventListener('click', registrarEntrada);
    document.getElementById('btn-registrar-salida').addEventListener('click', registrarSalida);
}

// ===== REFRESH =====
function initRefresh() {
    document.getElementById('refresh-btn').addEventListener('click', function() {
        switch(currentSection) {
            case 'dashboard':
                cargarDashboard();
                break;
            case 'miembros':
                cargarMiembros();
                break;
            case 'inventario':
                cargarInventario();
                break;
            case 'acceso':
                cargarAccesos();
                break;
        }
        showNotification('Datos actualizados', 'info');
    });
}

// ===== DASHBOARD =====
async function cargarDashboard() {
    try {
        const response = await fetch(`${API_URL}/estadisticas/hoy`);
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            document.getElementById('stat-total-miembros').textContent = stats.total_miembros;
            document.getElementById('stat-miembros-activos').textContent = stats.miembros_activos;
            document.getElementById('stat-ventas-hoy').textContent = stats.ventas_hoy;
            document.getElementById('stat-ganancias-hoy').textContent = `$${stats.ganancias_hoy.toFixed(2)}`;
        }
        
        // Cargar estadísticas de ventas
        const ventasResponse = await fetch(`${API_URL}/estadisticas/ventas?dias=30`);
        const ventasResult = await ventasResponse.json();
        
        if (ventasResult.success) {
            const stats = ventasResult.data;
            document.getElementById('total-ventas-mes').textContent = stats.total_ventas;
            document.getElementById('ganancias-mes').textContent = `$${stats.total_ganancias.toFixed(2)}`;
            document.getElementById('promedio-venta').textContent = `$${stats.promedio_por_venta.toFixed(2)}`;
            
            mostrarTopProductos(stats.top_productos);
        }
        
        // Cargar últimos accesos
        const registrosResponse = await fetch(`${API_URL}/acceso/registros?limite=10`);
        const registrosResult = await registrosResponse.json();
        
        if (registrosResult.success) {
            mostrarUltimosAccesos(registrosResult.data);
        }
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

function mostrarTopProductos(productos) {
    const container = document.getElementById('top-productos');
    
    if (productos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">No hay ventas registradas</p>';
        return;
    }
    
    container.innerHTML = productos.map((p, index) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: ${index % 2 === 0 ? '#f9fafb' : 'white'}; border-radius: 6px; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                    ${index + 1}
                </div>
                <div>
                    <div style="font-weight: 600; color: #1f2937;">${p.nombre}</div>
                    <div style="font-size: 0.85rem; color: #6b7280;">${p.cantidad} unidades vendidas</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: #10b981;">$${p.ingresos.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

function mostrarUltimosAccesos(registros) {
    const container = document.getElementById('ultimos-accesos');
    
    if (registros.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">No hay registros disponibles</p>';
        return;
    }
    
    container.innerHTML = registros.map(r => {
        const fecha = new Date(r.fecha_hora);
        const iconClass = r.tipo === 'ENTRADA' ? 'entrada' : 'salida';
        const icon = r.tipo === 'ENTRADA' ? 'fa-sign-in-alt' : 'fa-sign-out-alt';
        
        return `
            <div class="access-item">
                <div class="access-info">
                    <div class="access-icon ${iconClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="access-details">
                        <h4>${r.nombre_miembro || 'Desconocido'}</h4>
                        <p>${r.tipo}</p>
                    </div>
                </div>
                <div class="access-time">
                    ${fecha.toLocaleTimeString('es-ES')}
                </div>
            </div>
        `;
    }).join('');
}

// ===== MIEMBROS =====
async function cargarMiembros() {
    try {
        const response = await fetch(`${API_URL}/miembros`);
        const result = await response.json();
        
        if (result.success) {
            miembros = result.data;
            mostrarMiembros(miembros);
        }
    } catch (error) {
        console.error('Error al cargar miembros:', error);
    }
}

function mostrarMiembros(miembros) {
    const tbody = document.querySelector('#tabla-miembros tbody');
    
    if (miembros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay miembros registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = miembros.map(m => {
        const suscripcion = m.suscripcion ? 
            `<span class="badge ${m.suscripcion.activa ? 'badge-success' : 'badge-danger'}">
                ${m.suscripcion.tipo}
            </span>` : 
            '<span class="badge badge-warning">Sin suscripción</span>';
        
        const estado = m.activo ? 
            '<span class="badge badge-success">Activo</span>' : 
            '<span class="badge badge-danger">Inactivo</span>';
        
        return `
            <tr>
                <td>${m.id_miembro}</td>
                <td>${m.nombre} ${m.apellido}</td>
                <td>${m.telefono}</td>
                <td>${m.email}</td>
                <td>${suscripcion}</td>
                <td>${estado}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" 
                            onclick="asignarSuscripcion(${m.id_miembro})">
                        <i class="fas fa-id-card"></i> Suscripción
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function asignarSuscripcion(idMiembro) {
    document.getElementById('suscripcion-miembro-id').value = idMiembro;
    openModal('modal-suscripcion');
}

// ===== INVENTARIO =====
async function cargarInventario() {
    try {
        const response = await fetch(`${API_URL}/inventario`);
        const result = await response.json();
        
        if (result.success) {
            inventario = result.data;
            mostrarInventario(inventario);
        }
    } catch (error) {
        console.error('Error al cargar inventario:', error);
    }
}

function mostrarInventario(productos) {
    const tbody = document.querySelector('#tabla-inventario tbody');
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay productos en el inventario</td></tr>';
        return;
    }
    
    tbody.innerHTML = productos.map(p => {
        const stockClass = p.cantidad < 10 ? 'badge-danger' : (p.cantidad < 20 ? 'badge-warning' : 'badge-success');
        
        return `
            <tr>
                <td>${p.id_producto}</td>
                <td><code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">${p.codigo_barras}</code></td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td><span class="badge ${stockClass}">${p.cantidad}</span></td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" 
                            onclick="modificarStock(${p.id_producto})">
                        <i class="fas fa-edit"></i> Stock
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function modificarStock(idProducto) {
    document.getElementById('stock-producto-id').value = idProducto;
    openModal('modal-stock');
}

// ===== ACCESO =====
async function cargarAccesos() {
    try {
        const response = await fetch(`${API_URL}/acceso/registros?limite=30`);
        const result = await response.json();
        
        if (result.success) {
            registros = result.data;
            mostrarHistorialAccesos(registros);
        }
    } catch (error) {
        console.error('Error al cargar accesos:', error);
    }
}

function mostrarHistorialAccesos(registros) {
    const container = document.getElementById('historial-accesos');
    
    if (registros.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">No hay registros disponibles</p>';
        return;
    }
    
    container.innerHTML = registros.map(r => {
        const fecha = new Date(r.fecha_hora);
        const iconClass = r.tipo === 'ENTRADA' ? 'entrada' : 'salida';
        const icon = r.tipo === 'ENTRADA' ? 'fa-sign-in-alt' : 'fa-sign-out-alt';
        
        return `
            <div class="access-item">
                <div class="access-info">
                    <div class="access-icon ${iconClass}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="access-details">
                        <h4>${r.nombre_miembro || 'Desconocido'}</h4>
                        <p>${r.tipo} - ID: ${r.id_miembro}</p>
                    </div>
                </div>
                <div class="access-time">
                    ${fecha.toLocaleDateString('es-ES')} ${fecha.toLocaleTimeString('es-ES')}
                </div>
            </div>
        `;
    }).join('');
}

async function registrarEntrada() {
    const idMiembro = document.getElementById('entrada-id').value;
    
    if (!idMiembro) {
        showNotification('Ingrese el ID del miembro', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/acceso/entrada`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id_miembro: idMiembro})
        });
        
        const result = await response.json();
        
        if (result.success) {
            const miembro = result.data.miembro;
            const diasRestantes = miembro.suscripcion ? miembro.suscripcion.dias_restantes : 0;
            showNotification(
                `Entrada registrada: ${miembro.nombre} ${miembro.apellido} (${diasRestantes} días restantes)`, 
                'success'
            );
            document.getElementById('entrada-id').value = '';
            cargarAccesos();
            cargarDashboard();
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        showNotification('Error al registrar entrada', 'error');
    }
}

async function registrarSalida() {
    const idMiembro = document.getElementById('salida-id').value;
    
    if (!idMiembro) {
        showNotification('Ingrese el ID del miembro', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/acceso/salida`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id_miembro: idMiembro})
        });
        
        const result = await response.json();
        
        if (result.success) {
            const miembro = result.data.miembro;
            showNotification(`Salida registrada: ${miembro.nombre} ${miembro.apellido}`, 'success');
            document.getElementById('salida-id').value = '';
            cargarAccesos();
            cargarDashboard();
        } else {
            showNotification(result.error, 'error');
        }
    } catch (error) {
        showNotification('Error al registrar salida', 'error');
    }
}

// ===== NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
