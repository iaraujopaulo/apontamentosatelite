// ============================================
// BASE DE DADOS DE SATÉLITES
// ============================================
const defaultSatellites = [
  { name: "Eutelsat 113 West A", longitude: -113.0, description: "Eutelsat" },
  { name: "EchoStar 105 / SES-11", longitude: -105.0, description: "EchoStar / SES" },
  { name: "Galaxy 19", longitude: -97.0, description: "Intelsat - FTA" },
  { name: "Intelsat 30 / 31", longitude: -95.0, description: "Intelsat" },
  { name: "Galaxy 32", longitude: -91.0, description: "Intelsat" },
  { name: "Galaxy 36", longitude: -89.0, description: "Intelsat" },
  { name: "Star One D1", longitude: -84.0, description: "Brasil - Embratel" },
  { name: "QuetzSat 1", longitude: -77.0, description: "Sky Mexico" },
  { name: "Star One C3", longitude: -75.0, description: "Brasil - Embratel" },
  { name: "SGDC", longitude: -75.0, description: "Telebras - Gov" },
  { name: "Hispasat 74W-1", longitude: -73.9, description: "Hispasat" },
  { name: "Nimiq 5", longitude: -72.7, description: "Bell Canada" },
  { name: "Arsat 1", longitude: -71.8, description: "Argentina" },
  { name: "Star One D2", longitude: -70.0, description: "Brasil - Embratel" },
  { name: "Star One C4", longitude: -70.0, description: "Brasil - Embratel" },
  { name: "Star One C2", longitude: -70.0, description: "Brasil - Embratel" },
  { name: "SES-10", longitude: -67.0, description: "SES" },
  { name: "Eutelsat 65 West A", longitude: -65.2, description: "Eutelsat" },
  { name: "Star One C1", longitude: -65.0, description: "Brasil - Embratel" },
  { name: "Telstar 19 Vantage", longitude: -63.0, description: "Telesat Brasil" },
  { name: "Amazonas 2", longitude: -61.0, description: "Hispamar - Brasil" },
  { name: "Amazonas 3", longitude: -61.0, description: "Hispamar - Brasil" },
  { name: "Amazonas 5", longitude: -61.0, description: "Hispamar - Brasil" },
  { name: "Amazonas Nexus", longitude: -61.0, description: "Hispamar" },
  { name: "Intelsat 21", longitude: -58.0, description: "Intelsat" },
  { name: "Intelsat 34", longitude: -55.5, description: "Intelsat" },
  { name: "Intelsat 23", longitude: -53.0, description: "Intelsat" },
  { name: "SES-14", longitude: -47.5, description: "SES DTH Brasil" },
  { name: "Intelsat 14", longitude: -45.0, description: "Intelsat" },
  { name: "Intelsat 11", longitude: -43.1, description: "Intelsat / Sky Brasil" },
  { name: "SES-6", longitude: -40.5, description: "SES" },
  { name: "Hispasat 36W-1", longitude: -36.0, description: "Hispasat" },
  { name: "Intelsat 35e", longitude: -34.5, description: "Intelsat" },
  { name: "Hispasat 30W-5 / 30W-6", longitude: -30.0, description: "Hispasat" },
  { name: "SES-4", longitude: -22.0, description: "SES" },
  { name: "Al Yah 3", longitude: -20.0, description: "Hughes / Yahsat" },
  { name: "Intelsat 37e", longitude: -18.0, description: "Intelsat" },
  { name: "Telstar 12 Vantage", longitude: -15.0, description: "Telesat" },
  { name: "Express AM8", longitude: -14.0, description: "RSCC" }
];

// ============================================
// BANCO DE DADOS LOCAL (localStorage)
// ============================================
const DB_KEY = 'geosat_custom_satellites';

