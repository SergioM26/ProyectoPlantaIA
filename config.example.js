// Archivo de configuración de ejemplo
// Copia este archivo como config.js y agrega tu API key real

const CONFIG = {
    // Reemplaza con tu API key real de Plant.id
    PLANT_ID_API_KEY: 'TU_API_KEY_AQUI',
    
    // URL de la API de Plant.id
    PLANT_ID_API_URL: 'https://api.plant.id/v3/identify',
    
    // Configuración de la cámara
    CAMERA_CONFIG: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment'
    },
    
    // Configuración de la API
    API_CONFIG: {
        modifiers: ['crops_fast', 'similar_images'],
        plant_language: 'es',
        plant_details: [
            'common_names',
            'url',
            'name_authority',
            'wiki_description',
            'taxonomy',
            'synonyms'
        ]
    }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
