# �� Solución de Permisos de Cámara

## 🚨 Problema
Los permisos de cámara no funcionan en otros dispositivos porque:
1. **HTTPS requerido**: Los navegadores modernos requieren HTTPS para acceder a la cámara
2. **Dominio local**: `file://` no tiene permisos de cámara
3. **Políticas de seguridad**: Los navegadores bloquean cámara en sitios no seguros

## ✅ Soluciones

### Opción 1: Servidor Local (Recomendado)
```bash
# Instalar servidor local simple
npm install -g http-server

# O usar Python
python3 -m http.server 8000

# O usar PHP
php -S localhost:8000
```

### Opción 2: Usar ngrok para HTTPS
```bash
# Instalar ngrok
# Descargar de https://ngrok.com/

# Crear túnel HTTPS
ngrok http 8000
```

### Opción 3: Subir a GitHub Pages
1. Subir proyecto a GitHub
2. Activar GitHub Pages
3. Usar la URL HTTPS generada

## 🔧 Implementación Rápida

### Con Python (más fácil):
```bash
cd camara
python3 -m http.server 8000
# Luego ir a: http://localhost:8000
```

### Con Node.js:
```bash
npx http-server camara -p 8000 -o
```

## 📱 Para dispositivos móviles:
1. Encuentra tu IP local: `ip addr show` o `ifconfig`
2. Usa: `http://TU_IP:8000` en el móvil
3. Asegúrate de estar en la misma red WiFi

## 🛠️ Script de inicio automático
