"""
Archivo principal para ejecutar el sistema de gestión de gimnasio
"""

from backend.app import create_app

if __name__ == '__main__':
    app = create_app()
    print("\n" + "="*60)
    print("🏋️  SISTEMA DE GESTIÓN DE GIMNASIO - STRONKSYSTEM")
    print("="*60)
    print("\n✓ Servidor iniciado correctamente")
    print("\n📍 Accede a la aplicación en: http://localhost:5000")
    print("\n⚠️  Presiona Ctrl+C para detener el servidor\n")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
