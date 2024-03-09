import {
  faCartShopping,
  faCoffee,
  faFaucetDrip,
  faHouse,
  faQuestion,
  faRestroom,
  faUtensils,
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
// 100 m of positiv elevation means 611 m of distance
const getITRADistanceSecond = ({ distance, elevation}) => distance + (elevation / 100 * 0.611);

const getMarkerFromType = (type) => {
  const types = {
    alpine_hut: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'hutte',
    },
    apartment: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'appartement',
    },
    bar: {
      category: 'eau',
      color: '#0099ff',
      icon: faCoffee,
      label: 'bar',
    },
    cafe: {
      category: 'eau',
      color: '#0099ff',
      icon: faCoffee,
      label: 'café',
    },
    camp_site: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'camping',
    },
    chalet: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'chalet',
    },
    cemetery: {
      category: 'eau',
      color: '#0099ff',
      icon: faFaucetDrip,
      label: 'cimetière',
    },
    convenience: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'supérette',
    },
    deli: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'épicerie fine',
    },
    department_store: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'grand magasin',
    },
    drinking_water: {
      category: 'eau',
      color: '#0099ff',
      icon: faFaucetDrip,
      label: 'eau potable',
    },
    food: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'alimentation',
    },
    friend: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'ami',
    },
    general: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'alimentation générale',
    },
    guest_house: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: "maison d'hôtes",
    },
    hostel: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'auberge',
    },
    hotel: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'hôtel',
    },
    mall: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'centre commercial',
    },
    motel: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'motel',
    },
    restaurant: {
      category: 'restaurant',
      color: '#006633',
      icon: faUtensils,
      label: 'restaurant',
    },
    shelter: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'abri',
    },
    supermarket: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'supermarché',
    },
    toilets: {
      category: 'eau',
      color: '#0099ff',
      icon: faRestroom,
      label: 'toilettes',
    },
    tourism: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'tourisme',
    },
    water_point: {
      category: 'eau',
      color: '#0099ff',
      icon: faFaucetDrip,
      label: "point d'eau",
    },
    wilderness_hut: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'cabane en pleine nature',
    }
  }
  return types?.[type] ?? { category:'unknown', color: '#e4e5e6', icon: faQuestion };
}

const getTypeFromName = (name) => {
  return name.toLowerCase().includes('refugio') ? 'hostel' : '';
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
  getITRADistanceSecond,
  getMarkerFromType,
  getTypeFromName,
}
