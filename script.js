// Variables globales
let map;
let modalMap;
let selectedLocation = null;
let searchResults = [];

// Éléments DOM
const selectLocationBtn = document.getElementById('selectLocationBtn');
const locationModal = document.getElementById('locationModal');
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const locationSearch = document.getElementById('locationSearch');
const searchBtn = document.getElementById('searchBtn');
const searchResultsDiv = document.getElementById('searchResults');
const confirmLocationBtn = document.getElementById('confirmLocationBtn');
const selectedLocationDiv = document.getElementById('selectedLocation');
const locationNameSpan = document.getElementById('locationName');
const generateBtn = document.getElementById('generateBtn');
const resultDiv = document.getElementById('result');
const climateStripesDiv = document.getElementById('climateStripes');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeMainMap();
    initializeModal();
    setupEventListeners();
});

// Initialisation de la carte principale
function initializeMainMap() {
    map = L.map('map').setView([46.6034, 1.8883], 6); // Centre sur la France
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Initialisation de la modal
function initializeModal() {
    modalMap = L.map('modalMap').setView([46.6034, 1.8883], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(modalMap);
    
    // Marqueur pour la sélection
    let marker = null;
    
    modalMap.on('click', function(e) {
        if (marker) {
            modalMap.removeLayer(marker);
        }
        
        marker = L.marker(e.latlng).addTo(modalMap);
        selectedLocation = {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            name: `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`
        };
        
        confirmLocationBtn.disabled = false;
        confirmLocationBtn.textContent = 'Confirmer la sélection';
    });
}

// Configuration des événements
function setupEventListeners() {
    // Bouton pour ouvrir la modal
    selectLocationBtn.addEventListener('click', openModal);
    
    // Fermeture de la modal
    closeModal.addEventListener('click', closeModalFunction);
    cancelBtn.addEventListener('click', closeModalFunction);
    
    // Clic en dehors de la modal
    window.addEventListener('click', function(event) {
        if (event.target === locationModal) {
            closeModalFunction();
        }
    });
    
    // Recherche de lieu
    searchBtn.addEventListener('click', searchLocation);
    locationSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLocation();
        }
    });
    
    // Confirmation de la sélection
    confirmLocationBtn.addEventListener('click', confirmLocation);
    
    // Génération des Climate Stripes
    generateBtn.addEventListener('click', generateClimateStripes);
}

// Ouvrir la modal
function openModal() {
    locationModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Redimensionner la carte de la modal
    setTimeout(() => {
        modalMap.invalidateSize();
    }, 100);
}

// Fermer la modal
function closeModalFunction() {
    locationModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset des sélections
    selectedLocation = null;
    searchResults = [];
    searchResultsDiv.innerHTML = '';
    locationSearch.value = '';
    confirmLocationBtn.disabled = true;
    confirmLocationBtn.textContent = 'Confirmer la sélection';
    
    // Supprimer les marqueurs de la carte modal
    modalMap.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            modalMap.removeLayer(layer);
        }
    });
}

// Recherche de lieu
async function searchLocation() {
    const query = locationSearch.value.trim();
    if (!query) return;
    
    searchBtn.innerHTML = '<div class="loading"></div>';
    searchBtn.disabled = true;
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=fr`);
        const data = await response.json();
        
        searchResults = data;
        displaySearchResults();
        
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        searchResultsDiv.innerHTML = '<div class="search-result-item">Erreur lors de la recherche</div>';
    } finally {
        searchBtn.innerHTML = '🔍 Rechercher';
        searchBtn.disabled = false;
    }
}

// Affichage des résultats de recherche
function displaySearchResults() {
    searchResultsDiv.innerHTML = '';
    
    if (searchResults.length === 0) {
        searchResultsDiv.innerHTML = '<div class="search-result-item">Aucun résultat trouvé</div>';
        return;
    }
    
    searchResults.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <strong>${result.display_name.split(',')[0]}</strong><br>
            <small>${result.display_name}</small>
        `;
        
        item.addEventListener('click', () => {
            selectSearchResult(result);
        });
        
        searchResultsDiv.appendChild(item);
    });
}

// Sélection d'un résultat de recherche
function selectSearchResult(result) {
    selectedLocation = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        name: result.display_name.split(',')[0]
    };
    
    // Centrer la carte sur le lieu sélectionné
    modalMap.setView([selectedLocation.lat, selectedLocation.lng], 12);
    
    // Ajouter un marqueur
    modalMap.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            modalMap.removeLayer(layer);
        }
    });
    
    L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(modalMap);
    
    confirmLocationBtn.disabled = false;
    confirmLocationBtn.textContent = 'Confirmer la sélection';
}

// Confirmer la sélection
function confirmLocation() {
    if (!selectedLocation) return;
    
    // Mettre à jour l'affichage
    locationNameSpan.textContent = selectedLocation.name;
    selectedLocationDiv.style.display = 'block';
    
    // Centrer la carte principale sur le lieu sélectionné
    map.setView([selectedLocation.lat, selectedLocation.lng], 10);
    
    // Ajouter un marqueur sur la carte principale
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    
    L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(map);
    
    // Fermer la modal
    closeModalFunction();
}

