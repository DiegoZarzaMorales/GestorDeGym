"""
Gestión de base de datos del sistema de gimnasio
"""

import json
import os
from typing import List
from datetime import datetime
from backend.models import Miembro, ProductoInventario, RegistroAcceso, Suscripcion, Venta


class Database:
    """Clase para gestionar la persistencia de datos"""
    
    def __init__(self, archivo_datos='data/gimnasio_datos.json'):
        self.archivo_datos = archivo_datos
        self.miembros: List[Miembro] = []
        self.inventario: List[ProductoInventario] = []
        self.registros_acceso: List[RegistroAcceso] = []
        self.ventas: List[Venta] = []
        self.cargar_datos()
    
    def cargar_datos(self):
        """Cargar datos desde archivo JSON"""
        if os.path.exists(self.archivo_datos):
            try:
                with open(self.archivo_datos, 'r', encoding='utf-8') as f:
                    datos = json.load(f)
                    self.miembros = [Miembro.from_dict(m) for m in datos.get('miembros', [])]
                    self.inventario = [ProductoInventario.from_dict(p) for p in datos.get('inventario', [])]
                    self.ventas = [Venta.from_dict(v) for v in datos.get('ventas', [])]
                    self.registros_acceso = [RegistroAcceso.from_dict(r) for r in datos.get('registros_acceso', [])]
                print(f"✓ Datos cargados: {len(self.miembros)} miembros, {len(self.inventario)} productos")
            except Exception as e:
                print(f"Error al cargar datos: {e}")
        else:
            # Crear archivo vacío
            self.guardar_datos()
    
    def guardar_datos(self):
        """Guardar datos en archivo JSON"""
        try:
            # Asegurar que el directorio existe
            os.makedirs(os.path.dirname(self.archivo_datos), exist_ok=True)
            
            datos = {
                'miembros': [m.to_dict() for m in self.miembros],
                'inventario': [p.to_dict() for p in self.inventario],
                'ventas': [v.to_dict() for v in self.ventas],
                'registros_acceso': [r.to_dict() for r in self.registros_acceso]
            }
            with open(self.archivo_datos, 'w', encoding='utf-8') as f:
                json.dump(datos, f, indent=4, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error al guardar datos: {e}")
            return False
    
    # ===== MIEMBROS =====
    
    def obtener_miembros(self):
        """Obtener todos los miembros"""
        return [m.to_dict() for m in self.miembros]
    
    def obtener_miembro(self, id_miembro: int):
        """Obtener un miembro por ID"""
        for miembro in self.miembros:
            if miembro.id_miembro == id_miembro:
                return miembro
        return None
    
    def buscar_por_telefono(self, telefono: str):
        """Buscar miembro por número de teléfono"""
        telefono_normalizado = (telefono or '').strip()
        for miembro in self.miembros:
            if (miembro.telefono or '').strip() == telefono_normalizado:
                return miembro
        return None

    def _contar_miembros_activos(self):
        """Contar miembros con suscripción vigente"""
        return sum(
            1
            for miembro in self.miembros
            if miembro.suscripcion and miembro.suscripcion.esta_activa()
        )
    
    def agregar_miembro(self, nombre: str, apellido: str, telefono: str, email: str, rol: str = 'MIEMBRO'):
        """Agregar un nuevo miembro"""
        id_miembro = max([m.id_miembro for m in self.miembros], default=0) + 1
        miembro = Miembro(id_miembro, nombre, apellido, telefono, email, rol)
        self.miembros.append(miembro)
        self.guardar_datos()
        return miembro
    
    def asignar_suscripcion(self, id_miembro: int, tipo_suscripcion: str):
        """Asignar suscripción a un miembro"""
        miembro = self.obtener_miembro(id_miembro)
        if not miembro:
            raise ValueError("Miembro no encontrado")
        
        suscripcion = Suscripcion(tipo_suscripcion, datetime.now().isoformat())
        miembro.suscripcion = suscripcion
        self.guardar_datos()
        return miembro
    
    # ===== INVENTARIO =====
    
    def obtener_inventario(self):
        """Obtener todos los productos"""
        return [p.to_dict() for p in self.inventario]
    
    def obtener_producto(self, id_producto: int):
        """Obtener un producto por ID"""
        for producto in self.inventario:
            if producto.id_producto == id_producto:
                return producto
        return None
    
    def agregar_producto(self, nombre: str, categoria: str, cantidad: int, precio: float, codigo_barras: str = None):
        """Agregar producto al inventario"""
        id_producto = max([p.id_producto for p in self.inventario], default=0) + 1
        producto = ProductoInventario(id_producto, nombre, categoria, cantidad, precio, codigo_barras)
        self.inventario.append(producto)
        self.guardar_datos()
        return producto
    
    def buscar_por_codigo_barras(self, codigo_barras: str):
        """Buscar producto por código de barras"""
        for producto in self.inventario:
            if producto.codigo_barras == codigo_barras:
                return producto
        return None
    
    def modificar_stock(self, id_producto: int, cantidad: int, tipo: str):
        """Modificar stock de un producto"""
        producto = self.obtener_producto(id_producto)
        if not producto:
            raise ValueError("Producto no encontrado")
        
        if tipo == 'AGREGAR':
            producto.agregar_stock(cantidad)
        elif tipo == 'QUITAR':
            producto.quitar_stock(cantidad)
        else:
            raise ValueError("Tipo de operación inválido")
        
        self.guardar_datos()
        return producto
    
    # ===== REGISTROS DE ACCESO =====
    
    def obtener_registros(self, limite: int = 50):
        """Obtener últimos registros de acceso"""
        registros = self.registros_acceso[-limite:]
        result = []
        for r in reversed(registros):
            miembro = self.obtener_miembro(r.id_miembro)
            registro_dict = r.to_dict()
            if miembro:
                registro_dict['nombre_miembro'] = f"{miembro.nombre} {miembro.apellido}"
            result.append(registro_dict)
        return result
    
    def registrar_entrada(self, id_miembro: int):
        """Registrar entrada de un miembro"""
        miembro = self.obtener_miembro(id_miembro)
        if not miembro:
            raise ValueError("Miembro no encontrado")

        rol_miembro = (miembro.rol or 'MIEMBRO').upper()
        es_entrenador = rol_miembro in ['ENTRENADOR', 'COACH', 'TRAINER', 'INSTRUCTOR']

        if not es_entrenador and (not miembro.suscripcion or not miembro.suscripcion.esta_activa()):
            raise ValueError("El miembro no tiene suscripción activa")
        
        id_registro = max([r.id_registro for r in self.registros_acceso], default=0) + 1
        registro = RegistroAcceso(id_registro, id_miembro, 'ENTRADA')
        self.registros_acceso.append(registro)
        self.guardar_datos()
        
        return {
            'registro': registro.to_dict(),
            'miembro': miembro.to_dict()
        }
    
    def registrar_salida(self, id_miembro: int):
        """Registrar salida de un miembro"""
        miembro = self.obtener_miembro(id_miembro)
        if not miembro:
            raise ValueError("Miembro no encontrado")
        
        id_registro = max([r.id_registro for r in self.registros_acceso], default=0) + 1
        registro = RegistroAcceso(id_registro, id_miembro, 'SALIDA')
        self.registros_acceso.append(registro)
        self.guardar_datos()
        
        return {
            'registro': registro.to_dict(),
            'miembro': miembro.to_dict()
        }
    
    def obtener_estadisticas_hoy(self):
        """Obtener estadísticas del día"""
        hoy = datetime.now().date()
        registros_hoy = [r for r in self.registros_acceso if r.fecha_hora.date() == hoy]
        
        entradas = sum(1 for r in registros_hoy if r.tipo == 'ENTRADA')
        salidas = sum(1 for r in registros_hoy if r.tipo == 'SALIDA')
        
        miembros_activos = self._contar_miembros_activos()

        # Calcular ganancias del día
        ventas_hoy = [v for v in self.ventas if v.fecha_hora.date() == hoy]
        ganancias_hoy = sum(v.total for v in ventas_hoy)
        
        return {
            'fecha': hoy.isoformat(),
            'entradas': entradas,
            'salidas': salidas,
            'en_gimnasio': entradas - salidas,
            'total_miembros': len(self.miembros),
            'miembros_activos': miembros_activos,
            'ventas_hoy': len(ventas_hoy),
            'ganancias_hoy': ganancias_hoy
        }
    
    # ===== VENTAS =====
    
    def procesar_venta(self, productos_venta: list):
        """Procesar una venta con múltiples productos"""
        items_venta = []
        total = 0
        
        for item in productos_venta:
            producto = self.obtener_producto(item['id_producto'])
            if not producto:
                raise ValueError(f"Producto {item['id_producto']} no encontrado")
            
            cantidad = item['cantidad']
            if cantidad > producto.cantidad:
                raise ValueError(f"Stock insuficiente de {producto.nombre}. Disponible: {producto.cantidad}")
            
            # Reducir stock
            producto.quitar_stock(cantidad)
            
            # Agregar al resumen
            subtotal = producto.precio * cantidad
            items_venta.append({
                'id_producto': producto.id_producto,
                'nombre': producto.nombre,
                'cantidad': cantidad,
                'precio_unitario': producto.precio,
                'subtotal': subtotal
            })
            total += subtotal
        
        # Crear venta
        id_venta = max([v.id_venta for v in self.ventas], default=0) + 1
        venta = Venta(id_venta, items_venta, total)
        self.ventas.append(venta)
        self.guardar_datos()
        
        return venta
    
    def obtener_ventas(self, limite: int = 50):
        """Obtener últimas ventas"""
        ultimas_ventas = self.ventas[-limite:]
        return [v.to_dict() for v in reversed(ultimas_ventas)]
    
    def obtener_estadisticas_ventas(self, dias: int = 30):
        """Obtener estadísticas de ventas"""
        from datetime import timedelta
        fecha_limite = datetime.now() - timedelta(days=dias)
        
        ventas_periodo = [v for v in self.ventas if v.fecha_hora >= fecha_limite]
        
        total_ventas = len(ventas_periodo)
        total_ganancias = sum(v.total for v in ventas_periodo)
        
        # Productos más vendidos
        productos_vendidos = {}
        for venta in ventas_periodo:
            for item in venta.productos:
                if item['id_producto'] not in productos_vendidos:
                    productos_vendidos[item['id_producto']] = {
                        'nombre': item['nombre'],
                        'cantidad': 0,
                        'ingresos': 0
                    }
                productos_vendidos[item['id_producto']]['cantidad'] += item['cantidad']
                productos_vendidos[item['id_producto']]['ingresos'] += item['subtotal']
        
        top_productos = sorted(productos_vendidos.values(), key=lambda x: x['cantidad'], reverse=True)[:5]
        
        return {
            'periodo_dias': dias,
            'total_ventas': total_ventas,
            'total_ganancias': total_ganancias,
            'promedio_por_venta': total_ganancias / total_ventas if total_ventas > 0 else 0,
            'top_productos': top_productos
        }
