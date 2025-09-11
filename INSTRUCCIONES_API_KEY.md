# 🔑 Configuración de API Key - Plant.id

## Pasos para configurar tu API key:

### 1. Obtener tu API Key
1. Ve a [Plant.id](https://web.plant.id/)
2. Regístrate o inicia sesión
3. Ve al panel de administración
4. Copia tu API key

### 2. Configurar en el proyecto

**Opción A: Editar directamente**
```bash
# Edita el archivo config.js
nano camara/config.js
```

**Opción B: Usar el comando sed**
```bash
# Reemplaza TU_API_KEY_AQUI con tu API key real
sed -i 's/TU_API_KEY_AQUI/tu_api_key_real_aqui/g' camara/config.js
```

### 3. Verificar la configuración

El archivo `camara/config.js` debe verse así:
```javascript
const CONFIG = {
    PLANT_ID_API_KEY: 'tu_api_key_real_aqui', // ← Tu API key aquí
    PLANT_ID_API_URL: 'https://api.plant.id/v3/identify',
    // ... resto de la configuración
};
```

### 4. Probar la aplicación

1. Abre `camara/index.html` en tu navegador
2. Permite el acceso a la cámara cuando te lo solicite
3. Toma una foto de una planta
4. ¡Debería identificar la planta correctamente!

## 🔒 Seguridad

- ✅ El archivo `config.js` está en `.gitignore`
- ✅ Tu API key no se subirá a Git
- ✅ Solo tú puedes ver tu API key

## 🐛 Si no funciona

1. **Verifica tu API key**: Asegúrate de que sea correcta
2. **Revisa la consola**: Abre las herramientas de desarrollador (F12)
3. **Verifica créditos**: Asegúrate de tener créditos en Plant.id
4. **Prueba la conexión**: Verifica que tengas internet

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador para errores
2. Verifica que tu API key sea válida
3. Asegúrate de tener créditos en Plant.id