// Génération des Climate Stripes avec vraies données
async function generateClimateStripes() {
    generateBtn.innerHTML = '<div class="loading"></div> Génération...';
    generateBtn.disabled = true;
    
    try {
        // Essayer de charger les données climatiques réelles
        let climateData = null;
        
        try {
            const response = await fetch('data/global_climate_data.json');
            if (response.ok) {
                climateData = await response.json();
            }
        } catch (error) {
            console.log('Données climatiques non disponibles, utilisation de données simulées');
        }
        
        let temperatures;
        let years;
        
        if (climateData && climateData.paris) {
            // Utiliser les vraies données
            temperatures = climateData.paris.temperatures;
            years = climateData.paris.years;
        } else {
            // Fallback vers des données simulées réalistes
            temperatures = generateSimulatedData();
            years = Array.from({length: 50}, (_, i) => 2024 - 49 + i);
        }
        
        // Créer les Climate Stripes
        createClimateStripes(temperatures, years);
        
        // Afficher le résultat
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Erreur lors de la génération:', error);
        // Fallback vers des données simulées
        const temperatures = generateSimulatedData();
        const years = Array.from({length: 50}, (_, i) => 2024 - 49 + i);
        createClimateStripes(temperatures, years);
        resultDiv.style.display = 'block';
    } finally {
        generateBtn.innerHTML = 'Générer Climate Stripes';
        generateBtn.disabled = false;
    }
}

// Génération de données simulées réalistes
function generateSimulatedData() {
    const temperatures = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 50; i++) {
        const year = currentYear - 49 + i;
        // Tendance de réchauffement climatique réaliste
        const warmingTrend = (year - 1975) * 0.02;
        // Température de base selon la latitude (approximation)
        const baseTemp = 15 - (Math.abs(selectedLocation?.lat || 45) - 45) * 0.3;
        // Variabilité interannuelle
        const variation = (Math.random() - 0.5) * 3;
        // Variation cyclique (cycles climatiques)
        const cycle = 2 * Math.sin(2 * Math.PI * (year - 1975) / 11); // Cycle de 11 ans
        
        temperatures.push(baseTemp + warmingTrend + variation + cycle);
    }
    
    return temperatures;
}

// Création des Climate Stripes
function createClimateStripes(temperatures, years = null) {
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const tempRange = maxTemp - minTemp;
    
    climateStripesDiv.innerHTML = '';
    
    // Utiliser les années fournies ou générer des années par défaut
    const displayYears = years || Array.from({length: temperatures.length}, (_, i) => 2024 - temperatures.length + 1 + i);
    
    // Créer une div pour chaque année
    temperatures.forEach((temp, index) => {
        const yearDiv = document.createElement('div');
        yearDiv.style.cssText = `
            display: inline-block;
            width: 8px;
            height: 100px;
            background: ${getTemperatureColor(temp, minTemp, maxTemp)};
            margin: 0 1px;
            border-radius: 2px;
        `;
        yearDiv.title = `Année ${displayYears[index]}: ${temp.toFixed(1)}°C`;
        climateStripesDiv.appendChild(yearDiv);
    });
    
    // Ajouter les années de référence
    const yearLabels = document.createElement('div');
    yearLabels.style.cssText = `
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 0.8rem;
        color: #666;
    `;
    
    const startYear = displayYears[0];
    const endYear = displayYears[displayYears.length - 1];
    const midYear = displayYears[Math.floor(displayYears.length / 2)];
    
    yearLabels.innerHTML = `
        <span>${startYear}</span>
        <span>${midYear}</span>
        <span>${endYear}</span>
    `;
    climateStripesDiv.appendChild(yearLabels);
    
    // Ajouter des informations sur les données
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        margin-top: 15px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 5px;
        font-size: 0.9rem;
        color: #666;
    `;
    infoDiv.innerHTML = `
        <strong>Informations :</strong><br>
        Période : ${startYear} - ${endYear}<br>
        Température moyenne : ${(temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)}°C<br>
        Écart de température : ${(maxTemp - minTemp).toFixed(1)}°C
    `;
    climateStripesDiv.appendChild(infoDiv);
}

// Conversion température vers couleur
function getTemperatureColor(temp, minTemp, maxTemp) {
    const normalized = (temp - minTemp) / (maxTemp - minTemp);
    
    // Palette de couleurs des Climate Stripes (bleu froid -> rouge chaud)
    const colors = [
        '#08306b', '#08519c', '#2171b5', '#4292c6', '#6baed6', '#9ecae1', '#c6dbef', '#deebf7',
        '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'
    ];
    
    const index = Math.floor(normalized * (colors.length - 1));
    return colors[index];
}
