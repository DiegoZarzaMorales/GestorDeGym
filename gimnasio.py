"""
Sistema de Gestión para Gimnasio
- Gestión de suscripciones de miembros
- Control de inventario
- Registro de entradas y salidas
"""

from datetime import datetime, timedelta
from typing import List, Optional
import json
import os


class Miembro:
    """Clase para representar un miembro del gimnasio"""
    
    def __init__(self, id_miembro: int, nombre: str, apellido: str, telefono: str, email: str):
        self.id_miembro = id_miembro
        self.nombre = nombre
        self.apellido = apellido
        self.telefono = telefono
        self.email = email
        self.suscripcion: Optional['Suscripcion'] = None
        self.activo = True
    
    def to_dict(self):
        return {
            'id_miembro': self.id_miembro,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'telefono': self.telefono,
            'email': self.email,
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
            data['email']
        )
        if data['suscripcion']:
            miembro.suscripcion = Suscripcion.from_dict(data['suscripcion'])
        miembro.activo = data['activo']
        return miembro
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} (ID: {self.id_miembro})"


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
            raise ValueError(f"Tipo de suscripción no válido. Opciones: {list(self.TIPOS.keys())}")
        
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
            'fecha_fin': self.fecha_fin.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(data['tipo'], data['fecha_inicio'])
    
    def __str__(self):
        estado = "ACTIVA" if self.esta_activa() else "VENCIDA"
        return f"{self.tipo} - {estado} (Vence: {self.fecha_fin.strftime('%d/%m/%Y')})"


class ProductoInventario:
    """Clase para representar un producto del inventario"""
    
    def __init__(self, id_producto: int, nombre: str, categoria: str, cantidad: int, precio: float):
        self.id_producto = id_producto
        self.nombre = nombre
        self.categoria = categoria
        self.cantidad = cantidad
        self.precio = precio
    
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
            'precio': self.precio
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            data['id_producto'],
            data['nombre'],
            data['categoria'],
            data['cantidad'],
            data['precio']
        )
    
    def __str__(self):
        return f"{self.nombre} ({self.categoria}) - Stock: {self.cantidad} - ${self.precio:.2f}"


