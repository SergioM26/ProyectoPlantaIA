#!/bin/bash

# Script para iniciar servidor local para la aplicación de identificación de plantas
# Esto resuelve el problema de permisos de cámara en otros dispositivos

echo "🌱 Iniciando servidor para Identificador de Plantas..."
echo ""

# Verificar si Python está disponible
if command -v python3 &> /dev/null; then
    echo "✅ Python3 encontrado"
    echo "🚀 Iniciando servidor en puerto 8000..."
    echo ""
    echo "📱 Para acceder desde otros dispositivos:"
    echo "   1. Encuentra tu IP: hostname -I | awk '{print \$1}'"
    echo "   2. Usa: http://TU_IP:8000"
    echo ""
    echo "💻 Para acceder desde esta computadora:"
    echo "   http://localhost:8000"
    echo ""
    echo "⏹️  Presiona Ctrl+C para detener el servidor"
    echo ""
    
    # Obtener IP local
    IP=$(hostname -I | awk '{print $1}')
    echo "🌐 Tu IP local es: $IP"
    echo "📱 URL para móviles: http://$IP:8000"
    echo ""
    
    # Iniciar servidor
    cd camara
    python3 -m http.server 8000
    
elif command -v python &> /dev/null; then
    echo "✅ Python encontrado"
    echo "🚀 Iniciando servidor en puerto 8000..."
    cd camara
    python -m http.server 8000
    
else
    echo "❌ Python no encontrado"
    echo "💡 Instalando servidor alternativo..."
    
    # Intentar con Node.js
    if command -v node &> /dev/null; then
        echo "✅ Node.js encontrado"
        echo "🚀 Iniciando servidor con npx..."
        cd camara
        npx http-server -p 8000 -o
    else
        echo "❌ Ni Python ni Node.js están disponibles"
        echo "💡 Por favor instala Python o Node.js"
        echo "   - Python: sudo apt install python3"
        echo "   - Node.js: https://nodejs.org/"
        exit 1
    fi
fi
