const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializando o client do Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.calculateRoute = async (userId, localizacao, destino, transporte) => {
  try {
    const validDestination = await validateDestination(destino);
    if (!validDestination) throw new Error('Destino inválido');

    const googleRoute = await getGoogleMapsRoute(localizacao, destino, transporte);

    await saveRoute(userId, localizacao, destino, transporte);

    return {
      distance: googleRoute.distance,
      duration: googleRoute.duration,
      geometry: googleRoute.geometry,
      congestion: googleRoute.congestion
    };
  } catch (error) {
    throw error;
  }
};

function getGoogleTravelMode(transporte) {
  const modes = {
    driving: 'driving',
    walking: 'walking',
    bicycling: 'bicycling',
    transit: 'transit'
  };
  return modes[transporte] || 'driving';
}

async function getGoogleMapsRoute(origin, destination, transporte) {
  const travelMode = getGoogleTravelMode(transporte);

  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/directions/json',
    {
      params: {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode: travelMode,
        key: process.env.GOOGLE_MAPS_API_KEY,
        alternatives: false,
        traffic_model: 'best_guess',
        departure_time: 'now'
      }
    }
  );

  if (response.data.status !== 'OK') {
    throw new Error(`Google Maps API error: ${response.data.status}`);
  }

  const route = response.data.routes[0];
  const leg = route.legs[0];

  let congestion = null;
  if (leg.traffic_speed_entry && travelMode === 'driving') {
    congestion = leg.traffic_speed_entry.map(entry => {
      const trafficLevels = {
        'UNKNOWN': 0,
        'FREE_FLOW': 1,
        'TRAFFIC_JAM': 5,
        'SLOW_TRAFFIC': 3,
        'CONGESTION': 4
      };
      return trafficLevels[entry] || 0;
    });
  }

  const geometry = decodePolyline(route.overview_polyline.points);

  return {
    distance: leg.distance.value,
    duration: leg.duration_in_traffic?.value || leg.duration.value,
    geometry: {
      type: 'LineString',
      coordinates: geometry
    },
    congestion: congestion
  };
}

function decodePolyline(encoded) {
  const points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lng * 1e-5, lat * 1e-5]);
  }

  return points;
}

async function validateDestination(destino) {
  return !!destino;
}

async function saveRoute(userId, localizacao, destino, transporte) {
  const { data, error } = await supabase
    .from('pontos')
    .insert([
      {
        id_pontos: userId,
        origem_latitude: localizacao.latitude,
        origem_longitude: localizacao.longitude,
        destino_id: destino.idDestino,
        transporte: transporte
      }
    ]);

  if (error) throw error;
  return data;
}