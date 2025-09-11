// Datos de la aplicación
let currentUser = 'Usuario'; // Por defecto, se puede cambiar
let plants = []; // Array para almacenar las plantas
let hasLeak = false; // Estado de fuga

// Contenedores de agua
let waterContainers = [
    {
        id: 1,
        name: 'Tanque Principal',
        height: 50, // Altura del tanque en cm
        width: 30, // Ancho del tanque en cm
        length: 40, // Largo del tanque en cm
        sensorData: {
            waterHeight: 37.5, // Altura del agua en cm
            lastUpdate: new Date().toISOString()
        },
        waterLevel: 75 // Nivel calculado (porcentaje)
    }
];

// Elementos del DOM
let currentTab = 'plants';
let modal = null;

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserData();
});

function initializeApp() {
    // Crear elementos del DOM
    createAppStructure();
    
    // Mostrar pestaña inicial
    showTab('plants');
    
    // Validar y ajustar datos del sensor de todos los contenedores
    waterContainers.forEach(container => {
        validateContainerSensorData(container);
    });
    
    // Actualizar nivel de agua
    updateWaterLevel();
    
    // Verificar fuga
    checkLeak();
}

function createAppStructure() {
    const container = document.querySelector('.container');
    
    // Header con bienvenida
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
        <h1>🌱 Mi Jardín Inteligente</h1>
        <div class="user-name">Bienvenido ${currentUser}</div>
    `;
    
    // Navegación por pestañas
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    tabs.innerHTML = `
        <button class="tab active" data-tab="plants">🌿 Mis Plantas</button>
        <button class="tab" data-tab="water">💧 Mi Agua</button>
    `;
    
    // Contenido de las pestañas
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content active';
    tabContent.id = 'plants-content';
    tabContent.innerHTML = createPlantsContent();
    
    const waterContent = document.createElement('div');
    waterContent.className = 'tab-content';
    waterContent.id = 'water-content';
    waterContent.innerHTML = createWaterContent();
    
    // Limpiar contenedor y agregar elementos
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(tabs);
    container.appendChild(tabContent);
    container.appendChild(waterContent);
    
    // Crear modal
    createModal();
}

function createPlantsContent() {
    return `
        <div class="plants-grid" id="plants-grid">
            ${plants.length === 0 ? '<p style="grid-column: 1/-1; text-align: center; color: var(--texto-claro); padding: 40px;">No tienes plantas registradas aún</p>' : ''}
        </div>
        <button class="add-plant-btn" onclick="openAddPlantModal()">
            ➕ Agregar Nueva Planta
        </button>
    `;
}

function createWaterContent() {
    return `
        <div class="water-containers-grid">
            ${waterContainers.map(container => createContainerCard(container)).join('')}
        </div>
        
        <div class="container-actions">
            <button class="add-container-btn" onclick="openAddContainerModal()">
                ➕ Agregar Nuevo Contenedor
            </button>
        </div>
        
        <div class="leak-alert" id="leak-alert">
            <div class="alert-icon">⚠️</div>
            <div>¡Alerta! Posible fuga detectada</div>
        </div>
    `;
}

function createContainerCard(container) {
    const waterInfo = calculateContainerWaterLevel(container);
    
    return `
        <div class="water-container-card" data-container-id="${container.id}">
            <div class="container-header">
                <h3>💧 ${container.name}</h3>
                <div class="container-actions">
                    <button class="action-btn edit-btn" onclick="editContainer(${container.id})" title="Editar contenedor">
                        ✏️
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteContainer(${container.id})" title="Eliminar contenedor">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="sensor-status">
                <span class="sensor-indicator ${container.sensorData.lastUpdate ? 'active' : 'inactive'}"></span>
                <span class="sensor-text">Sensor ${container.sensorData.lastUpdate ? 'Conectado' : 'Desconectado'}</span>
            </div>
            
            <div class="water-tank">
                <div class="water-level" id="water-level-${container.id}" style="height: ${waterInfo.percentage}%"></div>
                <div class="water-percentage" id="water-percentage-${container.id}">${waterInfo.percentage}%</div>
            </div>
            
            <div class="water-details">
                <div class="detail-item">
                    <span class="detail-label">Volumen:</span>
                    <span class="detail-value" id="water-volume-${container.id}">${Math.round(waterInfo.volume / 1000 * 10) / 10}L / ${Math.round(waterInfo.totalVolume / 1000 * 10) / 10}L</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Altura:</span>
                    <span class="detail-value" id="water-height-${container.id}">${waterInfo.height}cm / ${waterInfo.totalHeight}cm</span>
                </div>
            </div>
            
            <div class="water-data">
                <h4>📏 Dimensiones</h4>
                <div class="data-item">
                    <label>Altura (cm)</label>
                    <input type="number" id="tank-height-${container.id}" value="${container.height}" onchange="updateContainerDimensions(${container.id})">
                </div>
                <div class="data-item">
                    <label>Ancho (cm)</label>
                    <input type="number" id="tank-width-${container.id}" value="${container.width}" onchange="updateContainerDimensions(${container.id})">
                </div>
                <div class="data-item">
                    <label>Largo (cm)</label>
                    <input type="number" id="tank-length-${container.id}" value="${container.length}" onchange="updateContainerDimensions(${container.id})">
                </div>
            </div>
            
            <div class="sensor-controls">
                <h4>🔧 Control del Sensor</h4>
                <button class="btn btn-secondary" onclick="simulateContainerSensorData(${container.id})">
                    📡 Simular Datos
                </button>
                <button class="btn btn-primary" onclick="updateContainerSensorData(${container.id})">
                    🔄 Actualizar
                </button>
            </div>
        </div>
    `;
}

function createModal() {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'add-plant-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🌱 Agregar Nueva Planta</h2>
            </div>
            <form id="add-plant-form">
                <div class="form-group">
                    <label for="plant-name">Nombre de la planta:</label>
                    <input type="text" id="plant-name" name="plantName" required placeholder="Ej: Rosa, Cactus, etc.">
                </div>
                <div class="form-group">
                    <label>Foto de la planta:</label>
                    <div class="photo-options">
                        <div class="photo-upload" onclick="doNothing()">
                            <div class="photo-option">
                                <div class="photo-icon">📷</div>
                                <div class="photo-text">Tomar Foto</div>
                            </div>
                        </div>
                        <div class="photo-upload" onclick="doNothing()">
                            <div class="photo-option">
                                <div class="photo-icon">📁</div>
                                <div class="photo-text">Subir Archivo</div>
                            </div>
                        </div>
                    </div>
                    <div class="photo-help">
                        <small>💡 Funcionalidad de foto desactivada</small>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Agregar Planta</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function setupEventListeners() {
    // Event listeners para las pestañas
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab')) {
            const tabName = e.target.getAttribute('data-tab');
            showTab(tabName);
        }
    });
    
    // Event listener para el formulario de agregar planta
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'add-plant-form') {
            e.preventDefault();
            addPlant();
        }
    });
    
    // Event listener para cerrar modal al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Simular cambios en el nivel de agua cada 30 segundos
    setInterval(simulateWaterLevelChange, 30000);
    
    // Verificar fuga cada 10 segundos
    setInterval(checkLeak, 10000);
}

function showTab(tabName) {
    // Remover clase active de todas las pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover clase active de todo el contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activar pestaña seleccionada
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-content`).classList.add('active');
    
    // Si se cambia a la pestaña de agua, actualizar el contenido
    if (tabName === 'water') {
        updateWaterContent();
    }
    
    currentTab = tabName;
}

