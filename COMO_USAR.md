# 🌱 Cómo Usar el Identificador de Plantas

## 🚀 Inicio Rápido

### 1. Configurar tu API Key
```bash
# Edita el archivo de configuración
nano camara/config.js

# Reemplaza 'TU_API_KEY_AQUI' con tu API key real de Plant.id
```

### 2. Iniciar el servidor (IMPORTANTE para permisos de cámara)
```bash
# Opción 1: Usar el script automático
./iniciar-servidor.sh

# Opción 2: Manual con Python
cd camara && python3 -m http.server 8000

# Opción 3: Manual con Node.js
npx http-server camara -p 8000 -o
```

### 3. Abrir en el navegador
- **En tu computadora**: http://localhost:8000
- **En otros dispositivos**: http://TU_IP:8000

## 📱 Para dispositivos móviles

1. **Encuentra tu IP local**:
   ```bash
   hostname -I | awk '{print $1}'
   ```

2. **Conecta el móvil a la misma red WiFi**

3. **Abre en el móvil**: `http://TU_IP:8000`

## 🔧 Solución de Problemas

### ❌ "No se puede acceder a la cámara desde archivos locales"
**Solución**: Usa un servidor local (paso 2 arriba)

### ❌ "Se requiere HTTPS para acceder a la cámara"
**Solución**: Usa localhost o un servidor con HTTPS

### ❌ "Permisos denegados"
**Solución**: 
1. Permite la cámara en la configuración del navegador
2. Recarga la página
3. Asegúrate de estar en HTTPS o localhost

### ❌ "No se encontró ninguna cámara"
**Solución**: 
1. Conecta una cámara
2. Cierra otras aplicaciones que usen la cámara
3. Recarga la página

## 🎯 Flujo de Uso

1. **Activar cámara** → Haz clic en "📸 Activar Cámara"
2. **Permitir acceso** → Acepta los permisos cuando te los solicite
3. **Capturar foto** → Posiciona la planta y haz clic en "📸 Capturar Foto"
4. **Ver resultados** → Revisa la información de la planta
5. **Plantar** → Si te gusta, haz clic en "🌱 ¡Plantar esta planta!"
6. **Efecto Pokémon** → Ponle un nombre a tu planta

## 💡 Consejos para Mejores Resultados

- ✅ Usa buena iluminación
- ✅ Enfoca bien la planta
- ✅ Incluye hojas, flores o frutos
- ✅ Evita sombras fuertes
- ✅ Toma la foto de cerca pero sin cortar partes importantes

## 🆘 Si Nada Funciona

1. **Verifica tu API key** en `camara/config.js`
2. **Revisa la consola** del navegador (F12)
3. **Asegúrate de tener créditos** en Plant.id
4. **Prueba en localhost** primero
5. **Usa un navegador moderno** (Chrome, Firefox, Safari)

## 📞 Soporte

Si tienes problemas, revisa:
- La consola del navegador para errores
- Que tu API key sea válida
- Que tengas créditos en Plant.id
- Que estés usando un servidor local (no archivos locales)
