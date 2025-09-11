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
let availableCameras = [];
let selectedCameraId = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    checkEnvironment();
    checkCameraSupport();
    setupEventListeners();
});

// Verificar el entorno (HTTPS, localhost, etc.)
function checkEnvironment() {
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const isHTTPS = location.protocol === 'https:';
    const isFile = location.protocol === 'file:';
    
    if (isFile) {
        showEnvironmentError('file');
        return;
    }
    
    if (!isHTTPS && !isLocalhost) {
        showEnvironmentError('https');
        return;
    }
    
    if (!isLocalhost && !isHTTPS) {
        showEnvironmentError('https');
        return;
    }
}

// Mostrar error de entorno
function showEnvironmentError(type) {
    let message = '';
    let instructions = '';
    
    if (type === 'file') {
        message = '❌ No se puede acceder a la cámara desde archivos locales';
        instructions = `
            <div style="background: #FFF3CD; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FFC107;">
                <h3 style="margin: 0 0 15px 0; color: #856404;">🔧 Solución Rápida:</h3>
                <p><strong>Opción 1 - Servidor Python:</strong></p>
                <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 5px; display: block; margin: 10px 0;">
                    cd camara && python3 -m http.server 8000
                </code>
                <p>Luego ve a: <strong>http://localhost:8000</strong></p>
                
                <p><strong>Opción 2 - Servidor Node.js:</strong></p>
                <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 5px; display: block; margin: 10px 0;">
                    npx http-server camara -p 8000 -o
                </code>
                
                <p><strong>Opción 3 - Usar el script automático:</strong></p>
                <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 5px; display: block; margin: 10px 0;">
                    ./iniciar-servidor.sh
                </code>
            </div>
        `;
    } else if (type === 'https') {
        message = '❌ Se requiere HTTPS para acceder a la cámara';
        instructions = `
            <div style="background: #F8D7DA; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #DC3545;">
                <h3 style="margin: 0 0 15px 0; color: #721C24;">🔒 Solución HTTPS:</h3>
                <p><strong>Para desarrollo local:</strong></p>
                <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 5px; display: block; margin: 10px 0;">
                    cd camara && python3 -m http.server 8000
                </code>
                <p>Luego ve a: <strong>http://localhost:8000</strong></p>
                
                <p><strong>Para compartir con otros dispositivos:</strong></p>
                <p>1. Usa ngrok: <code>ngrok http 8000</code></p>
                <p>2. O sube a GitHub Pages</p>
                <p>3. O usa un servidor con certificado SSL</p>
            </div>
        `;
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        margin: 20px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    `;
    
    errorDiv.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 20px;">📷</div>
        <h2 style="color: #DC3545; margin-bottom: 20px;">${message}</h2>
        ${instructions}
        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">
            🔄 Recargar Página
        </button>
    `;
    
    document.body.innerHTML = '';
    document.body.appendChild(errorDiv);
}

// Verificar soporte de cámara
function checkCameraSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Tu navegador no soporta el acceso a la cámara. Por favor, usa un navegador más moderno como Chrome, Firefox o Safari.');
        return;
    }
    
    // Mostrar mensaje de permisos y obtener cámaras
    showPermissionMessage();
    getAvailableCameras();
}

// Obtener cámaras disponibles
async function getAvailableCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameras = devices.filter(device => device.kind === 'videoinput');
        
        if (availableCameras.length === 0) {
            showError('No se encontraron cámaras en tu dispositivo.');
            return;
        }
        
        // Mostrar selector de cámaras
        showCameraSelector();
        
    } catch (error) {
        console.error('Error al obtener cámaras:', error);
        showError('Error al detectar las cámaras disponibles.');
    }
}