function updateWaterContent() {
    const waterContent = document.getElementById('water-content');
    if (waterContent) {
        waterContent.innerHTML = createWaterContent();
    }
}

function openAddPlantModal() {
    modal.classList.add('show');
    document.getElementById('plant-name').focus();
}

function openEditPlantModal(plant) {
    // Crear modal de edición
    const editModal = document.createElement('div');
    editModal.className = 'modal';
    editModal.id = 'edit-plant-modal';
    editModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>✏️ Editar Planta</h2>
            </div>
            <form id="edit-plant-form">
                <div class="form-group">
                    <label for="edit-plant-name">Nombre de la planta:</label>
                    <input type="text" id="edit-plant-name" name="plantName" required placeholder="Ej: Rosa, Cactus, etc." value="${plant.name}">
                </div>
                <div class="form-group">
                    <label>Foto de la planta:</label>
                    <div class="photo-options">
                        <div class="photo-upload" onclick="doNothing()">
                            <div class="photo-option">
                                <div class="photo-icon">📷</div>
                                <div class="photo-text">Tomar Foto</div>
                            </div>
                        </div>
                        <div class="photo-upload" onclick="doNothing()">
                            <div class="photo-option">
                                <div class="photo-icon">📁</div>
                                <div class="photo-text">Subir Archivo</div>
                            </div>
                        </div>
                    </div>
                    <div class="photo-help">
                        <small>💡 Funcionalidad de foto desactivada</small>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(editModal);
    editModal.classList.add('show');
    document.getElementById('edit-plant-name').focus();
    
    // Manejar envío del formulario
    document.getElementById('edit-plant-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const newName = document.getElementById('edit-plant-name').value.trim();
        if (newName && newName !== plant.name) {
            plant.name = newName;
            updatePlantsDisplay();
            saveUserData();
            showNotification('Planta actualizada exitosamente', 'success');
            closeEditModal();
        }
    });
}

