// Configuración de la API (en producción esto debería estar en el backend)
const PLANT_ID_API_KEY = CONFIG.PLANT_ID_API_KEY;
const PLANT_ID_API_URL = CONFIG.PLANT_ID_API_URL;

// Elementos del DOM
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const cameraSection = document.getElementById('cameraSection');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const pokemonModal = document.getElementById('pokemonModal');

// Elementos de resultados
const capturedImage = document.getElementById('capturedImage');
const plantName = document.getElementById('plantName');
const plantScientificName = document.getElementById('plantScientificName');
const plantFamily = document.getElementById('plantFamily');
const plantGenus = document.getElementById('plantGenus');
const plantConfidence = document.getElementById('plantConfidence');
const plantDescription = document.getElementById('plantDescription');
const confidenceBadge = document.getElementById('confidenceBadge');

// Elementos del modal Pokémon
const plantBtn = document.getElementById('plantBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const confirmPlantBtn = document.getElementById('confirmPlantBtn');
const plantNickname = document.getElementById('plantNickname');
const retryBtn = document.getElementById('retryBtn');
const errorMessage = document.getElementById('errorMessage');

// Variables globales
let stream = null;
let currentPlantData = null;
let cameraPermissionGranted = false;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    checkCameraSupport();
    setupEventListeners();
});

// Verificar soporte de cámara
function checkCameraSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Tu navegador no soporta el acceso a la cámara. Por favor, usa un navegador más moderno como Chrome, Firefox o Safari.');
        return;
    }
    
    // Mostrar mensaje de permisos
    showPermissionMessage();
}

