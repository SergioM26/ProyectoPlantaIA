// Función mejorada para identificar plantas con mejor manejo de errores
async function identifyPlant(imageBlob) {
    console.log('Iniciando identificación de planta...');
    console.log('API Key:', CONFIG.PLANT_ID_API_KEY.substring(0, 10) + '...');
    console.log('API URL:', CONFIG.PLANT_ID_API_URL);
    
    // Si está en modo demo, usar simulación
    if (CONFIG.PLANT_ID_API_KEY === 'DEMO_MODE') {
        console.log('Usando modo demo');
        return await identifyPlantSimulated(imageBlob);
    }
    
    try {
        const formData = new FormData();
        formData.append('images', imageBlob);
        formData.append('modifiers', JSON.stringify(CONFIG.API_CONFIG.modifiers));
        formData.append('plant_language', CONFIG.API_CONFIG.plant_language);
        formData.append('plant_details', JSON.stringify(CONFIG.API_CONFIG.plant_details));

        console.log('Enviando solicitud a la API...');
        
        const response = await fetch(CONFIG.PLANT_ID_API_URL, {
            method: 'POST',
            headers: {
                'Api-Key': CONFIG.PLANT_ID_API_KEY,
            },
            body: formData
        });

        console.log('Respuesta recibida:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error de API:', response.status, errorText);
            
            if (response.status === 401) {
                throw new Error('API key inválida. Por favor, verifica tu API key en config.js');
            } else if (response.status === 403) {
                throw new Error('Acceso denegado. Verifica que tu API key tenga créditos disponibles');
            } else if (response.status === 404) {
                throw new Error('Endpoint no encontrado. La URL de la API puede estar incorrecta');
            } else if (response.status === 429) {
                throw new Error('Límite de solicitudes excedido. Intenta más tarde');
            } else {
                throw new Error(`Error de API: ${response.status} - ${errorText}`);
            }
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (!data.suggestions || data.suggestions.length === 0) {
            throw new Error('No se pudo identificar la planta. Intenta con otra foto o mejor iluminación');
        }

        return data.suggestions[0]; // Devolver la primera sugerencia (más confiable)
        
    } catch (error) {
        console.error('Error en identificación:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Error de conexión. Verifica tu conexión a internet');
        }
        
        throw error;
    }
}