function closeEditModal() {
    const editModal = document.getElementById('edit-plant-modal');
    if (editModal) {
        editModal.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(editModal)) {
                document.body.removeChild(editModal);
            }
        }, 300);
    }
}

function doNothing() {
    // Función que no hace nada - los botones de foto están desactivados
    return;
}

function openCamera() {
    // Verificar si estamos en un entorno seguro
    const isSecure = location.protocol === 'https:' || 
                     location.hostname === 'localhost' || 
                     location.hostname === '127.0.0.1' ||
                     location.hostname.startsWith('192.168.') ||
                     location.hostname.startsWith('10.') ||
                     location.hostname.startsWith('172.');
    
    // En móviles, intentar primero con input file con capture
    if (isMobileDevice()) {
        openCameraWithFileInput();
        return;
    }
    
    if (!isSecure) {
        showNotification('La cámara requiere HTTPS. Usa "Subir Archivo" en su lugar.');
        return;
    }
    
    // Para desktop, intentar con MediaDevices API
    openCameraWithMediaDevices();
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
           window.innerWidth <= 768;
}

function openCameraWithFileInput() {
    // Mostrar mensaje informativo para móviles
    showNotification('Abriendo cámara... Si no funciona, usa "Subir Archivo"', 'info');
    
    // Crear input file con capture para móviles
    const cameraInput = document.createElement('input');
    cameraInput.type = 'file';
    cameraInput.accept = 'image/*';
    cameraInput.capture = 'environment'; // Cámara trasera
    cameraInput.style.display = 'none';
    
    cameraInput.onchange = function(event) {
        if (event.target.files && event.target.files.length > 0) {
            previewPhoto(event);
            showNotification('¡Foto tomada exitosamente!', 'success');
        }
        // Limpiar el input temporal
        if (document.body.contains(cameraInput)) {
            document.body.removeChild(cameraInput);
        }
    };
    
    cameraInput.onerror = function() {
        console.log('Error al abrir cámara con file input');
        showNotification('No se pudo abrir la cámara. Usa "Subir Archivo" en su lugar.');
        if (document.body.contains(cameraInput)) {
            document.body.removeChild(cameraInput);
        }
    };
    
    // Agregar al DOM y hacer clic
    document.body.appendChild(cameraInput);
    
    // Intentar hacer clic en el input
    try {
        cameraInput.click();
    } catch (error) {
        console.log('Error al hacer clic en input de cámara:', error);
        showNotification('No se pudo abrir la cámara. Usa "Subir Archivo" en su lugar.');
        if (document.body.contains(cameraInput)) {
            document.body.removeChild(cameraInput);
        }
    }
}

