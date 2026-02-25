// API Base URL
const API_URL = 'http://localhost:5000/api';

// Estado de la aplicación
let currentSection = 'dashboard';
let miembros = [];
let inventario = [];
let registros = [];
let miembrosFiltrados = [];
let inventarioFiltrado = [];
let dashboardSnapshot = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initModals();
    initForms();
    initRefresh();
    initLiveClock();
    initTableFilters();
    initUtilityActions();
    initKeyboardShortcuts();
    
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

function initUtilityActions() {
    const btnExportarMiembros = document.getElementById('btn-exportar-miembros');
    const btnExportarInventario = document.getElementById('btn-exportar-inventario');
    const btnCopySummary = document.getElementById('btn-copy-summary');

    if (btnExportarMiembros) {
        btnExportarMiembros.addEventListener('click', exportarMiembrosCSV);
    }

    if (btnExportarInventario) {
        btnExportarInventario.addEventListener('click', exportarInventarioCSV);
    }

    if (btnCopySummary) {
        btnCopySummary.addEventListener('click', copiarResumenDiario);
    }
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

function initLiveClock() {
    const clock = document.getElementById('live-clock');
    if (!clock) {
        return;
    }

    const updateClock = () => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    updateClock();
    setInterval(updateClock, 1000);
}

// ===== DASHBOARD =====
async function cargarDashboard() {
    try {
        await cargarAlertasOperativas();

        const response = await fetch(`${API_URL}/estadisticas/hoy`);
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            dashboardSnapshot = {
                ...dashboardSnapshot,
                hoy: stats
            };
            updateStatValue('stat-total-miembros', stats.total_miembros);
            updateStatValue('stat-miembros-activos', stats.miembros_activos);
            updateStatValue('stat-ventas-hoy', stats.ventas_hoy);
            updateStatValue('stat-ganancias-hoy', `$${stats.ganancias_hoy.toFixed(2)}`);
        }
        
        // Cargar estadísticas de ventas
        const ventasResponse = await fetch(`${API_URL}/estadisticas/ventas?dias=30`);
        const ventasResult = await ventasResponse.json();
        
        if (ventasResult.success) {
            const stats = ventasResult.data;
            dashboardSnapshot = {
                ...dashboardSnapshot,
                ventas: stats
            };
            updateStatValue('total-ventas-mes', stats.total_ventas);
            updateStatValue('ganancias-mes', `$${stats.total_ganancias.toFixed(2)}`);
            updateStatValue('promedio-venta', `$${stats.promedio_por_venta.toFixed(2)}`);
            
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

function updateStatValue(elementId, value) {
    const target = document.getElementById(elementId);
    if (!target) {
        return;
    }

    const previousValue = target.textContent;
    target.textContent = value;

    if (`${previousValue}` !== `${value}`) {
        target.classList.remove('updated');
        void target.offsetWidth;
        target.classList.add('updated');
        setTimeout(() => target.classList.remove('updated'), 260);
    }
}

async function cargarAlertasOperativas() {
    try {
        const [miembrosResponse, inventarioResponse] = await Promise.all([
            fetch(`${API_URL}/miembros`),
            fetch(`${API_URL}/inventario`)
        ]);

        const [miembrosResult, inventarioResult] = await Promise.all([
            miembrosResponse.json(),
            inventarioResponse.json()
        ]);

        const miembrosData = miembrosResult.success ? miembrosResult.data : [];
        const inventarioData = inventarioResult.success ? inventarioResult.data : [];

        const suscripcionesPorVencer = miembrosData.filter(miembro => {
            const suscripcion = miembro.suscripcion;
            return suscripcion && suscripcion.activa && suscripcion.dias_restantes <= 7;
        }).length;

        const stockCritico = inventarioData.filter(producto => producto.cantidad < 10).length;
        const stockBajo = inventarioData.filter(producto => producto.cantidad >= 10 && producto.cantidad < 20).length;

        renderizarAlertasOperativas({
            suscripcionesPorVencer,
            stockCritico,
            stockBajo
        });
    } catch (error) {
        console.error('Error al cargar alertas operativas:', error);
        renderizarAlertasOperativas({
            suscripcionesPorVencer: 0,
            stockCritico: 0,
            stockBajo: 0
        });
    }
}

function renderizarAlertasOperativas(alertas) {
    const container = document.getElementById('ops-alerts');
    if (!container) {
        return;
    }

    const { suscripcionesPorVencer, stockCritico, stockBajo } = alertas;
    const totalAlertas = suscripcionesPorVencer + stockCritico + stockBajo;

    if (totalAlertas === 0) {
        container.innerHTML = '<div class="ops-empty">Sin alertas críticas. Operación estable.</div>';
        return;
    }

    container.innerHTML = `
        <div class="ops-item critical">
            <div>
                <div class="ops-title">Suscripciones por vencer</div>
                <div class="ops-meta">Miembros con vencimiento en los próximos 7 días</div>
            </div>
            <div class="ops-count">${suscripcionesPorVencer}</div>
        </div>
        <div class="ops-item critical">
            <div>
                <div class="ops-title">Stock crítico</div>
                <div class="ops-meta">Productos con menos de 10 unidades</div>
            </div>
            <div class="ops-count">${stockCritico}</div>
        </div>
        <div class="ops-item warning">
            <div>
                <div class="ops-title">Stock bajo</div>
                <div class="ops-meta">Productos entre 10 y 19 unidades</div>
            </div>
            <div class="ops-count">${stockBajo}</div>
        </div>
    `;
}

function mostrarTopProductos(productos) {
    const container = document.getElementById('top-productos');
    
    if (productos.length === 0) {
        container.innerHTML = '<p class="top-empty">No hay ventas registradas</p>';
        return;
    }
    
    container.innerHTML = productos.map((p, index) => `
        <div class="top-product-item">
            <div class="top-product-main">
                <div class="top-rank">
                    ${index + 1}
                </div>
                <div>
                    <div class="top-product-name">${p.nombre}</div>
                    <div class="top-product-meta">${p.cantidad} unidades vendidas</div>
                </div>
            </div>
            <div class="top-product-income">$${p.ingresos.toFixed(2)}</div>
        </div>
    `).join('');
}

function mostrarUltimosAccesos(registros) {
    const container = document.getElementById('ultimos-accesos');
    
    if (registros.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay registros disponibles</p>';
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
            aplicarFiltroMiembros();
        }
    } catch (error) {
        console.error('Error al cargar miembros:', error);
    }
}

function aplicarFiltroMiembros() {
    const input = document.getElementById('filtro-miembros');
    const query = input ? input.value.trim().toLowerCase() : '';

    if (!query) {
        miembrosFiltrados = [...miembros];
        mostrarMiembros(miembrosFiltrados);
        return;
    }

    miembrosFiltrados = miembros.filter(miembro => {
        const texto = `${miembro.nombre} ${miembro.apellido} ${miembro.telefono} ${miembro.email}`.toLowerCase();
        return texto.includes(query);
    });

    mostrarMiembros(miembrosFiltrados);
}

function mostrarMiembros(miembros) {
    const tbody = document.querySelector('#tabla-miembros tbody');
    
    if (miembros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No hay miembros registrados</td></tr>';
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
                    <button class="btn btn-primary btn-sm" 
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
            aplicarFiltroInventario();
        }
    } catch (error) {
        console.error('Error al cargar inventario:', error);
    }
}

function aplicarFiltroInventario() {
    const input = document.getElementById('filtro-inventario');
    const query = input ? input.value.trim().toLowerCase() : '';

    if (!query) {
        inventarioFiltrado = [...inventario];
        mostrarInventario(inventarioFiltrado);
        return;
    }

    inventarioFiltrado = inventario.filter(producto => {
        const texto = `${producto.nombre} ${producto.categoria} ${producto.codigo_barras}`.toLowerCase();
        return texto.includes(query);
    });

    mostrarInventario(inventarioFiltrado);
}

function initTableFilters() {
    const filtroMiembros = document.getElementById('filtro-miembros');
    const filtroInventario = document.getElementById('filtro-inventario');
    const limpiarMiembros = document.getElementById('btn-limpiar-filtro-miembros');
    const limpiarInventario = document.getElementById('btn-limpiar-filtro-inventario');

    if (filtroMiembros) {
        filtroMiembros.addEventListener('input', aplicarFiltroMiembros);
    }

    if (filtroInventario) {
        filtroInventario.addEventListener('input', aplicarFiltroInventario);
    }

    if (limpiarMiembros && filtroMiembros) {
        limpiarMiembros.addEventListener('click', function() {
            filtroMiembros.value = '';
            aplicarFiltroMiembros();
        });
    }

    if (limpiarInventario && filtroInventario) {
        limpiarInventario.addEventListener('click', function() {
            filtroInventario.value = '';
            aplicarFiltroInventario();
        });
    }
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        if (!event.altKey) {
            return;
        }

        const key = event.key.toLowerCase();
        const shortcuts = {
            '1': 'dashboard',
            '2': 'miembros',
            '3': 'inventario',
            '4': 'acceso'
        };

        if (shortcuts[key]) {
            event.preventDefault();
            const targetSection = shortcuts[key];
            const navTarget = document.querySelector(`.nav-item[data-section="${targetSection}"]`);
            if (navTarget) {
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                navTarget.classList.add('active');
            }
            changeSection(targetSection);
            return;
        }

        if (key === 'r') {
            event.preventDefault();
            const refreshButton = document.getElementById('refresh-btn');
            if (refreshButton) {
                refreshButton.click();
            }
            return;
        }

        if (key === 's') {
            event.preventDefault();
            copiarResumenDiario();
        }
    });
}

