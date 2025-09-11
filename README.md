# 🌱 Identificador de Plantas - Cámara

Una aplicación web que utiliza la cámara del dispositivo para identificar plantas usando la API de Plant.id.

## 🚀 Características

- **Captura de fotos**: Utiliza la cámara del dispositivo para tomar fotos de plantas
- **Identificación automática**: Integración con Plant.id API para identificar especies
- **Información detallada**: Muestra nombre común, científico, familia, género y descripción
- **Efecto Pokémon**: Animación especial cuando decides "plantar" una planta
- **Diseño responsivo**: Funciona en dispositivos móviles y desktop
- **Paleta de colores natural**: Verde, amarillo semilla, marrón tierra y beige

## 🎨 Paleta de Colores

- **Verde natural**: #388E3C
- **Verde claro**: #81C784
- **Amarillo semilla**: #FBC02D
- **Marrón claro tierra**: #A1887F
- **Beige suave**: #FFF8E1

## 📋 Requisitos

1. **API Key de Plant.id**: Necesitas registrarte en [Plant.id](https://web.plant.id/) y obtener una API key
2. **Navegador moderno**: Con soporte para getUserMedia (cámara)
3. **Conexión a internet**: Para acceder a la API de Plant.id

## ⚙️ Configuración

### 1. Obtener API Key

1. Ve a [Plant.id](https://web.plant.id/)
2. Regístrate para obtener una cuenta
3. Obtén tu API key desde el panel de administración

### 2. Configurar la API Key

**IMPORTANTE**: El archivo `config.js` está protegido por `.gitignore` para mantener tu API key segura.

1. Copia el archivo de ejemplo:
   ```bash
   cp config.example.js config.js
   ```

2. Edita `config.js` y reemplaza `TU_API_KEY_AQUI` con tu API key real:
   ```javascript
   const CONFIG = {
       PLANT_ID_API_KEY: 'tu_api_key_real_aqui',
       // ... resto de la configuración
   };
   ```

### 3. Ejecutar la aplicación

Simplemente abre `index.html` en tu navegador web.

## 🔧 Uso

1. **Permitir acceso a la cámara**: El navegador te pedirá permiso para usar la cámara
2. **Posicionar la planta**: Coloca la planta dentro del marco circular
3. **Capturar foto**: Haz clic en "📸 Capturar Foto"
4. **Esperar identificación**: La app identificará la planta automáticamente
5. **Ver resultados**: Revisa la información de la planta identificada
6. **Plantar**: Si quieres agregar la planta a tu colección, haz clic en "🌱 ¡Plantar esta planta!"
7. **Efecto Pokémon**: Disfruta de la animación especial y ponle un nombre a tu planta

## 🛡️ Seguridad

**IMPORTANTE**: Por seguridad, la API key está protegida:

1. **Archivo protegido**: `config.js` está en `.gitignore`
2. **Archivo de ejemplo**: `config.example.js` se puede subir a Git sin problemas
3. **No exponer claves**: Nunca subas tu API key real a repositorios públicos

### Para una implementación en producción:

1. **Backend Proxy**: Crea un backend que maneje las llamadas a la API
2. **Variables de entorno**: Usa variables de entorno para la API key
3. **Autenticación**: Implementa autenticación de usuarios

## 📱 Funcionalidades

### Cámara
- Acceso a cámara trasera en dispositivos móviles
- Marco de enfoque visual
- Captura de alta calidad

### Identificación
- Integración con Plant.id API
- Información taxonómica completa
- Nivel de confianza de la identificación
- Descripción de la planta

### Interfaz
- Diseño responsivo
- Animaciones suaves
- Efectos visuales atractivos
- Modal de "captura Pokémon"

## 🐛 Solución de Problemas

### Error de cámara
- Asegúrate de permitir el acceso a la cámara
- Verifica que tu navegador soporte getUserMedia
- Prueba en HTTPS (algunos navegadores requieren conexión segura)

### Error de API
- Verifica que tu API key sea correcta en `config.js`
- Asegúrate de tener créditos disponibles en Plant.id
- Revisa la consola del navegador para errores específicos

### Problemas de identificación
- Toma fotos con buena iluminación
- Enfoca bien la planta
- Incluye características distintivas (hojas, flores, etc.)

## 🔄 Modo de Prueba

Para probar la aplicación sin API key, puedes usar el modo de simulación:

1. Abre `script.js`
2. Descomenta la línea: `const identifyPlant = identifyPlantSimulated;`
3. Comenta la función original: `// async function identifyPlant(imageBlob)`

## 📄 Estructura de Archivos

```
camara/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── config.js           # Configuración de la API (PROTEGIDO)
├── config.example.js   # Archivo de ejemplo para configuración
├── .gitignore          # Archivos a ignorar en Git
└── README.md           # Este archivo
```

## 🚀 Instalación Rápida

1. Clona o descarga el proyecto
2. Copia `config.example.js` a `config.js`
3. Edita `config.js` con tu API key
4. Abre `index.html` en tu navegador

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

## 🙏 Agradecimientos

- [Plant.id](https://web.plant.id/) por la API de identificación de plantas
- Comunidad de desarrolladores web por las inspiraciones de diseño