// Función alternativa usando MediaDevices API
function openCameraWithMediaDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(function(stream) {
                // Crear un video temporal para capturar la foto
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                
                // Crear un canvas para capturar la imagen
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                video.addEventListener('loadedmetadata', function() {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    
                    // Dibujar el frame actual en el canvas
                    context.drawImage(video, 0, 0);
                    
                    // Convertir a blob y simular un evento de archivo
                    canvas.toBlob(function(blob) {
                        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
                        const event = { target: { files: [file] } };
                        previewPhoto(event);
                        
                        // Limpiar
                        stream.getTracks().forEach(track => track.stop());
                        document.body.removeChild(video);
                        document.body.removeChild(canvas);
                    }, 'image/jpeg', 0.8);
                });
                
                document.body.appendChild(video);
                document.body.appendChild(canvas);
            })
            .catch(function(error) {
                console.log('Error al acceder a la cámara:', error);
                showNotification('No se pudo acceder a la cámara. Usa "Subir Archivo" en su lugar.');
            });
    } else {
        showNotification('Tu dispositivo no soporta la cámara. Usa "Subir Archivo" en su lugar.');
    }
}

function closeModal() {
    modal.classList.remove('show');
    // Limpiar formulario
    document.getElementById('add-plant-form').reset();
}

function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photo-preview');
            const uploadText = document.getElementById('upload-text');
            
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadText.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function addPlant() {
    const plantName = document.getElementById('plant-name').value.trim();
    
    if (!plantName) {
        alert('Por favor ingresa un nombre para la planta');
        return;
    }
    
    // Funcionalidad de foto desactivada - agregar planta sin foto
    savePlant(plantName, null);
}

function savePlant(name, photo) {
    const newPlant = {
        id: Date.now(),
        name: name,
        photo: photo,
        dateAdded: new Date().toLocaleDateString()
    };
    
    plants.push(newPlant);
    updatePlantsDisplay();
    closeModal();
    saveUserData();
    
    // Mostrar mensaje de éxito
    showNotification(`¡Planta "${name}" agregada exitosamente!`);
}