function csvEscape(value) {
    if (value === null || value === undefined) {
        return '""';
    }

    const text = String(value).replace(/"/g, '""');
    return `"${text}"`;
}

function descargarCSV(filename, headers, rows) {
    const csvContent = [
        headers.map(csvEscape).join(','),
        ...rows.map(row => row.map(csvEscape).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function exportarMiembrosCSV() {
    if (!miembros.length) {
        await cargarMiembros();
    }

    const filtroActivo = (document.getElementById('filtro-miembros')?.value || '').trim().length > 0;
    const source = filtroActivo ? miembrosFiltrados : miembros;
    if (!source.length) {
        showNotification('No hay miembros para exportar', 'error');
        return;
    }

    const rows = source.map(m => [
        m.id_miembro,
        `${m.nombre} ${m.apellido}`,
        m.telefono,
        m.email,
        m.suscripcion ? m.suscripcion.tipo : 'SIN_SUSCRIPCION',
        m.suscripcion ? (m.suscripcion.activa ? 'ACTIVA' : 'VENCIDA') : 'SIN_SUSCRIPCION',
        m.activo ? 'ACTIVO' : 'INACTIVO'
    ]);

    descargarCSV(
        `miembros_${new Date().toISOString().slice(0, 10)}.csv`,
        ['ID', 'NOMBRE', 'TELEFONO', 'EMAIL', 'SUSCRIPCION', 'ESTADO_SUSCRIPCION', 'ESTADO_MIEMBRO'],
        rows
    );
    showNotification(`CSV exportado: ${source.length} miembros`, 'success');
}

async function exportarInventarioCSV() {
    if (!inventario.length) {
        await cargarInventario();
    }

    const filtroActivo = (document.getElementById('filtro-inventario')?.value || '').trim().length > 0;
    const source = filtroActivo ? inventarioFiltrado : inventario;
    if (!source.length) {
        showNotification('No hay productos para exportar', 'error');
        return;
    }

    const rows = source.map(p => [
        p.id_producto,
        p.codigo_barras,
        p.nombre,
        p.categoria,
        p.cantidad,
        Number(p.precio).toFixed(2)
    ]);

    descargarCSV(
        `inventario_${new Date().toISOString().slice(0, 10)}.csv`,
        ['ID', 'CODIGO_BARRAS', 'PRODUCTO', 'CATEGORIA', 'STOCK', 'PRECIO'],
        rows
    );
    showNotification(`CSV exportado: ${source.length} productos`, 'success');
}

async function copiarResumenDiario() {
    if (!dashboardSnapshot?.hoy || !dashboardSnapshot?.ventas) {
        await cargarDashboard();
    }

    if (!dashboardSnapshot?.hoy || !dashboardSnapshot?.ventas) {
        showNotification('No se pudo construir el resumen diario', 'error');
        return;
    }

    const ahora = new Date();
    const resumen = [
        `Resumen Diario - ${ahora.toLocaleDateString('es-ES')} ${ahora.toLocaleTimeString('es-ES')}`,
        `Miembros totales: ${dashboardSnapshot.hoy.total_miembros}`,
        `Miembros activos: ${dashboardSnapshot.hoy.miembros_activos}`,
        `Ventas hoy: ${dashboardSnapshot.hoy.ventas_hoy}`,
        `Ganancias hoy: $${dashboardSnapshot.hoy.ganancias_hoy.toFixed(2)}`,
        `Ventas últimos 30 días: ${dashboardSnapshot.ventas.total_ventas}`,
        `Ganancias últimos 30 días: $${dashboardSnapshot.ventas.total_ganancias.toFixed(2)}`
    ].join('\n');

    try {
        await navigator.clipboard.writeText(resumen);
        showNotification('Resumen diario copiado al portapapeles', 'success');
    } catch (error) {
        showNotification('No se pudo copiar el resumen', 'error');
    }
}

function mostrarInventario(productos) {
    const tbody = document.querySelector('#tabla-inventario tbody');
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No hay productos en el inventario</td></tr>';
        return;
    }
    
    tbody.innerHTML = productos.map(p => {
        const stockClass = p.cantidad < 10 ? 'badge-danger' : (p.cantidad < 20 ? 'badge-warning' : 'badge-success');
        
        return `
            <tr>
                <td>${p.id_producto}</td>
                <td><code class="barcode">${p.codigo_barras}</code></td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td><span class="badge ${stockClass}">${p.cantidad}</span></td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" 
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
        container.innerHTML = '<p class="empty-state">No hay registros disponibles</p>';
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
