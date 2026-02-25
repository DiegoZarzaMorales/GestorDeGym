"""
Modelos de datos para el sistema de gimnasio
"""

from datetime import datetime, timedelta
from typing import Optional


class Miembro:
    """Clase para representar un miembro del gimnasio"""
    
    def __init__(self, id_miembro: int, nombre: str, apellido: str, telefono: str, email: str, rol: str = 'MIEMBRO'):
        self.id_miembro = id_miembro
        self.nombre = nombre
        self.apellido = apellido
        self.telefono = telefono
        self.email = email
        self.rol = rol.upper() if isinstance(rol, str) and rol else 'MIEMBRO'
        self.suscripcion: Optional['Suscripcion'] = None
        self.activo = True
    
    def to_dict(self):
        return {
            'id_miembro': self.id_miembro,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'telefono': self.telefono,
            'email': self.email,
            'rol': self.rol,
            'suscripcion': self.suscripcion.to_dict() if self.suscripcion else None,
            'activo': self.activo
        }
    
    @classmethod
    def from_dict(cls, data):
        miembro = cls(
            data['id_miembro'],
            data['nombre'],
            data['apellido'],
            data['telefono'],
            data['email'],
            data.get('rol', 'MIEMBRO')
        )
        if data.get('suscripcion'):
            miembro.suscripcion = Suscripcion.from_dict(data['suscripcion'])
        miembro.activo = data.get('activo', True)
        return miembro


class Suscripcion:
    """Clase para representar una suscripción"""
    
    TIPOS = {
        'MENSUAL': {'duracion': 30, 'precio': 50.00},
        'TRIMESTRAL': {'duracion': 90, 'precio': 135.00},
        'SEMESTRAL': {'duracion': 180, 'precio': 250.00},
        'ANUAL': {'duracion': 365, 'precio': 450.00}
    }
    
    def __init__(self, tipo: str, fecha_inicio: str):
        if tipo not in self.TIPOS:
            raise ValueError(f"Tipo de suscripción no válido")
        
        self.tipo = tipo
        self.fecha_inicio = datetime.fromisoformat(fecha_inicio) if isinstance(fecha_inicio, str) else fecha_inicio
        self.duracion_dias = self.TIPOS[tipo]['duracion']
        self.precio = self.TIPOS[tipo]['precio']
        self.fecha_fin = self.fecha_inicio + timedelta(days=self.duracion_dias)
    
    def esta_activa(self):
        return datetime.now() <= self.fecha_fin
    
    def dias_restantes(self):
        if self.esta_activa():
            return (self.fecha_fin - datetime.now()).days
        return 0
    
    def to_dict(self):
        return {
            'tipo': self.tipo,
            'fecha_inicio': self.fecha_inicio.isoformat(),
            'duracion_dias': self.duracion_dias,
            'precio': self.precio,
            'fecha_fin': self.fecha_fin.isoformat(),
            'activa': self.esta_activa(),
            'dias_restantes': self.dias_restantes()
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(data['tipo'], data['fecha_inicio'])


class ProductoInventario:
    """Clase para representar un producto del inventario"""
    
    def __init__(self, id_producto: int, nombre: str, categoria: str, cantidad: int, precio: float, codigo_barras: str = None):
        self.id_producto = id_producto
        self.nombre = nombre
        self.categoria = categoria
        self.cantidad = cantidad
        self.precio = precio
        self.codigo_barras = codigo_barras or f"BAR{id_producto:06d}"
    
    def agregar_stock(self, cantidad: int):
        self.cantidad += cantidad
    
    def quitar_stock(self, cantidad: int):
        if cantidad > self.cantidad:
            raise ValueError(f"Stock insuficiente. Disponible: {self.cantidad}")
        self.cantidad -= cantidad
    
    def to_dict(self):
        return {
            'id_producto': self.id_producto,
            'nombre': self.nombre,
            'categoria': self.categoria,
            'cantidad': self.cantidad,
            'precio': self.precio,
            'codigo_barras': self.codigo_barras
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            data['id_producto'],
            data['nombre'],
            data['categoria'],
            data['cantidad'],
            data['precio'],
            data.get('codigo_barras')
        )


class RegistroAcceso:
    """Clase para registrar entradas y salidas del gimnasio"""
    
    def __init__(self, id_registro: int, id_miembro: int, tipo: str, fecha_hora: str = None):
        self.id_registro = id_registro
        self.id_miembro = id_miembro
        self.tipo = tipo  # 'ENTRADA' o 'SALIDA'
        self.fecha_hora = datetime.fromisoformat(fecha_hora) if fecha_hora else datetime.now()
    
    def to_dict(self):
        return {
            'id_registro': self.id_registro,
            'id_miembro': self.id_miembro,
            'tipo': self.tipo,
            'fecha_hora': self.fecha_hora.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            data['id_registro'],
            data['id_miembro'],
            data['tipo'],
            data['fecha_hora']
        )


class Venta:
    """Clase para registrar ventas realizadas"""
    
    def __init__(self, id_venta: int, productos: list, total: float, fecha_hora: str = None):
        self.id_venta = id_venta
        self.productos = productos  # Lista de {id_producto, nombre, cantidad, precio_unitario, subtotal}
        self.total = total
        self.fecha_hora = datetime.fromisoformat(fecha_hora) if fecha_hora else datetime.now()
    
    def to_dict(self):
        return {
            'id_venta': self.id_venta,
            'productos': self.productos,
            'total': self.total,
            'fecha_hora': self.fecha_hora.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            data['id_venta'],
            data['productos'],
            data['total'],
            data['fecha_hora']
        )