function updatePlantsDisplay() {
    const plantsGrid = document.getElementById('plants-grid');
    
    if (plants.length === 0) {
        plantsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--texto-claro); padding: 40px;">No tienes plantas registradas aún</p>';
        return;
    }
    
    plantsGrid.innerHTML = plants.map(plant => `
        <div class="plant-card">
            <div class="plant-image" onclick="viewPlantDetails(${plant.id})">
                ${plant.photo ? 
                    `<img src="${plant.photo}" alt="${plant.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">` : 
                    '🌱'
                }
            </div>
            <div class="plant-name">${plant.name}</div>
            <div class="plant-actions">
                <button class="action-btn edit-btn" onclick="editPlant(${plant.id})" title="Editar planta">
                    ✏️
                </button>
                <button class="action-btn delete-btn" onclick="deletePlant(${plant.id})" title="Eliminar planta">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

function viewPlantDetails(plantId) {
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
        alert(`Planta: ${plant.name}\nAgregada: ${plant.dateAdded}`);
    }
}

function editPlant(plantId) {
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
        openEditPlantModal(plant);
    }
}

function deletePlant(plantId) {
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
        if (confirm(`¿Estás seguro de que quieres eliminar la planta "${plant.name}"?`)) {
            plants = plants.filter(p => p.id !== plantId);
            updatePlantsDisplay();
            saveUserData();
            showNotification('Planta eliminada exitosamente', 'success');
        }
    }
}

// Función para calcular el nivel de agua de un contenedor específico
function calculateContainerWaterLevel(container) {
    // Validar que las dimensiones sean válidas
    if (container.height <= 0 || container.width <= 0 || container.length <= 0) {
        console.warn('Dimensiones del contenedor inválidas:', container);
        return {
            percentage: 0,
            volume: 0,
            totalVolume: 0,
            height: 0,
            totalHeight: container.height
        };
    }
    
    // Asegurar que la altura del agua no exceda la altura del tanque
    const validWaterHeight = Math.max(0, Math.min(container.sensorData.waterHeight, container.height));
    
    // Calcular el volumen total del tanque
    const tankVolume = container.height * container.width * container.length; // en cm³
    
    // Calcular el volumen actual de agua basado en la altura medida por el sensor
    const currentWaterVolume = validWaterHeight * container.width * container.length; // en cm³
    
    // Calcular el porcentaje de agua
    const calculatedLevel = tankVolume > 0 ? (currentWaterVolume / tankVolume) * 100 : 0;
    const clampedLevel = Math.max(0, Math.min(100, calculatedLevel));
    
    // Actualizar el nivel de agua del contenedor
    container.waterLevel = Math.round(clampedLevel * 10) / 10; // Redondear a 1 decimal
    
    // Si la altura del agua fue ajustada, actualizar el sensor
    if (validWaterHeight !== container.sensorData.waterHeight) {
        container.sensorData.waterHeight = validWaterHeight;
        console.log(`Altura del agua ajustada automáticamente en ${container.name}:`, validWaterHeight);
    }
    
    return {
        percentage: container.waterLevel,
        volume: currentWaterVolume,
        totalVolume: tankVolume,
        height: validWaterHeight,
        totalHeight: container.height
    };
}

function updateWaterLevel() {
    // Actualizar todos los contenedores
    waterContainers.forEach(container => {
        updateContainerDisplay(container);
    });
}

function updateContainerDisplay(container) {
    const waterInfo = calculateContainerWaterLevel(container);
    
    const waterLevelElement = document.getElementById(`water-level-${container.id}`);
    const waterPercentageElement = document.getElementById(`water-percentage-${container.id}`);
    const waterVolumeElement = document.getElementById(`water-volume-${container.id}`);
    const waterHeightElement = document.getElementById(`water-height-${container.id}`);
    
    if (waterLevelElement && waterPercentageElement) {
        waterLevelElement.style.height = waterInfo.percentage + '%';
        waterPercentageElement.textContent = waterInfo.percentage + '%';
    }
    
    // Actualizar información adicional si los elementos existen
    if (waterVolumeElement) {
        waterVolumeElement.textContent = `${Math.round(waterInfo.volume / 1000 * 10) / 10}L / ${Math.round(waterInfo.totalVolume / 1000 * 10) / 10}L`;
    }
    
    if (waterHeightElement) {
        waterHeightElement.textContent = `${waterInfo.height}cm / ${waterInfo.totalHeight}cm`;
    }
}

// Función para actualizar dimensiones de un contenedor específico
function updateContainerDimensions(containerId) {
    const container = waterContainers.find(c => c.id === containerId);
    if (!container) return;
    
    const newHeight = parseInt(document.getElementById(`tank-height-${containerId}`).value) || 50;
    const newWidth = parseInt(document.getElementById(`tank-width-${containerId}`).value) || 30;
    const newLength = parseInt(document.getElementById(`tank-length-${containerId}`).value) || 40;
    
    // Validar que las dimensiones sean positivas
    if (newHeight <= 0 || newWidth <= 0 || newLength <= 0) {
        showNotification('Las dimensiones del contenedor deben ser valores positivos', 'error');
        return;
    }
    
    // Guardar dimensiones anteriores para comparación
    const oldHeight = container.height;
    const oldWidth = container.width;
    const oldLength = container.length;
    
    // Actualizar las dimensiones
    container.height = newHeight;
    container.width = newWidth;
    container.length = newLength;
    
    // Si la altura del tanque cambió, ajustar la altura del agua del sensor si es necesario
    if (newHeight !== oldHeight) {
        if (container.sensorData.waterHeight > newHeight) {
            // Si la altura del agua excede la nueva altura del tanque, ajustarla
            container.sensorData.waterHeight = newHeight;
            showNotification(`Altura del agua ajustada a ${newHeight}cm en ${container.name}`, 'warning');
        }
    }
    
    // Recalcular el nivel de agua con las nuevas dimensiones
    updateContainerDisplay(container);
    
    // Mostrar notificación de cambio
    const dimensionChanged = (newHeight !== oldHeight || newWidth !== oldWidth || newLength !== oldLength);
    if (dimensionChanged) {
        const newVolume = Math.round((newHeight * newWidth * newLength) / 1000 * 10) / 10;
        const oldVolume = Math.round((oldHeight * oldWidth * oldLength) / 1000 * 10) / 10;
        showNotification(`${container.name}: Volumen ${oldVolume}L → ${newVolume}L`, 'success');
    }
    
    saveUserData();
}

// Función para abrir modal de agregar contenedor
function openAddContainerModal() {
    const addContainerModal = document.createElement('div');
    addContainerModal.className = 'modal';
    addContainerModal.id = 'add-container-modal';
    addContainerModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>💧 Agregar Nuevo Contenedor</h2>
            </div>
            <form id="add-container-form">
                <div class="form-group">
                    <label for="container-name">Nombre del contenedor:</label>
                    <input type="text" id="container-name" name="containerName" required placeholder="Ej: Tanque Secundario, Depósito, etc.">
                </div>
                <div class="form-group">
                    <label for="container-height">Altura (cm):</label>
                    <input type="number" id="container-height" name="containerHeight" required min="1" value="50">
                </div>
                <div class="form-group">
                    <label for="container-width">Ancho (cm):</label>
                    <input type="number" id="container-width" name="containerWidth" required min="1" value="30">
                </div>
                <div class="form-group">
                    <label for="container-length">Largo (cm):</label>
                    <input type="number" id="container-length" name="containerLength" required min="1" value="40">
                </div>
                <div class="form-group">
                    <label for="initial-water-height">Altura inicial del agua (cm):</label>
                    <input type="number" id="initial-water-height" name="initialWaterHeight" required min="0" value="25">
                </div>
                <div class="modal-buttons">
                    <button type="button" class="btn btn-secondary" onclick="closeAddContainerModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Agregar Contenedor</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(addContainerModal);
    addContainerModal.classList.add('show');
    document.getElementById('container-name').focus();
    
    // Manejar envío del formulario
    document.getElementById('add-container-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addContainer();
    });
}

function closeAddContainerModal() {
    const addContainerModal = document.getElementById('add-container-modal');
    if (addContainerModal) {
        addContainerModal.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(addContainerModal)) {
                document.body.removeChild(addContainerModal);
            }
        }, 300);
    }
}

function addContainer() {
    const containerName = document.getElementById('container-name').value.trim();
    const height = parseInt(document.getElementById('container-height').value) || 50;
    const width = parseInt(document.getElementById('container-width').value) || 30;
    const length = parseInt(document.getElementById('container-length').value) || 40;
    const initialWaterHeight = parseInt(document.getElementById('initial-water-height').value) || 25;
    
    if (!containerName) {
        showNotification('Por favor ingresa un nombre para el contenedor', 'error');
        return;
    }
    
    if (height <= 0 || width <= 0 || length <= 0) {
        showNotification('Las dimensiones deben ser valores positivos', 'error');
        return;
    }
    
    if (initialWaterHeight < 0 || initialWaterHeight > height) {
        showNotification('La altura inicial del agua debe estar entre 0 y la altura del contenedor', 'error');
        return;
    }
    
    // Crear nuevo contenedor
    const newContainer = {
        id: Date.now(),
        name: containerName,
        height: height,
        width: width,
        length: length,
        sensorData: {
            waterHeight: Math.min(initialWaterHeight, height),
            lastUpdate: new Date().toISOString()
        },
        waterLevel: 0 // Se calculará automáticamente
    };
    
    // Agregar al array de contenedores
    waterContainers.push(newContainer);
    
    // Actualizar la interfaz
    updateWaterContent();
    closeAddContainerModal();
    saveUserData();
    
    showNotification(`Contenedor "${containerName}" agregado exitosamente`, 'success');
}

function editContainer(containerId) {
    const container = waterContainers.find(c => c.id === containerId);
    if (!container) return;
    
    const editContainerModal = document.createElement('div');
    editContainerModal.className = 'modal';
    editContainerModal.id = 'edit-container-modal';
    editContainerModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>✏️ Editar Contenedor</h2>
            </div>
            <form id="edit-container-form">
                <div class="form-group">
                    <label for="edit-container-name">Nombre del contenedor:</label>
                    <input type="text" id="edit-container-name" name="containerName" required value="${container.name}">
                </div>
                <div class="modal-buttons">
                    <button type="button" class="btn btn-secondary" onclick="closeEditContainerModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(editContainerModal);
    editContainerModal.classList.add('show');
    document.getElementById('edit-container-name').focus();
    
    // Manejar envío del formulario
    document.getElementById('edit-container-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const newName = document.getElementById('edit-container-name').value.trim();
        if (newName && newName !== container.name) {
            container.name = newName;
            updateWaterContent();
            saveUserData();
            showNotification('Contenedor actualizado exitosamente', 'success');
            closeEditContainerModal();
        }
    });
}

function closeEditContainerModal() {
    const editContainerModal = document.getElementById('edit-container-modal');
    if (editContainerModal) {
        editContainerModal.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(editContainerModal)) {
                document.body.removeChild(editContainerModal);
            }
        }, 300);
    }
}

function deleteContainer(containerId) {
    const container = waterContainers.find(c => c.id === containerId);
    if (!container) return;
    
    if (waterContainers.length <= 1) {
        showNotification('No puedes eliminar el último contenedor', 'error');
        return;
    }
    
    if (confirm(`¿Estás seguro de que quieres eliminar el contenedor "${container.name}"?`)) {
        waterContainers = waterContainers.filter(c => c.id !== containerId);
        updateWaterContent();
        saveUserData();
        showNotification('Contenedor eliminado exitosamente', 'success');
    }
}

function checkLeak() {
    // Simular detección de fuga (10% de probabilidad)
    const leakProbability = Math.random();
    hasLeak = leakProbability < 0.1;
    
    const leakAlert = document.getElementById('leak-alert');
    if (leakAlert) {
        if (hasLeak) {
            leakAlert.classList.add('show');
        } else {
            leakAlert.classList.remove('show');
        }
    }
}

function simulateWaterLevelChange() {
    // Simular cambios naturales en el nivel de agua basados en datos del sensor
    const change = (Math.random() - 0.5) * 2; // Cambio más sutil entre -1% y +1%
    const newHeight = Math.max(0, Math.min(tankHeight, sensorData.waterHeight + change));
    
    // Actualizar datos del sensor con variación natural
    sensorData.waterHeight = Math.round(newHeight * 10) / 10;
    sensorData.lastUpdate = new Date().toISOString();
    
    // Recalcular el nivel basado en las nuevas dimensiones
    updateWaterLevel();
    saveUserData();
}

function showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    
    // Colores según el tipo
    let backgroundColor = 'var(--verde-natural)';
    if (type === 'success') backgroundColor = '#4CAF50';
    if (type === 'error') backgroundColor = '#f44336';
    if (type === 'warning') backgroundColor = '#ff9800';
    if (type === 'info') backgroundColor = '#2196F3';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${backgroundColor};
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        box-shadow: 0 4px 15px var(--sombra);
        z-index: 1001;
        font-weight: 500;
        animation: slideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function loadUserData() {
    // Cargar datos del usuario desde localStorage
    const savedData = localStorage.getItem('gardenAppData');
    if (savedData) {
        const data = JSON.parse(savedData);
        currentUser = data.user || 'Usuario';
        plants = data.plants || [];
        
        // Cargar contenedores de agua si existen
        if (data.waterContainers && data.waterContainers.length > 0) {
            waterContainers = data.waterContainers;
        }
        
        // Validar datos de todos los contenedores después de cargarlos
        waterContainers.forEach(container => {
            validateContainerSensorData(container);
        });
        
        // Actualizar display
        updatePlantsDisplay();
        updateWaterLevel();
        
        // Actualizar nombre de usuario en header
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = `Bienvenido ${currentUser}`;
        }
    }
}

function saveUserData() {
    // Guardar datos del usuario en localStorage
    const data = {
        user: currentUser,
        plants: plants,
        waterContainers: waterContainers,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('gardenAppData', JSON.stringify(data));
}

// Función para cambiar el nombre de usuario (puede ser llamada externamente)
function changeUserName(newName) {
    currentUser = newName;
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = `Bienvenido ${currentUser}`;
    }
    saveUserData();
}

// Función para simular datos del sensor de agua (para uso futuro)
function updateWaterLevelFromSensor(newLevel) {
    waterLevel = Math.max(0, Math.min(100, newLevel));
    updateWaterLevel();
    saveUserData();
}

// Función para validar y ajustar datos del sensor de un contenedor específico
function validateContainerSensorData(container) {
    // Asegurar que la altura del agua no exceda la altura del tanque
    if (container.sensorData.waterHeight > container.height) {
        container.sensorData.waterHeight = container.height;
        console.log(`Altura del agua ajustada a la altura máxima del tanque en ${container.name}:`, container.height);
    }
    
    // Asegurar que la altura del agua no sea negativa
    if (container.sensorData.waterHeight < 0) {
        container.sensorData.waterHeight = 0;
        console.log(`Altura del agua ajustada a 0 en ${container.name}`);
    }
    
    return container.sensorData;
}

// Función para simular datos del sensor de un contenedor específico
function simulateContainerSensorData(containerId) {
    const container = waterContainers.find(c => c.id === containerId);
    if (!container) return;
    
    // Validar datos actuales antes de simular
    validateContainerSensorData(container);
    
    // Simular variaciones realistas en la altura del agua (respetando las dimensiones del tanque)
    const variation = (Math.random() - 0.5) * 5; // Variación de ±2.5 cm
    const newHeight = Math.max(0, Math.min(container.height, container.sensorData.waterHeight + variation));
    
    // Actualizar datos del sensor
    container.sensorData.waterHeight = Math.round(newHeight * 10) / 10;
    container.sensorData.lastUpdate = new Date().toISOString();
    
    // Recalcular y actualizar la visualización
    updateContainerDisplay(container);
    saveUserData();
    
    showNotification(`Datos del sensor actualizados en ${container.name}`, 'success');
}

// Función para actualizar datos del sensor de un contenedor específico
function updateContainerSensorData(containerId) {
    const container = waterContainers.find(c => c.id === containerId);
    if (!container) return;
    
    // Esta función se puede usar para recibir datos reales del sensor
    // Por ahora, simula una actualización
    simulateContainerSensorData(containerId);
}

// Función para recibir datos reales del sensor (API externa)
function receiveSensorData(data) {
    if (data && typeof data === 'object') {
        // Actualizar datos del sensor con validación
        if (data.waterHeight !== undefined) {
            sensorData.waterHeight = Math.max(0, Math.min(tankHeight, data.waterHeight));
        }
        sensorData.lastUpdate = new Date().toISOString();
        
        // Validar todos los datos del sensor
        validateSensorData();
        
        // Recalcular y actualizar
        updateWaterLevel();
        saveUserData();
        
        console.log('Datos del sensor recibidos y validados:', sensorData);
        showNotification('Datos del sensor actualizados desde fuente externa', 'success');
    } else {
        console.error('Datos del sensor inválidos:', data);
        showNotification('Error: Datos del sensor inválidos', 'error');
    }
}

// Agregar estilos CSS para las animaciones de notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { 
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to { 
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from { 
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to { 
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);
