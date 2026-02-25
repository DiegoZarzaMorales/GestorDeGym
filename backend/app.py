"""
Aplicación Flask - Backend del sistema de gimnasio
"""

from flask import Flask, render_template
from flask_cors import CORS
from backend.routes import api


def create_app():
    """Crear y configurar la aplicación Flask"""
    app = Flask(__name__, 
                template_folder='../frontend/templates',
                static_folder='../frontend/static')
    
    # Configuración
    app.config['SECRET_KEY'] = 'tu_clave_secreta_aqui_12345'
    app.config['JSON_AS_ASCII'] = False
    
    # Habilitar CORS para permitir peticiones desde el frontend
    CORS(app)
    
    # Registrar blueprints
    app.register_blueprint(api)
    
    # Ruta principal - Panel de Administrador
    @app.route('/')
    def index():
        return render_template('index.html')
    
    # Ruta de Terminal de Acceso - Para usuarios
    @app.route('/terminal')
    def terminal():
        return render_template('terminal.html')
    
    # Ruta de Terminal de Ventas - Para punto de venta
    @app.route('/ventas')
    def ventas():
        return render_template('terminal-ventas.html')

    # Ruta de Portal Cliente - Para socios del gym
    @app.route('/cliente')
    def cliente():
        return render_template('cliente.html')
    
    return app