// Mostrar selector de cámaras
function showCameraSelector() {
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
    
    let cameraOptions = '';
    availableCameras.forEach((camera, index) => {
        const label = camera.label || `Cámara ${index + 1}`;
        const isBackCamera = camera.label.toLowerCase().includes('back') || 
                           camera.label.toLowerCase().includes('rear') ||
                           camera.label.toLowerCase().includes('trasera');
        const isFrontCamera = camera.label.toLowerCase().includes('front') || 
                            camera.label.toLowerCase().includes('user') ||
                            camera.label.toLowerCase().includes('frontal');
        
        let icon = '📷';
        if (isBackCamera) icon = '📱';
        else if (isFrontCamera) icon = '��';
        
        cameraOptions += `
            <div class="camera-option" data-device-id="${camera.deviceId}" style="
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            " onmouseover="this.style.borderColor='#388E3C'; this.style.transform='translateY(-2px)'" 
               onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)'">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2rem;">${icon}</span>
                    <div style="text-align: left; flex: 1;">
                        <div style="font-weight: 600; color: #388E3C; margin-bottom: 5px;">${label}</div>
                        <div style="font-size: 0.9rem; color: #666;">
                            ${isBackCamera ? 'Cámara trasera (recomendada para plantas)' : 
                              isFrontCamera ? 'Cámara frontal' : 'Cámara externa'}
                        </div>
                    </div>
                    <div style="color: #4CAF50; font-size: 1.2rem;">✓</div>
                </div>
            </div>
        `;
    });
    
    permissionDiv.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #E65100;">📷 Selecciona tu Cámara</h3>
        <p style="margin: 0 0 15px 0; color: #BF360C;">
            Elige la cámara que quieres usar para identificar plantas. 
            La cámara trasera suele dar mejores resultados.
        </p>
        
        <div style="background: #FFF8E1; padding: 15px; border-radius: 10px; margin: 15px 0; text-align: left;">
            <strong>💡 Consejos para mejores resultados:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Usa la cámara trasera para mejor calidad</li>
                <li>Usa buena iluminación</li>
                <li>Enfoca bien la planta</li>
                <li>Incluye hojas, flores o frutos</li>
            </ul>
        </div>
        
        <div id="cameraList" style="max-height: 300px; overflow-y: auto; margin: 20px 0;">
            ${cameraOptions}
        </div>
        
        <button id="activateCameraBtn" class="btn btn-primary pulse" style="margin: 0; display: none;">
            📸 Activar Cámara Seleccionada
        </button>
    `;
    
    cameraSection.insertBefore(permissionDiv, cameraSection.firstChild);
    
    // Event listeners para las opciones de cámara
    document.querySelectorAll('.camera-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remover selección anterior
            document.querySelectorAll('.camera-option').forEach(opt => {
                opt.style.background = 'white';
                opt.style.borderColor = 'transparent';
            });
            
            // Seleccionar esta opción
            this.style.background = '#E8F5E8';
            this.style.borderColor = '#388E3C';
            
            selectedCameraId = this.dataset.deviceId;
            
            // Mostrar botón de activar
            document.getElementById('activateCameraBtn').style.display = 'block';
        });
    });
    
    // Event listener para el botón
    document.getElementById('activateCameraBtn').addEventListener('click', initializeCamera);
}

// Mostrar mensaje de permisos (versión simple para cuando no hay múltiples cámaras)
function showPermissionMessage() {
    // Solo se ejecuta si no hay cámaras múltiples
    if (availableCameras.length > 0) return;
    
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
        <div style="background: #FFF8E1; padding: 15px; border-radius: 10px; margin: 15px 0; text-align: left;">
            <strong>💡 Consejos para mejores resultados:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Usa buena iluminación</li>
                <li>Enfoca bien la planta</li>
                <li>Incluye hojas, flores o frutos</li>
                <li>Evita sombras fuertes</li>
            </ul>
        </div>
        <button id="activateCameraBtn" class="btn btn-primary pulse" style="margin: 0;">
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
        
        // Configuración de cámara
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment' // Cámara trasera por defecto
            }
        };
        
        // Si se seleccionó una cámara específica, usarla
        if (selectedCameraId) {
            constraints.video.deviceId = { exact: selectedCameraId };
        }
        
        // Solicitar permisos de cámara
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
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
            showSuccessMessage('✅ ¡Cámara activada! Ahora puedes capturar fotos de plantas.');
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
        } else if (error.name === 'OverconstrainedError') {
            showError('❌ La cámara no puede cumplir con los requisitos. Por favor, intenta con otra cámara o recarga la página.');
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
    console.log("Iniciando identificación de planta...");
    console.log("API Key:", CONFIG.PLANT_ID_API_KEY.substring(0, 10) + "...");
    console.log("API URL:", CONFIG.PLANT_ID_API_URL);
    
    // Si está en modo demo, usar simulación
    if (CONFIG.PLANT_ID_API_KEY === "DEMO_MODE") {
        console.log("Usando modo demo");
        return await identifyPlantSimulated(imageBlob);
    }
    
    try {
        const formData = new FormData();
        formData.append("images", imageBlob);
        formData.append("modifiers", JSON.stringify(CONFIG.API_CONFIG.modifiers));
        formData.append("plant_language", CONFIG.API_CONFIG.plant_language);
        formData.append("plant_details", JSON.stringify(CONFIG.API_CONFIG.plant_details));

        console.log("Enviando solicitud a la API...");
        
        const response = await fetch(CONFIG.PLANT_ID_API_URL, {
            method: "POST",
            headers: {
                "Api-Key": CONFIG.PLANT_ID_API_KEY,
            },
            body: formData
        });

        console.log("Respuesta recibida:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error de API:", response.status, errorText);
            
            if (response.status === 401) {
                throw new Error("API key inválida. Por favor, verifica tu API key en config.js");
            } else if (response.status === 403) {
                throw new Error("Acceso denegado. Verifica que tu API key tenga créditos disponibles");
            } else if (response.status === 404) {
                throw new Error("Endpoint no encontrado. La URL de la API puede estar incorrecta");
            } else if (response.status === 429) {
                throw new Error("Límite de solicitudes excedido. Intenta más tarde");
            } else {
                throw new Error(`Error de API: ${response.status} - ${errorText}`);
            }
        }

        const data = await response.json();
        console.log("Datos recibidos:", data);
        
        if (!data.suggestions || data.suggestions.length === 0) {
            throw new Error("No se pudo identificar la planta. Intenta con otra foto o mejor iluminación");
        }

        return data.suggestions[0]; // Devolver la primera sugerencia (más confiable)
        
    } catch (error) {
        console.error("Error en identificación:", error);
        
        if (error.name === "TypeError" && error.message.includes("fetch")) {
            throw new Error("Error de conexión. Verifica tu conexión a internet");
        }
        
        throw error;
    }
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
async function identifyPlantSimulated(imageBlob) {
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
