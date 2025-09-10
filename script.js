// Datos de la aplicación
let currentUser = 'Usuario'; // Por defecto, se puede cambiar
let plants = []; // Array para almacenar las plantas
let waterLevel = 75; // Nivel de agua por defecto (porcentaje)
let tankHeight = 50; // Altura del tanque en cm
let tankWidth = 30; // Ancho del tanque en cm
let hasLeak = false; // Estado de fuga

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
        <div class="water-container">
            <div class="tank-info">
                <h3>💧 Nivel de Agua</h3>
            </div>
            <div class="water-tank">
                <div class="water-level" id="water-level" style="height: ${waterLevel}%"></div>
                <div class="water-percentage" id="water-percentage">${waterLevel}%</div>
            </div>
            
            <div class="water-data">
                <div class="data-item">
                    <label>Altura (cm)</label>
                    <input type="number" id="tank-height" value="${tankHeight}" onchange="updateTankDimensions()">
                </div>
                <div class="data-item">
                    <label>Ancho (cm)</label>
                    <input type="number" id="tank-width" value="${tankWidth}" onchange="updateTankDimensions()">
                </div>
            </div>
            
            <button class="add-container-btn" onclick="addContainer()">
                ➕ Agregar Otro Contenedor
            </button>
            
            <div class="leak-alert" id="leak-alert">
                <div class="alert-icon">⚠️</div>
                <div>¡Alerta! Posible fuga detectada</div>
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
    
    currentTab = tabName;
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

function updateWaterLevel() {
    const waterLevelElement = document.getElementById('water-level');
    const waterPercentageElement = document.getElementById('water-percentage');
    
    if (waterLevelElement && waterPercentageElement) {
        waterLevelElement.style.height = waterLevel + '%';
        waterPercentageElement.textContent = waterLevel + '%';
    }
}

function updateTankDimensions() {
    tankHeight = parseInt(document.getElementById('tank-height').value) || 50;
    tankWidth = parseInt(document.getElementById('tank-width').value) || 30;
    saveUserData();
}

function addContainer() {
    const containerCount = document.querySelectorAll('.water-container').length;
    showNotification(`Contenedor ${containerCount + 1} agregado. (Funcionalidad en desarrollo)`);
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
    // Simular cambios naturales en el nivel de agua
    const change = (Math.random() - 0.5) * 10; // Cambio entre -5% y +5%
    waterLevel = Math.max(0, Math.min(100, waterLevel + change));
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
        waterLevel = data.waterLevel || 75;
        tankHeight = data.tankHeight || 50;
        tankWidth = data.tankWidth || 30;
        
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
        waterLevel: waterLevel,
        tankHeight: tankHeight,
        tankWidth: tankWidth,
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