class RegistroAcceso:
    """Clase para registrar entradas y salidas del gimnasio"""
    
    def __init__(self, id_miembro: int, tipo: str, fecha_hora: str = None):
        self.id_miembro = id_miembro
        self.tipo = tipo  # 'ENTRADA' o 'SALIDA'
        self.fecha_hora = datetime.fromisoformat(fecha_hora) if fecha_hora else datetime.now()
    
    def to_dict(self):
        return {
            'id_miembro': self.id_miembro,
            'tipo': self.tipo,
            'fecha_hora': self.fecha_hora.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(data['id_miembro'], data['tipo'], data['fecha_hora'])
    
    def __str__(self):
        return f"{self.tipo} - ID Miembro: {self.id_miembro} - {self.fecha_hora.strftime('%d/%m/%Y %H:%M:%S')}"


class SistemaGimnasio:
    """Sistema principal de gestión del gimnasio"""
    
    def __init__(self, archivo_datos='gimnasio_datos.json'):
        self.archivo_datos = archivo_datos
        self.miembros: List[Miembro] = []
        self.inventario: List[ProductoInventario] = []
        self.registros_acceso: List[RegistroAcceso] = []
        self.cargar_datos()
    
    def cargar_datos(self):
        """Cargar datos desde archivo JSON"""
        if os.path.exists(self.archivo_datos):
            try:
                with open(self.archivo_datos, 'r', encoding='utf-8') as f:
                    datos = json.load(f)
                    self.miembros = [Miembro.from_dict(m) for m in datos.get('miembros', [])]
                    self.inventario = [ProductoInventario.from_dict(p) for p in datos.get('inventario', [])]
                    self.registros_acceso = [RegistroAcceso.from_dict(r) for r in datos.get('registros_acceso', [])]
                print("Datos cargados exitosamente.")
            except Exception as e:
                print(f"Error al cargar datos: {e}")
    
    def guardar_datos(self):
        """Guardar datos en archivo JSON"""
        try:
            datos = {
                'miembros': [m.to_dict() for m in self.miembros],
                'inventario': [p.to_dict() for p in self.inventario],
                'registros_acceso': [r.to_dict() for r in self.registros_acceso]
            }
            with open(self.archivo_datos, 'w', encoding='utf-8') as f:
                json.dump(datos, f, indent=4, ensure_ascii=False)
            print("Datos guardados exitosamente.")
        except Exception as e:
            print(f"Error al guardar datos: {e}")
    
    # ===== GESTIÓN DE MIEMBROS Y SUSCRIPCIONES =====
    
    def agregar_miembro(self, nombre: str, apellido: str, telefono: str, email: str):
        """Agregar un nuevo miembro"""
        id_miembro = len(self.miembros) + 1
        miembro = Miembro(id_miembro, nombre, apellido, telefono, email)
        self.miembros.append(miembro)
        print(f"✓ Miembro agregado: {miembro}")
        return miembro
    
    def buscar_miembro(self, id_miembro: int) -> Optional[Miembro]:
        """Buscar miembro por ID"""
        for miembro in self.miembros:
            if miembro.id_miembro == id_miembro:
                return miembro
        return None
    
    def asignar_suscripcion(self, id_miembro: int, tipo_suscripcion: str):
        """Asignar suscripción a un miembro"""
        miembro = self.buscar_miembro(id_miembro)
        if not miembro:
            print(f"✗ Miembro con ID {id_miembro} no encontrado.")
            return
        
        try:
            suscripcion = Suscripcion(tipo_suscripcion, datetime.now().isoformat())
            miembro.suscripcion = suscripcion
            print(f"✓ Suscripción {tipo_suscripcion} asignada a {miembro.nombre} {miembro.apellido}")
            print(f"  Fecha vencimiento: {suscripcion.fecha_fin.strftime('%d/%m/%Y')}")
        except ValueError as e:
            print(f"✗ Error: {e}")
    
    def listar_miembros(self):
        """Listar todos los miembros"""
        if not self.miembros:
            print("No hay miembros registrados.")
            return
        
        print("\n" + "="*80)
        print("LISTA DE MIEMBROS")
        print("="*80)
        for miembro in self.miembros:
            estado = "ACTIVO" if miembro.activo else "INACTIVO"
            print(f"ID: {miembro.id_miembro} | {miembro.nombre} {miembro.apellido} | {estado}")
            print(f"  Tel: {miembro.telefono} | Email: {miembro.email}")
            if miembro.suscripcion:
                print(f"  Suscripción: {miembro.suscripcion}")
            else:
                print(f"  Suscripción: Sin suscripción")
            print("-" * 80)
    
    # ===== GESTIÓN DE INVENTARIO =====
    
    def agregar_producto(self, nombre: str, categoria: str, cantidad: int, precio: float):
        """Agregar producto al inventario"""
        id_producto = len(self.inventario) + 1
        producto = ProductoInventario(id_producto, nombre, categoria, cantidad, precio)
        self.inventario.append(producto)
        print(f"✓ Producto agregado: {producto}")
        return producto
    
    def buscar_producto(self, id_producto: int) -> Optional[ProductoInventario]:
        """Buscar producto por ID"""
        for producto in self.inventario:
            if producto.id_producto == id_producto:
                return producto
        return None
    
    def modificar_stock(self, id_producto: int, cantidad: int, tipo: str):
        """Modificar stock de un producto (agregar o quitar)"""
        producto = self.buscar_producto(id_producto)
        if not producto:
            print(f"✗ Producto con ID {id_producto} no encontrado.")
            return
        
        try:
            if tipo == 'AGREGAR':
                producto.agregar_stock(cantidad)
                print(f"✓ Stock agregado. Nuevo stock de {producto.nombre}: {producto.cantidad}")
            elif tipo == 'QUITAR':
                producto.quitar_stock(cantidad)
                print(f"✓ Stock reducido. Nuevo stock de {producto.nombre}: {producto.cantidad}")
        except ValueError as e:
            print(f"✗ Error: {e}")
    
    def listar_inventario(self):
        """Listar todos los productos del inventario"""
        if not self.inventario:
            print("El inventario está vacío.")
            return
        
        print("\n" + "="*80)
        print("INVENTARIO")
        print("="*80)
        for producto in self.inventario:
            print(f"ID: {producto.id_producto} | {producto}")
            print("-" * 80)
    
    # ===== CONTROL DE ENTRADAS Y SALIDAS =====
    
    def registrar_entrada(self, id_miembro: int):
        """Registrar entrada de un miembro"""
        miembro = self.buscar_miembro(id_miembro)
        if not miembro:
            print(f"✗ Miembro con ID {id_miembro} no encontrado.")
            return
        
        if not miembro.suscripcion or not miembro.suscripcion.esta_activa():
            print(f"✗ {miembro.nombre} {miembro.apellido} no tiene suscripción activa.")
            if miembro.suscripcion:
                print(f"  Suscripción vencida el {miembro.suscripcion.fecha_fin.strftime('%d/%m/%Y')}")
            return
        
        registro = RegistroAcceso(id_miembro, 'ENTRADA')
        self.registros_acceso.append(registro)
        print(f"✓ Entrada registrada: {miembro.nombre} {miembro.apellido}")
        print(f"  Hora: {registro.fecha_hora.strftime('%H:%M:%S')}")
        print(f"  Días restantes de suscripción: {miembro.suscripcion.dias_restantes()}")
    
    def registrar_salida(self, id_miembro: int):
        """Registrar salida de un miembro"""
        miembro = self.buscar_miembro(id_miembro)
        if not miembro:
            print(f"✗ Miembro con ID {id_miembro} no encontrado.")
            return
        
        registro = RegistroAcceso(id_miembro, 'SALIDA')
        self.registros_acceso.append(registro)
        print(f"✓ Salida registrada: {miembro.nombre} {miembro.apellido}")
        print(f"  Hora: {registro.fecha_hora.strftime('%H:%M:%S')}")
    
    def ver_registros_acceso(self, limite: int = 20):
        """Ver últimos registros de acceso"""
        if not self.registros_acceso:
            print("No hay registros de acceso.")
            return
        
        print("\n" + "="*80)
        print(f"ÚLTIMOS {limite} REGISTROS DE ACCESO")
        print("="*80)
        
        ultimos_registros = self.registros_acceso[-limite:]
        for registro in reversed(ultimos_registros):
            miembro = self.buscar_miembro(registro.id_miembro)
            nombre = f"{miembro.nombre} {miembro.apellido}" if miembro else "Desconocido"
            print(f"{registro.tipo:8} | {nombre:30} | {registro.fecha_hora.strftime('%d/%m/%Y %H:%M:%S')}")
        print("="*80)
    
    def estadisticas_hoy(self):
        """Mostrar estadísticas del día"""
        hoy = datetime.now().date()
        registros_hoy = [r for r in self.registros_acceso if r.fecha_hora.date() == hoy]
        
        entradas = sum(1 for r in registros_hoy if r.tipo == 'ENTRADA')
        salidas = sum(1 for r in registros_hoy if r.tipo == 'SALIDA')
        
        print("\n" + "="*50)
        print("ESTADÍSTICAS DE HOY")
        print("="*50)
        print(f"Fecha: {hoy.strftime('%d/%m/%Y')}")
        print(f"Total de entradas: {entradas}")
        print(f"Total de salidas: {salidas}")
        print(f"Personas actualmente en el gimnasio: {entradas - salidas}")
        print("="*50)


def mostrar_menu_principal():
    """Mostrar menú principal"""
    print("\n" + "="*50)
    print("SISTEMA DE GESTIÓN DE GIMNASIO")
    print("="*50)
    print("1. Gestión de Miembros y Suscripciones")
    print("2. Gestión de Inventario")
    print("3. Control de Entradas/Salidas")
    print("4. Estadísticas")
    print("5. Guardar datos")
    print("0. Salir")
    print("="*50)


def menu_miembros(sistema: SistemaGimnasio):
    """Menú de gestión de miembros"""
    while True:
        print("\n--- GESTIÓN DE MIEMBROS Y SUSCRIPCIONES ---")
        print("1. Agregar nuevo miembro")
        print("2. Listar miembros")
        print("3. Asignar/Renovar suscripción")
        print("4. Ver tipos de suscripción")
        print("0. Volver")
        
        opcion = input("\nSeleccione una opción: ").strip()
        
        if opcion == '1':
            print("\n--- AGREGAR NUEVO MIEMBRO ---")
            nombre = input("Nombre: ").strip()
            apellido = input("Apellido: ").strip()
            telefono = input("Teléfono: ").strip()
            email = input("Email: ").strip()
            sistema.agregar_miembro(nombre, apellido, telefono, email)
        
        elif opcion == '2':
            sistema.listar_miembros()
        
        elif opcion == '3':
            try:
                id_miembro = int(input("ID del miembro: ").strip())
                print("\nTipos de suscripción:")
                for tipo, info in Suscripcion.TIPOS.items():
                    print(f"  {tipo}: {info['duracion']} días - ${info['precio']:.2f}")
                tipo = input("\nTipo de suscripción: ").strip().upper()
                sistema.asignar_suscripcion(id_miembro, tipo)
            except ValueError:
                print("✗ ID inválido")
        
        elif opcion == '4':
            print("\n--- TIPOS DE SUSCRIPCIÓN ---")
            for tipo, info in Suscripcion.TIPOS.items():
                print(f"{tipo:12} | {info['duracion']:3} días | ${info['precio']:6.2f}")
        
        elif opcion == '0':
            break


def menu_inventario(sistema: SistemaGimnasio):
    """Menú de gestión de inventario"""
    while True:
        print("\n--- GESTIÓN DE INVENTARIO ---")
        print("1. Agregar producto")
        print("2. Listar inventario")
        print("3. Agregar stock")
        print("4. Quitar stock")
        print("0. Volver")
        
        opcion = input("\nSeleccione una opción: ").strip()
        
        if opcion == '1':
            print("\n--- AGREGAR PRODUCTO ---")
            nombre = input("Nombre del producto: ").strip()
            categoria = input("Categoría: ").strip()
            try:
                cantidad = int(input("Cantidad inicial: ").strip())
                precio = float(input("Precio: ").strip())
                sistema.agregar_producto(nombre, categoria, cantidad, precio)
            except ValueError:
                print("✗ Cantidad o precio inválidos")
        
        elif opcion == '2':
            sistema.listar_inventario()
        
        elif opcion == '3':
            try:
                id_producto = int(input("ID del producto: ").strip())
                cantidad = int(input("Cantidad a agregar: ").strip())
                sistema.modificar_stock(id_producto, cantidad, 'AGREGAR')
            except ValueError:
                print("✗ Valores inválidos")
        
        elif opcion == '4':
            try:
                id_producto = int(input("ID del producto: ").strip())
                cantidad = int(input("Cantidad a quitar: ").strip())
                sistema.modificar_stock(id_producto, cantidad, 'QUITAR')
            except ValueError:
                print("✗ Valores inválidos")
        
        elif opcion == '0':
            break


def menu_acceso(sistema: SistemaGimnasio):
    """Menú de control de acceso"""
    while True:
        print("\n--- CONTROL DE ENTRADAS/SALIDAS ---")
        print("1. Registrar entrada")
        print("2. Registrar salida")
        print("3. Ver últimos registros")
        print("0. Volver")
        
        opcion = input("\nSeleccione una opción: ").strip()
        
        if opcion == '1':
            try:
                id_miembro = int(input("ID del miembro: ").strip())
                sistema.registrar_entrada(id_miembro)
            except ValueError:
                print("✗ ID inválido")
        
        elif opcion == '2':
            try:
                id_miembro = int(input("ID del miembro: ").strip())
                sistema.registrar_salida(id_miembro)
            except ValueError:
                print("✗ ID inválido")
        
        elif opcion == '3':
            try:
                limite = input("Cantidad de registros a mostrar (Enter para 20): ").strip()
                limite = int(limite) if limite else 20
                sistema.ver_registros_acceso(limite)
            except ValueError:
                print("✗ Valor inválido")
        
        elif opcion == '0':
            break


def main():
    """Función principal"""
    sistema = SistemaGimnasio()
    
    while True:
        mostrar_menu_principal()
        opcion = input("\nSeleccione una opción: ").strip()
        
        if opcion == '1':
            menu_miembros(sistema)
        
        elif opcion == '2':
            menu_inventario(sistema)
        
        elif opcion == '3':
            menu_acceso(sistema)
        
        elif opcion == '4':
            sistema.estadisticas_hoy()
        
        elif opcion == '5':
            sistema.guardar_datos()
        
        elif opcion == '0':
            print("\n¿Desea guardar los datos antes de salir? (s/n): ", end='')
            if input().strip().lower() == 's':
                sistema.guardar_datos()
            print("¡Hasta luego!")
            break
        
        else:
            print("✗ Opción no válida")


if __name__ == "__main__":
    main()
