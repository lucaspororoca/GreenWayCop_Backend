document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('authToken');
  if (!token) window.location.href = 'login.html';

  const map = L.map('map').setView([-23.5505, -46.6333], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  let userLocation = await getUserLocation();
  if (userLocation) {
    map.setView([userLocation.latitude, userLocation.longitude], 15);
    L.marker([userLocation.latitude, userLocation.longitude]).addTo(map).bindPopup('Você está aqui').openPopup();
  }

  const destinationInput = document.getElementById('destination');
  const destinationResults = document.getElementById('destinationResults');
  let destinationMarker = null;

  destinationInput.addEventListener('input', debounce(handleSearch, 500));
  document.getElementById('calculateRoute').addEventListener('click', calculateRoute);

  async function getUserLocation() {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch {
      return null;
    }
  }

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

  async function handleSearch() {
    const query = destinationInput.value.trim();
    if (query.length < 3) {
      destinationResults.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const results = await response.json();
      renderResults(results.slice(0, 5));
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  function renderResults(results) {
    destinationResults.innerHTML = '';
    results.forEach(result => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.textContent = result.display_name;
      item.addEventListener('click', () => selectDestination(result));
      destinationResults.appendChild(item);
    });
  }

  function selectDestination(result) {
    destinationInput.value = result.display_name;
    destinationResults.innerHTML = '';

    if (destinationMarker) map.removeLayer(destinationMarker);

    destinationMarker = L.marker([result.lat, result.lon])
      .addTo(map)
      .bindPopup('Destino')
      .openPopup();

    window.selectedDestination = {
      idDestino: null,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    };
  }

  async function calculateRoute() {
    if (!userLocation || !window.selectedDestination) {
      alert('Selecione um destino');
      return;
    }

    const transportMode = document.getElementById('transportMode').value;

    try {
      const response = await fetch('/api/mapa/maps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          localizacao: userLocation,
          destino: window.selectedDestination,
          transporte: transportMode
        })
      });

      if (!response.ok) throw new Error(await response.text());

      const routeData = await response.json();
      displayRoute(routeData);
    } catch (error) {
      console.error('Route error:', error);
      alert('Erro ao calcular rota: ' + error.message);
    }
  }

  function displayRoute(routeData) {
    if (window.routeLayer) map.removeLayer(window.routeLayer);

    // Criar GeoJSON feature para a rota
    const routeFeature = {
      type: 'Feature',
      properties: {
        summary: {
          distance: routeData.distance,
          duration: routeData.duration
        }
      },
      geometry: routeData.geometry
    };

    const line = L.geoJSON(routeFeature, {
      style: {
        color: getCongestionColor(routeData.congestion),
        weight: 6,
        opacity: 0.8
      }
    }).addTo(map);

    window.routeLayer = line;
    map.fitBounds(line.getBounds());

    updateRouteInfo(routeData);
  }

  function getCongestionColor(congestionData) {
    if (!congestionData || congestionData.length === 0) return '#2ecc71';

    // Calcular congestionamento médio (se disponível)
    const avgCongestion = congestionData.reduce((sum, val) => sum + val, 0) / congestionData.length;

    if (avgCongestion > 3.5) return '#e74c3c';
    if (avgCongestion > 2) return '#f39c12';
    return '#2ecc71';
  }

  function updateRouteInfo(routeData) {
    document.getElementById('routeDuration').textContent = `${Math.ceil(routeData.duration / 60)} min`;
    document.getElementById('routeDistance').textContent = `${(routeData.distance / 1000).toFixed(1)} km`;

    const transportMode = document.getElementById('transportMode').value;
    const co2 = calculateCO2(transportMode, routeData.distance);
    document.getElementById('routeCo2').textContent = `${co2}g CO₂`;
  }

  function calculateCO2(mode, distance) {
    const factors = {
      driving: 150,
      transit: 50,
      bicycling: 0,
      walking: 0
    };
    return ((factors[mode] || 0) * distance / 1000).toFixed(0);
  }
});