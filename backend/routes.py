"""
API REST para el sistema de gestión de gimnasio
"""

from flask import Blueprint, request, jsonify
from backend.database import Database

# Crear blueprint para las rutas
api = Blueprint('api', __name__)

# Instancia de la base de datos
db = Database()


# ===== RUTAS DE MIEMBROS =====

@api.route('/api/miembros', methods=['GET'])
def obtener_miembros():
    """Obtener todos los miembros"""
    try:
        miembros = db.obtener_miembros()
        return jsonify({'success': True, 'data': miembros}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/miembros/<int:id_miembro>', methods=['GET'])
def obtener_miembro(id_miembro):
    """Obtener un miembro específico"""
    try:
        miembro = db.obtener_miembro(id_miembro)
        if miembro:
            return jsonify({'success': True, 'data': miembro.to_dict()}), 200
        return jsonify({'success': False, 'error': 'Miembro no encontrado'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/miembros/buscar/telefono/<telefono>', methods=['GET'])
def buscar_por_telefono(telefono):
    """Buscar miembro por número de teléfono"""
    try:
        miembro = db.buscar_por_telefono(telefono)
        if miembro:
            return jsonify({'success': True, 'data': miembro.to_dict()}), 200
        return jsonify({'success': False, 'error': 'Miembro no encontrado'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/miembros', methods=['POST'])
def agregar_miembro():
    """Agregar un nuevo miembro"""
    try:
        data = request.json
        miembro = db.agregar_miembro(
            data['nombre'],
            data['apellido'],
            data['telefono'],
            data['email'],
            data.get('rol', 'MIEMBRO')
        )
        return jsonify({'success': True, 'data': miembro.to_dict()}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/miembros/<int:id_miembro>/suscripcion', methods=['POST'])
def asignar_suscripcion(id_miembro):
    """Asignar suscripción a un miembro"""
    try:
        data = request.json
        miembro = db.asignar_suscripcion(id_miembro, data['tipo'])
        return jsonify({'success': True, 'data': miembro.to_dict()}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/suscripciones/tipos', methods=['GET'])
def obtener_tipos_suscripcion():
    """Obtener tipos de suscripción disponibles"""
    from backend.models import Suscripcion
    return jsonify({'success': True, 'data': Suscripcion.TIPOS}), 200


# ===== RUTAS DE INVENTARIO =====

@api.route('/api/inventario', methods=['GET'])
def obtener_inventario():
    """Obtener todos los productos"""
    try:
        inventario = db.obtener_inventario()
        return jsonify({'success': True, 'data': inventario}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/inventario', methods=['POST'])
def agregar_producto():
    """Agregar un producto al inventario"""
    try:
        data = request.json
        producto = db.agregar_producto(
            data['nombre'],
            data['categoria'],
            int(data['cantidad']),
            float(data['precio']),
            data.get('codigo_barras')
        )
        return jsonify({'success': True, 'data': producto.to_dict()}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/inventario/buscar/codigo/<codigo_barras>', methods=['GET'])
def buscar_por_codigo_barras(codigo_barras):
    """Buscar producto por código de barras"""
    try:
        producto = db.buscar_por_codigo_barras(codigo_barras)
        if producto:
            return jsonify({'success': True, 'data': producto.to_dict()}), 200
        return jsonify({'success': False, 'error': 'Producto no encontrado'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/ventas/procesar', methods=['POST'])
def procesar_venta():
    """Procesar una venta con múltiples productos"""
    try:
        data = request.json
        productos = data['productos']  # Lista de {id_producto, cantidad}
        
        venta = db.procesar_venta(productos)
        
        return jsonify({
            'success': True, 
            'data': venta.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/ventas', methods=['GET'])
def obtener_ventas():
    """Obtener historial de ventas"""
    try:
        limite = request.args.get('limite', 50, type=int)
        ventas = db.obtener_ventas(limite)
        return jsonify({'success': True, 'data': ventas}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/estadisticas/ventas', methods=['GET'])
def obtener_estadisticas_ventas():
    """Obtener estadísticas de ventas"""
    try:
        dias = request.args.get('dias', 30, type=int)
        estadisticas = db.obtener_estadisticas_ventas(dias)
        return jsonify({'success': True, 'data': estadisticas}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/inventario/<int:id_producto>/stock', methods=['PUT'])
def modificar_stock(id_producto):
    """Modificar stock de un producto"""
    try:
        data = request.json
        producto = db.modificar_stock(
            id_producto,
            int(data['cantidad']),
            data['tipo']  # 'AGREGAR' o 'QUITAR'
        )
        return jsonify({'success': True, 'data': producto.to_dict()}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ===== RUTAS DE ACCESO =====

@api.route('/api/acceso/entrada', methods=['POST'])
def registrar_entrada():
    """Registrar entrada de un miembro"""
    try:
        data = request.json
        resultado = db.registrar_entrada(int(data['id_miembro']))
        return jsonify({'success': True, 'data': resultado}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/acceso/salida', methods=['POST'])
def registrar_salida():
    """Registrar salida de un miembro"""
    try:
        data = request.json
        resultado = db.registrar_salida(int(data['id_miembro']))
        return jsonify({'success': True, 'data': resultado}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/acceso/registros', methods=['GET'])
def obtener_registros():
    """Obtener registros de acceso"""
    try:
        limite = request.args.get('limite', 50, type=int)
        registros = db.obtener_registros(limite)
        return jsonify({'success': True, 'data': registros}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@api.route('/api/estadisticas/hoy', methods=['GET'])
def obtener_estadisticas():
    """Obtener estadísticas del día"""
    try:
        estadisticas = db.obtener_estadisticas_hoy()
        return jsonify({'success': True, 'data': estadisticas}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