function loadCustomSatellites() {
  try {
    const stored = localStorage.getItem(DB_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar satélites:', error);
    return [];
  }
}

function saveCustomSatellite(satellite) {
  try {
    const satellites = loadCustomSatellites();
    satellites.push(satellite);
    localStorage.setItem(DB_KEY, JSON.stringify(satellites));
    return true;
  } catch (error) {
    console.error('Erro ao salvar satélite:', error);
    return false;
  }
}

function removeCustomSatellite(index) {
  try {
    const satellites = loadCustomSatellites();
    satellites.splice(index, 1);
    localStorage.setItem(DB_KEY, JSON.stringify(satellites));
    return true;
  } catch (error) {
    console.error('Erro ao remover satélite:', error);
    return false;
  }
}

// ============================================
// CÁLCULOS ORBITAIS
// ============================================
function calculateAzimuthElevation(lat, lon, satLon) {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const satLonRad = (satLon * Math.PI) / 180;
  const deltaLon = satLonRad - lonRad;

  const cosDeltaLon = Math.cos(deltaLon);
  const cosLat = Math.cos(latRad);
  const sinLat = Math.sin(latRad);
  
  const ratio = 6371 / 42164;

  const num = cosDeltaLon * cosLat - ratio;
  const den = Math.sqrt(1 - Math.pow(cosDeltaLon * cosLat, 2));
  let elevation = Math.atan(num / den) * (180 / Math.PI);

  const x = -sinLat * cosDeltaLon;
  const y = Math.sin(deltaLon);
  let azimuth = Math.atan2(y, x) * (180 / Math.PI);
  
  if (azimuth < 0) {
    azimuth += 360;
  }

  let polarization = Math.atan(Math.sin(deltaLon) / Math.tan(latRad)) * (180 / Math.PI);
  if (lat < 0) {
    polarization = -polarization;
  }

  return {
    azimuth: azimuth.toFixed(2),
    elevation: elevation.toFixed(2),
    polarization: polarization.toFixed(2)
  };
}

function getAzimuthDirection(azimuth) {
  if (azimuth > 337.5 || azimuth <= 22.5) return 'Norte';
  if (azimuth > 22.5 && azimuth <= 67.5) return 'Nordeste';
  if (azimuth > 67.5 && azimuth <= 112.5) return 'Leste';
  if (azimuth > 112.5 && azimuth <= 157.5) return 'Sudeste';
  if (azimuth > 157.5 && azimuth <= 202.5) return 'Sul';
  if (azimuth > 202.5 && azimuth <= 247.5) return 'Sudoeste';
  if (azimuth > 247.5 && azimuth <= 292.5) return 'Oeste';
  return 'Noroeste';
}

function formatLongitude(lon) {
  return lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`;
}

// ============================================
// ESTADO DA APLICAÇÃO
// ============================================
let position = { lat: -23.5505, lng: -46.6333 };
let customSatellites = loadCustomSatellites();
let selectedSatellite = defaultSatellites[0];
let map, marker;

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initMap();
  populateSatelliteSelect();
  renderSatelliteList();
  updateResults();
  setupEventListeners();
});

function initMap() {
  map = L.map('map').setView([position.lat, position.lng], 10);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  marker = L.marker([position.lat, position.lng]).addTo(map);

  map.on('click', function(e) {
    position = { lat: e.latlng.lat, lng: e.latlng.lng };
    marker.setLatLng(e.latlng);
    document.getElementById('latInput').value = position.lat.toFixed(4);
    document.getElementById('lngInput').value = position.lng.toFixed(4);
    updateResults();
  });
}

function populateSatelliteSelect() {
  const select = document.getElementById('satelliteSelect');
  const allSatellites = [...defaultSatellites, ...customSatellites];
  
  select.innerHTML = '';
  allSatellites.forEach((sat, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = `${sat.name} (${formatLongitude(sat.longitude)})`;
    select.appendChild(option);
  });

  const selectedIndex = allSatellites.findIndex(s => s.name === selectedSatellite.name);
  if (selectedIndex !== -1) {
    select.value = selectedIndex;
  }
}

function renderSatelliteList() {
  const list = document.getElementById('satelliteList');
  const allSatellites = [...defaultSatellites, ...customSatellites];
  const customCount = document.getElementById('customCount');
  
  list.innerHTML = '';
  
  allSatellites.forEach((sat, idx) => {
    const isCustom = idx >= defaultSatellites.length;
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex align-items-center justify-content-between';
    
    item.innerHTML = `
      <span class="small flex-grow-1">
        ${sat.name}
        ${isCustom ? '<i class="bi bi-save-fill text-success ms-1" title="Salvo"></i>' : ''}
      </span>
      ${isCustom ? `
        <button class="btn btn-sm btn-link text-danger p-0 ms-2" data-index="${idx}" title="Remover">
          <i class="bi bi-trash"></i>
        </button>
      ` : ''}
    `;
    
    list.appendChild(item);
  });

  if (customSatellites.length > 0) {
    customCount.textContent = customSatellites.length;
    customCount.classList.remove('d-none');
  } else {
    customCount.classList.add('d-none');
  }

  // Adicionar event listeners aos botões de remover
  list.querySelectorAll('button[data-index]').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.dataset.index);
      handleRemoveSatellite(idx);
    });
  });
}

function updateResults() {
  const results = calculateAzimuthElevation(position.lat, position.lng, selectedSatellite.longitude);
  
  document.getElementById('azimuthResult').textContent = `${results.azimuth}°`;
  document.getElementById('azimuthDirection').textContent = getAzimuthDirection(parseFloat(results.azimuth));
  document.getElementById('elevationResult').textContent = `${results.elevation}°`;
  document.getElementById('polarizationResult').textContent = `${results.polarization}°`;
  document.getElementById('satInfo').textContent = `${selectedSatellite.name} (${formatLongitude(selectedSatellite.longitude)})`;
  document.getElementById('locInfo').textContent = `${position.lat.toFixed(4)}°, ${position.lng.toFixed(4)}°`;
  
  const isCustom = customSatellites.some(s => s.name === selectedSatellite.name);
  const customBadge = document.getElementById('customBadge');
  if (isCustom) {
    customBadge.classList.remove('d-none');
  } else {
    customBadge.classList.add('d-none');
  }
}

function setupEventListeners() {
  // Busca de endereço
  document.getElementById('searchBtn').addEventListener('click', handleSearchAddress);
  document.getElementById('addressInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleSearchAddress();
  });

  // Inputs de coordenadas
  document.getElementById('latInput').addEventListener('change', function() {
    position.lat = parseFloat(this.value);
    marker.setLatLng([position.lat, position.lng]);
    map.setView([position.lat, position.lng], map.getZoom());
    updateResults();
  });

  document.getElementById('lngInput').addEventListener('change', function() {
    position.lng = parseFloat(this.value);
    marker.setLatLng([position.lat, position.lng]);
    map.setView([position.lat, position.lng], map.getZoom());
    updateResults();
  });

  // Seleção de satélite
  document.getElementById('satelliteSelect').addEventListener('change', function() {
    const allSatellites = [...defaultSatellites, ...customSatellites];
    selectedSatellite = allSatellites[parseInt(this.value)];
    updateResults();
  });

  // Adicionar satélite
  document.getElementById('addSatBtn').addEventListener('click', handleAddSatellite);
}

// ============================================
// HANDLERS
// ============================================
async function handleSearchAddress() {
  const address = document.getElementById('addressInput').value.trim();
  if (!address) return;

  const searchBtn = document.getElementById('searchBtn');
  searchBtn.disabled = true;
  searchBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
      headers: { 'User-Agent': 'GeoSatApp/1.0' }
    });
    const data = await response.json();
    
    if (data && data.length > 0) {
      position = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      marker.setLatLng([position.lat, position.lng]);
      map.setView([position.lat, position.lng], 13);
      document.getElementById('latInput').value = position.lat.toFixed(4);
      document.getElementById('lngInput').value = position.lng.toFixed(4);
      updateResults();
    } else {
      alert('Endereço não encontrado. Tente ser mais específico (ex: Cidade, Estado).');
    }
  } catch (error) {
    console.error('Erro na busca:', error);
    alert('Erro ao buscar endereço. Verifique sua conexão.');
  } finally {
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="bi bi-search"></i>';
  }
}

function handleAddSatellite() {
  const name = document.getElementById('newSatName').value.trim();
  const lonStr = document.getElementById('newSatLon').value.trim();

  if (!name || !lonStr) {
    alert('Preencha o nome e a longitude do satélite.');
    return;
  }

  const lon = parseFloat(lonStr);
  if (isNaN(lon) || lon < -180 || lon > 180) {
    alert('Longitude inválida. Use valores entre -180 (Oeste) e 180 (Leste).');
    return;
  }

  const newSat = {
    name: name,
    longitude: lon,
    description: 'Personalizado',
    createdAt: new Date().toISOString()
  };

  const saved = saveCustomSatellite(newSat);
  
  if (saved) {
    customSatellites.push(newSat);
    selectedSatellite = newSat;
    document.getElementById('newSatName').value = '';
    document.getElementById('newSatLon').value = '';
    
    populateSatelliteSelect();
    renderSatelliteList();
    updateResults();

    // Feedback visual
    const btn = document.getElementById('addSatBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-lg"></i> Salvo!';
    btn.classList.remove('btn-dark');
    btn.classList.add('btn-success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('btn-success');
      btn.classList.add('btn-dark');
    }, 1500);
  } else {
    alert('Erro ao salvar satélite. Tente novamente.');
  }
}

function handleRemoveSatellite(index) {
  const customIndex = index - defaultSatellites.length;
  
  if (customIndex < 0) {
    alert('Não é possível remover satélites da base padrão.');
    return;
  }

  const satName = customSatellites[customIndex].name;
  if (!confirm(`Deseja realmente remover "${satName}" do banco de dados?`)) {
    return;
  }

  const removed = removeCustomSatellite(customIndex);
  
  if (removed) {
    customSatellites.splice(customIndex, 1);
    
    if (selectedSatellite.name === satName) {
      selectedSatellite = defaultSatellites[0];
    }
    
    populateSatelliteSelect();
    renderSatelliteList();
    updateResults();
  } else {
    alert('Erro ao remover satélite.');
  }
}