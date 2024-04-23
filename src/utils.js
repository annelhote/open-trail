import {
  faCartShopping,
  faChampagneGlasses,
  faCoffee,
  faFaucetDrip,
  faHouse,
  faQuestion,
  faRestroom,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const capitalize = (string) => !string ? '' : string.charAt(0).toUpperCase() + string.slice(1);

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

const downloadGpx = ({ gpx, meta }) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(gpx.xmlSource)], { type: 'text/csv;charset=utf-8' }));
  link.setAttribute('download', `${meta.id}.gpx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downSampleArray = (input, period) => {
  if (period < 1 || period % 1 !== 0) {
    throw new TypeError('Period must be an integer greater than or equal to 1')
  }
  if (period === 1) {
    return [...input]
  }
  const output = []
  for (let i = 0; i < input.length; i += period) {
    output.push(input[i])
  }
  return output
}

const getClosestPointByCoordinates = ({ coordinates, gpx }) => {
  const points = gpx.tracks[0].points;
  const closestPoint = points.reduce(
    (accumulator, currentValue, index) => gpx.calcDistanceBetween(currentValue, coordinates) < accumulator.distance ? { distance: gpx.calcDistanceBetween(currentValue, coordinates), point: currentValue, index } : accumulator,
    { distance: gpx.tracks[0].distance.total, point: points[points.length - 1], index: points.length - 1 },
  );
  return closestPoint;
}

const getClosestPointIndexByDistance = ({ cumulDistances, distance }) => {
  const closestDistance = cumulDistances.reduce(
    (previous, current, index) => Math.abs(distance - current) < Math.abs(distance - previous.distance) ? { distance: current, index } : previous,
    { distance: cumulDistances[cumulDistances.length - 1], index: cumulDistances.length - 1 }
  );
  return closestDistance.index;
}

const getDataFromOverpass = (bbox) => {
  const query = `
    [out:json][timeout:500];
    (
      nwr["amenity"~"cafe|drinking_water|restaurant|toilets|water_point"](around:1000,${bbox});
      nwr["landuse"~"cemetery"](around:1000,${bbox});
      nwr["shop"~"convenience|deli|department_store|food|general|mall|supermarket"](around:1000,${bbox});
      nwr["tourism"~"alpine_hut|apartment|camp_site|chalet|guest_house|hostel|hotel|motel|wilderness_hut"](around:1000,${bbox});
    );
    out center;
  `;
  return axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
}

// 100 m of positiv elevation means 1 km of distance
const getITRADistance = ({ distance, elevation}) => distance + (elevation / 100);

const getMarkerFromType = (type) => {
  const types = {
    alpine_hut: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'hutte',
    },
    apartment: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'appartement',
    },
    bar: {
      category: 'eau',
      color: '#1993D0',
      icon: faCoffee,
      label: 'bar',
    },
    cafe: {
      category: 'sorties',
      color: '#E26352',
      icon: faChampagneGlasses,
      label: 'café',
    },
    camp_site: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'camping',
    },
    chalet: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'chalet',
    },
    cemetery: {
      category: 'eau',
      color: '#1993D0',
      icon: faFaucetDrip,
      label: 'cimetière',
    },
    convenience: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'supérette',
    },
    'convenience;gas': {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'supérette',
    },
    deli: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'épicerie fine',
    },
    department_store: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'grand magasin',
    },
    drinking_water: {
      category: 'eau',
      color: '#1993D0',
      icon: faFaucetDrip,
      label: 'eau potable',
    },
    food: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'alimentation',
    },
    friend: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'ami',
    },
    fuel: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'station service',
    },
    general: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'alimentation générale',
    },
    guest_house: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: "maison d'hôtes",
    },
    health_food: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'bien-être',
    },
    hostel: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'auberge',
    },
    hotel: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'hôtel',
    },
    mall: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'centre commercial',
    },
    motel: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'motel',
    },
    restaurant: {
      category: 'sorties',
      color: '#E26352',
      icon: faChampagneGlasses,
      label: 'restaurant',
    },
    seafood: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'poissonnerie',
    },
    shelter: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'abri',
    },
    supermarket: {
      category: 'alimentation',
      color: '#409D44',
      icon: faCartShopping,
      label: 'supermarché',
    },
    toilets: {
      category: 'eau',
      color: '#1993D0',
      icon: faRestroom,
      label: 'toilettes',
    },
    tourism: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'tourisme',
    },
    water_point: {
      category: 'eau',
      color: '#1993D0',
      icon: faFaucetDrip,
      label: "point d'eau",
    },
    wilderness_hut: {
      category: 'hébergement',
      color: '#F3B95F',
      icon: faHouse,
      label: 'cabane en pleine nature',
    }
  }
  return types?.[type] ?? { category: 'autre', color: '#a9a9a9', icon: faQuestion, label: type };
}

const getTypeFromName = (name) => {
  return name.toLowerCase().includes('refugio') ? 'hostel' : '';
}

const overloadGpx = (gpx) => {
  // Compute cumulative positiv elevation and ITRA distance at each point of the Route/Track
  const cumulItra = [];
  const cumulElevation = [];
  let itraValue = 0;
  let elevationValue = 0;
  const points = gpx.tracks[0].points;
  for (let i = 0; i < points.length - 1; i++) {
    const pointFrom = points[i];
    const pointTo = points[i + 1];
    let distance = gpx.calcDistanceBetween(pointFrom, pointTo);
    const elevation = pointTo.ele - pointFrom.ele;
    if (elevation > 0) {
      distance += elevation * 10;
      elevationValue += elevation;
    }
    itraValue += distance;
    cumulItra.push(itraValue);
    cumulElevation.push(elevationValue);
  }
  gpx.tracks[0].distance.cumulItra = cumulItra;
  gpx.tracks[0].distance.totalItra = itraValue;
  gpx.tracks[0].distance.cumulElevation = cumulElevation;
  gpx.tracks[0].distance.totalElevation = elevationValue;
  return gpx;
}

export {
  capitalize,
  chunkArray,
  downloadGpx,
  downSampleArray,
  getClosestPointByCoordinates,
  getClosestPointIndexByDistance,
  getDataFromOverpass,
  getITRADistance,
  getMarkerFromType,
  getTypeFromName,
  overloadGpx,
}