// Mostrar mensaje de permisos
function showPermissionMessage() {
    const permissionDiv = document.createElement('div');
    permissionDiv.id = 'permissionMessage';
    permissionDiv.style.cssText = `
        background: linear-gradient(45deg, #FFD54F, #FFF176);
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        border-left: 5px solid #FBC02D;
    `;
    
    permissionDiv.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #E65100;">📷 Permisos de Cámara Requeridos</h3>
        <p style="margin: 0 0 15px 0; color: #BF360C;">
            Para identificar plantas, necesitamos acceso a tu cámara. 
            Haz clic en "Activar Cámara" y permite el acceso cuando tu navegador te lo solicite.
        </p>
        <button id="activateCameraBtn" class="btn btn-primary" style="margin: 0;">
            📸 Activar Cámara
        </button>
    `;
    
    cameraSection.insertBefore(permissionDiv, cameraSection.firstChild);
    
    // Event listener para el botón
    document.getElementById('activateCameraBtn').addEventListener('click', initializeCamera);
}

// Configurar event listeners
function setupEventListeners() {
    captureBtn.addEventListener('click', capturePhoto);
    retakeBtn.addEventListener('click', retakePhoto);
    plantBtn.addEventListener('click', showPokemonModal);
    tryAgainBtn.addEventListener('click', resetToCamera);
    confirmPlantBtn.addEventListener('click', confirmPlanting);
    retryBtn.addEventListener('click', resetToCamera);
}

// Inicializar cámara
async function initializeCamera() {
    try {
        // Mostrar indicador de carga
        const activateBtn = document.getElementById('activateCameraBtn');
        if (activateBtn) {
            activateBtn.textContent = '🔄 Solicitando permisos...';
            activateBtn.disabled = true;
        }
        
        // Solicitar permisos de cámara
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment' // Cámara trasera en móviles
            }
        });
        
        // Configurar video
        video.srcObject = stream;
        video.play();
        
        // Ocultar mensaje de permisos y mostrar controles
        const permissionMessage = document.getElementById('permissionMessage');
        if (permissionMessage) {
            permissionMessage.style.display = 'none';
        }
        
        // Mostrar controles cuando la cámara esté lista
        video.addEventListener('loadedmetadata', () => {
            captureBtn.style.display = 'block';
            cameraPermissionGranted = true;
            
            // Mostrar mensaje de éxito
            showSuccessMessage('¡Cámara activada! Ahora puedes capturar fotos de plantas.');
        });
        
        // Manejar errores de video
        video.addEventListener('error', (e) => {
            console.error('Error en el video:', e);
            showError('Error al inicializar la cámara. Por favor, recarga la página.');
        });
        
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        
        // Restaurar botón
        const activateBtn = document.getElementById('activateCameraBtn');
        if (activateBtn) {
            activateBtn.textContent = '📸 Activar Cámara';
            activateBtn.disabled = false;
        }
        
        // Mostrar error específico según el tipo
        if (error.name === 'NotAllowedError') {
            showError('❌ Permisos denegados. Por favor, permite el acceso a la cámara en la configuración de tu navegador y recarga la página.');
        } else if (error.name === 'NotFoundError') {
            showError('❌ No se encontró ninguna cámara. Por favor, conecta una cámara y recarga la página.');
        } else if (error.name === 'NotReadableError') {
            showError('❌ La cámara está siendo usada por otra aplicación. Por favor, cierra otras aplicaciones que usen la cámara y recarga la página.');
        } else {
            showError('❌ Error al acceder a la cámara: ' + error.message + '. Por favor, recarga la página.');
        }
    }
}

// Mostrar mensaje de éxito
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        background: linear-gradient(45deg, #4CAF50, #8BC34A);
        color: white;
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
        text-align: center;
        font-weight: 600;
        animation: slideDown 0.5s ease;
    `;
    
    successDiv.textContent = message;
    cameraSection.insertBefore(successDiv, cameraSection.firstChild);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Capturar foto
function capturePhoto() {
    if (!cameraPermissionGranted || !stream) {
        showError('La cámara no está disponible. Por favor, activa la cámara primero.');
        return;
    }
    
    const context = canvas.getContext('2d');
    
    // Configurar canvas con las dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir a blob para enviar a la API
    canvas.toBlob(async (blob) => {
        if (blob) {
            // Mostrar la imagen capturada
            const imageUrl = URL.createObjectURL(blob);
            capturedImage.src = imageUrl;
            
            // Cambiar a vista de carga
            showLoading();
            
            // Identificar la planta
            try {
                const plantData = await identifyPlant(blob);
                currentPlantData = plantData;
                showResults(plantData);
            } catch (error) {
                console.error('Error en la identificación:', error);
                showError('Error al identificar la planta. Por favor, intenta con otra foto.');
            }
        }
    }, 'image/jpeg', 0.8);
}

// Identificar planta usando Plant.id API
async function identifyPlant(imageBlob) {
    const formData = new FormData();
    formData.append('images', imageBlob);
    formData.append('modifiers', JSON.stringify(CONFIG.API_CONFIG.modifiers));
    formData.append('plant_language', CONFIG.API_CONFIG.plant_language);
    formData.append('plant_details', JSON.stringify(CONFIG.API_CONFIG.plant_details));

    const response = await fetch(PLANT_ID_API_URL, {
        method: 'POST',
        headers: {
            'Api-Key': PLANT_ID_API_KEY,
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Error de API: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.suggestions || data.suggestions.length === 0) {
        throw new Error('No se pudo identificar la planta');
    }

    return data.suggestions[0]; // Devolver la primera sugerencia (más confiable)
}

// Mostrar sección de carga
function showLoading() {
    hideAllSections();
    loadingSection.style.display = 'block';
}

// Mostrar resultados
function showResults(plantData) {
    hideAllSections();
    resultsSection.style.display = 'block';
    
    // Llenar datos de la planta
    const confidence = Math.round(plantData.probability * 100);
    
    plantName.textContent = plantData.plant_name || 'Planta no identificada';
    plantScientificName.textContent = plantData.scientific_name || 'Nombre científico no disponible';
    plantFamily.textContent = plantData.plant_details?.taxonomy?.family || 'No disponible';
    plantGenus.textContent = plantData.plant_details?.taxonomy?.genus || 'No disponible';
    plantConfidence.textContent = `${confidence}%`;
    confidenceBadge.textContent = `${confidence}%`;
    
    // Descripción de la planta
    const description = plantData.plant_details?.wiki_description?.value || 
                       'No hay descripción disponible para esta planta.';
    plantDescription.textContent = description;
    
    // Color del badge de confianza
    if (confidence >= 80) {
        confidenceBadge.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
    } else if (confidence >= 60) {
        confidenceBadge.style.background = 'linear-gradient(45deg, #FF9800, #FFC107)';
    } else {
        confidenceBadge.style.background = 'linear-gradient(45deg, #F44336, #E91E63)';
    }
}

// Mostrar modal Pokémon
function showPokemonModal() {
    pokemonModal.style.display = 'flex';
    
    // Limpiar input
    plantNickname.value = '';
    
    // Efecto de animación
    setTimeout(() => {
        const pokeball = document.querySelector('.pokeball');
        pokeball.style.animation = 'bounce 0.6s ease-in-out';
    }, 100);
}

// Confirmar plantación
function confirmPlanting() {
    const nickname = plantNickname.value.trim();
    
    if (!nickname) {
        alert('Por favor, ingresa un nombre para tu planta');
        return;
    }
    
    // Aquí guardarías la planta en tu base de datos
    const plantToSave = {
        ...currentPlantData,
        nickname: nickname,
        datePlanted: new Date().toISOString(),
        id: Date.now() // ID único simple
    };
    
    // Simular guardado (en producción esto sería una llamada al backend)
    console.log('Planta guardada:', plantToSave);
    
    // Mostrar mensaje de éxito
    alert(`¡Felicidades! Has plantado "${nickname}" exitosamente.`);
    
    // Cerrar modal y volver a la cámara
    pokemonModal.style.display = 'none';
    resetToCamera();
}

// Tomar otra foto
function retakePhoto() {
    resetToCamera();
}

// Volver a la cámara
function resetToCamera() {
    hideAllSections();
    cameraSection.style.display = 'block';
    
    // Limpiar datos
    currentPlantData = null;
    capturedImage.src = '';
    
    // Mostrar botón de captura si la cámara está activa
    if (cameraPermissionGranted) {
        captureBtn.style.display = 'block';
        retakeBtn.style.display = 'none';
    }
}

// Mostrar error
function showError(message) {
    hideAllSections();
    errorSection.style.display = 'block';
    errorMessage.textContent = message;
}

// Ocultar todas las secciones
function hideAllSections() {
    cameraSection.style.display = 'none';
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    pokemonModal.style.display = 'none';
}

// Limpiar recursos al cerrar la página
window.addEventListener('beforeunload', function() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

// Función para simular identificación (para testing sin API key)
async function simulatePlantIdentification() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                plant_name: "Rosa",
                scientific_name: "Rosa rubiginosa",
                probability: 0.89,
                plant_details: {
                    taxonomy: {
                        family: "Rosaceae",
                        genus: "Rosa"
                    },
                    wiki_description: {
                        value: "La rosa es una de las flores más populares y hermosas del mundo. Conocida por su fragancia característica y sus pétalos suaves, ha sido símbolo de amor y belleza durante siglos."
                    }
                }
            });
        }, 2000);
    });
}

// Función para usar simulación en lugar de la API real
async function identifyPlantSimulated(imageBlob) {
    console.log('Usando simulación de identificación (para testing)');
    return await simulatePlantIdentification();
}

// Cambiar entre API real y simulación
// Para usar la simulación, cambia esta línea:
// const identifyPlant = identifyPlantSimulated;
