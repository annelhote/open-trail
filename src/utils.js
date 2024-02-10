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

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

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

const getDataFromOverpass = (bbox) => {
  const query = `
    [out:json][timeout:500];
    (
      nwr["amenity"~"cafe|drinking_water|restaurant|toilets|water_point"](around:1000,${bbox});
      nwr["landuse"~"cemetery"](around:1000,${bbox});
      nwr["shop"~"deli|department_store|food|general|mall|supermarket"](around:1000,${bbox});
      nwr["tourism"~"alpine_hut|apartment|camp_site|chalet|guest_house|hostel|hotel|motel|wilderness_hut"](around:1000,${bbox});
    );
    out center;
  `;
  return axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
}

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
    cafe: {
      category: 'eau',
      color: '#996600',
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
    motel: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'motel',
    },
    shelter: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'abri',
    },
    wilderness_hut: {
      category: 'hébergement',
      color: '#f2df16',
      icon: faHouse,
      label: 'cabane en pleine nature',
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
    food: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'alimentation',
    },
    general: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'alimentation générale',
    },
    mall: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'centre commercial',
    },
    supermarket: {
      category: 'alimentation',
      color: '#006633',
      icon: faCartShopping,
      label: 'supermarché',
    },
    cemetery: {
      category: 'eau',
      color: '#0099ff',
      icon: faFaucetDrip,
      label: 'cimetière',
    },
    drinking_water: {
      category: 'eau',
      color: '#0099ff',
      icon: faFaucetDrip,
      label: 'eau potable',
    },
    water_point: {
      category: 'eau',
      color: '#0099ff',
      icon: faFaucetDrip,
      label: "point d'eau",
    },
    restaurant: {
      category: 'alimentation',
      color: '#f21629',
      icon: faUtensils,
      label: 'restaurant',
    },
    toilets: {
      category: 'eau',
      color: '#f3802e',
      icon: faRestroom,
      label: 'toilettes',
    }
  }
  return types?.[type] ?? { category:'unknown', color: '#e4e5e6', icon: faQuestion };
}

export {
  capitalize,
  chunkArray,
  downloadGpx,
  downSampleArray,
  getDataFromOverpass,
  getMarkerFromType,
}
