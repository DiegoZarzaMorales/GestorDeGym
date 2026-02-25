"""
Archivo principal para ejecutar el sistema de gestión de gimnasio
"""

import os

from backend.app import create_app

if __name__ == '__main__':
    app = create_app()
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', '5000'))
    debug = os.getenv('DEBUG', 'true').lower() in ('1', 'true', 'yes', 'on')

    local_url = f"http://localhost:{port}"
    network_url = f"http://127.0.0.1:{port}" if host in ('127.0.0.1', 'localhost') else f"http://{host}:{port}"

    print("\n" + "="*60)
    print("🏋️  SISTEMA DE GESTIÓN DE GIMNASIO - STRONKSYSTEM")
    print("="*60)
    print("\n✓ Servidor iniciado correctamente")
    print(f"\n📍 URL local: {local_url}")
    print(f"📍 URL host:  {network_url}")
    print("\n⚠️  Presiona Ctrl+C para detener el servidor\n")
    print("="*60 + "\n")

    app.run(debug=debug, host=host, port=port)
