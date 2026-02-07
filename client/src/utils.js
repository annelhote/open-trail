import {
  faBeerMugEmpty,
  faCartShopping,
  faChampagneGlasses,
  faCoffee,
  faFaucetDrip,
  faHouse,
  faMonument,
  faMountain,
  faQuestion,
  faRestroom,
  faSeedling,
  faShower,
  faSnowflake,
  faStar,
  faTrain,
  faTree,
} from "@fortawesome/free-solid-svg-icons";
import XmlBeautify from "xml-beautify";

const capitalize = (string) =>
  !string ? "" : string.charAt(0).toUpperCase() + string.slice(1);

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const downloadGpx = ({ gpx, markers, settings }) => {
  const link = document.createElement("a");
  const source = gpx.xmlSource;
  const root = source.getElementsByTagName("gpx")[0];
  for (let i = 0; i < markers.length; i++) {
    const wpt = markers[i];
    const node = source.createElementNS(
      "http://www.topografix.com/GPX/1/1",
      "wpt"
    );
    node.setAttribute("lat", wpt.lat);
    node.setAttribute("lon", wpt.lon);
    if ((wpt?.label?.length ?? 0) > 0) {
      const name = source.createElementNS(
        "http://www.topografix.com/GPX/1/1",
        "name"
      );
      name.appendChild(source.createTextNode(wpt.label));
      node.appendChild(name);
    }
    if ((wpt?.name?.length ?? 0) > 0) {
      const desc = source.createElementNS(
        "http://www.topografix.com/GPX/1/1",
        "desc"
      );
      desc.appendChild(source.createTextNode(wpt.name));
      node.appendChild(desc);
    }
    if (wpt?.category) {
      let symValue = "";
      if (wpt.category === "hébergement") symValue = "friends-home";
      if (wpt.category === "alimentation") symValue = "stores-supermarket";
      if (wpt.category === "sorties") symValue = "restaurant-restaurant";
      if (wpt.category === "eau") symValue = "tourism-drinkingwater";
      if (symValue.length > 0) {
        const sym = source.createElementNS(
          "http://www.topografix.com/GPX/1/1",
          "sym"
        );
        sym.appendChild(source.createTextNode(symValue));
        node.appendChild(sym);
      }
    }
    // TODO: export marker type
    // if (wpt?.category) {
    //   let typeValue = "";
    //   if (wpt.category === "hébergement") typeValue = "friends-home";
    //   if (typeValue.length > 0) {
    //     const type = source.createElementNS(
    //       "http://www.topografix.com/GPX/1/1",
    //       "type"
    //     );
    //     type.appendChild(source.createTextNode(typeValue));
    //     node.appendChild(type);
    //   }
    // }
    root.appendChild(node);
  }
  link.href = URL.createObjectURL(
    new Blob([new XmlBeautify().beautify((new XMLSerializer()).serializeToString(source))], {
      type: "text/csv;charset=utf-8",
    })
  );
  link.setAttribute("download", `${settings.name}.gpx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downSampleArray = (input, period) => {
  if (period < 1 || period % 1 !== 0) {
    throw new TypeError("Period must be an integer greater than or equal to 1");
  }
  if (period === 1) {
    return [...input];
  }
  const output = [];
  for (let i = 0; i < input.length; i += period) {
    output.push(input[i]);
  }
  return output;
};

const getClosestPointByCoordinates = ({ coordinates, gpx }) => {
  const points = gpx.tracks[0].points;
  const closestPoint = points.reduce(
    (accumulator, currentValue, index) =>
      gpx.calcDistanceBetween(currentValue, coordinates) < accumulator.distance
        ? {
            distance: gpx.calcDistanceBetween(currentValue, coordinates),
            point: currentValue,
            index,
          }
        : accumulator,
    {
      distance: gpx.tracks[0].distance.total,
      point: points[points.length - 1],
      index: points.length - 1,
    }
  );
  return closestPoint;
};

const getClosestPointIndexByDistance = ({ cumulDistances, distance }) => {
  const closestDistance = cumulDistances.reduce(
    (previous, current, index) =>
      Math.abs(distance - current) < Math.abs(distance - previous.distance)
        ? { distance: current, index }
        : previous,
    {
      distance: cumulDistances[cumulDistances.length - 1],
      index: cumulDistances.length - 1,
    }
  );
  return closestDistance.index;
};

const getDataFromOverpass = (bbox) => {
  const query = `
    [out:json][timeout:500];
    (
      nwr["amenity"~"cafe|drinking_water|restaurant|toilets|water_point"](around:1000,${bbox});
      nwr["landuse"~"cemetery"](around:1000,${bbox});
      nwr["shop"~"convenience|deli|department_store|food|general|mall|supermarket"](around:1000,${bbox});
      nwr["tourism"~"alpine_hut|apartment|camp_site|chalet|guest_house|hostel|hotel|motel|wilderness_hut"](around:1000,${bbox});
      nwr["amenity"="shower"](around:1000,${bbox});
      nwr["railway"="station"](around:10000,${bbox});
    );
    out center;
  `;
  return fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  );
};

// 100 m of positiv elevation means 1 km of distance
const getITRADistance = ({ distance, elevation }) => distance + elevation / 100;

const getMarkerFromTypeOrName = (marker) => {
  if (!marker?.type && marker?.sym) marker.type = marker.sym;
  const types = {
    alpine_hut: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "hutte",
    },
    apartment: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "appartement",
    },
    attraction: {
      category: "attraction",
      color: "#134E13",
      icon: faStar,
      label: "attraction",
    },
    bar: {
      category: "eau",
      color: "#1993D0",
      icon: faCoffee,
      label: "bar",
    },
    cafe: {
      category: "sorties",
      color: "#E26352",
      icon: faChampagneGlasses,
      label: "café",
    },
    camp_site: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "camping",
    },
    chalet: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "chalet",
    },
    cemetery: {
      category: "eau",
      color: "#1993D0",
      icon: faFaucetDrip,
      label: "cimetière",
    },
    convenience: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "supérette",
    },
    "convenience;gas": {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "supérette",
    },
    deli: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "épicerie fine",
    },
    department_store: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "grand magasin",
    },
    drinking_water: {
      category: "eau",
      color: "#1993D0",
      icon: faFaucetDrip,
      label: "eau potable",
    },
    food: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "alimentation",
    },
    friend: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "ami",
    },
    frozen_food: {
      category: "alimentation",
      color: "#409D44",
      icon: faSnowflake,
      label: "surgelés",
    },
    fuel: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "station service",
    },
    general: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "alimentation générale",
    },
    grass: {
      category: "attraction",
      color: "#134E13",
      icon: faSeedling,
      label: "pelouse",
    },
    guest_house: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "maison d'hôtes",
    },
    health_food: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "bien-être",
    },
    hostel: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "auberge",
    },
    hotel: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "hôtel",
    },
    mall: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "centre commercial",
    },
    monument: {
      category: "attraction",
      color: "#134E13",
      icon: faMonument,
      label: "monument",
    },
    motel: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "motel",
    },
    park: {
      category: "attraction",
      color: "#134E13",
      icon: faTree,
      label: "parc",
    },
    peak: {
      category: "attraction",
      color: "#134E13",
      icon: faMountain,
      label: "sommet",
    },
    pub: {
      category: "sorties",
      color: "#E26352",
      icon: faBeerMugEmpty,
      label: "pub",
    },
    restaurant: {
      category: "sorties",
      color: "#E26352",
      icon: faChampagneGlasses,
      label: "restaurant",
    },
    'restaurant;shelter': {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "abri / restaurant",
    },
    seafood: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "poissonnerie",
    },
    shelter: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "abri",
    },
    shower: {
      category: "eau",
      color: "#1993D0",
      icon: faShower,
      label: "douches",
    },
    station: {
      category: "transport",
      color: "#AC4FC6",
      icon: faTrain,
      label: "gare ferroviaire"
    },
    supermarket: {
      category: "alimentation",
      color: "#409D44",
      icon: faCartShopping,
      label: "supermarché",
    },
    toilets: {
      category: "eau",
      color: "#1993D0",
      icon: faRestroom,
      label: "toilettes",
    },
    tourism: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "tourisme",
    },
    water_point: {
      category: "eau",
      color: "#1993D0",
      icon: faFaucetDrip,
      label: "point d'eau",
    },
    wilderness_hut: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "cabane en pleine nature",
    },
  };
  if (marker?.type && types?.[marker.type.toLowerCase()]) {
    return types[marker.type.toLowerCase()]
  }
  if (marker?.name && Object.values(types).find(type => type.label === marker.name.toLowerCase())) {
    return Object.values(types).find(type => type.label === marker.name.toLowerCase());
  }
  return {
    category: "autre",
    color: "#a9a9a9",
    icon: faQuestion,
    label: "autre",
  };
};

const getPois = async ({ gpxs }) => {
  let allMarkers = [];
  // Compute markers from OpenStreetMap
  const promises = gpxs.map(async (gpx, index) => {
    const coordinatesDataCount = gpx.tracks[0].points.length;
    const targetPathDataCount = Math.pow(coordinatesDataCount, 0.7);
    const pathSamplingPeriod = Math.floor(
      coordinatesDataCount / targetPathDataCount
    );
    const downSampledCoordinates = downSampleArray(
      gpx.tracks[0].points,
      pathSamplingPeriod
    );

    let chunks = chunkArray(downSampledCoordinates, 20);
    chunks = chunks.map((chunk) =>
      chunk.map((item) => [item.lat, item.lon]).flat()
    );

    const responses = await Promise.all(chunks.map((chunk) => getDataFromOverpass(chunk)));
    const jsons = await Promise.all(responses.map((response) => response.json()));
    return jsons.map((json) => json?.elements ?? []).flat().map((item) => {
      const type =
        item?.tags?.amenity ??
        item?.tags?.landuse ??
        item?.tags?.shop ??
        item?.tags?.tourism ??
        item?.tags?.railway ??
        "";
      const closestPoint = getClosestPointByCoordinates({ coordinates: item, gpx });
      const distance = ((gpx.calcDistanceBetween(item, closestPoint.point) + gpx.tracks[0].distance.cumul[closestPoint.index]) / 1000).toFixed(1);
      return {
        addrCity: item?.tags?.["addr:city"],
        addrHousenumber: item?.tags?.["addr:housenumber"],
        addrStreet: item?.tags?.["addr:street"],
        distance,
        day: (index + 1).toString(),
        email: item?.tags?.email,
        id: item?.id,
        lat: item?.lat ?? item?.center?.lat,
        lon: item?.lon ?? item?.center?.lon,
        name: item?.tags?.name,
        note: item?.tags?.note,
        opening_hours: item?.tags?.opening_hours,
        osmType: item?.type,
        phone:
          item?.tags?.phone?.replace(/ /g, "") ??
          item?.tags?.["contact:phone"]?.replace(/ /g, ""),
        type,
        website: item?.tags?.website,
        ...getMarkerFromTypeOrName({ type }),
      };
    });
  });
  const markersByDay = await Promise.all(promises);
  allMarkers = [
    ...allMarkers,
    ...markersByDay.flat(),
  ]
  // Remove duplicated markers based on lat,lon
  allMarkers = [
    ...new Map(
      allMarkers.map((value) => [`${value.lat},${value.lon}`, value]),
    ).values(),
  ];
  return allMarkers;
};

const overloadGpx = (gpx) => {
  // Compute cumulative positiv elevation and ITRA distance at each point of the Route/Track
  const cumulItra = [0];
  const cumulElevation = [];
  let itraValue = 0;
  let elevationValue = 0;
  const points = gpx.tracks[0].points;
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLon = points[0].lon;
  let maxLon = points[0].lon;
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
    minLat = Math.min(minLat, points[i].lat);
    maxLat = Math.max(maxLat, points[i].lat);
    minLon = Math.min(minLon, points[i].lon);
    maxLon = Math.max(maxLon, points[i].lon);
  }
  gpx.tracks[0].distance.cumulItra = cumulItra;
  gpx.tracks[0].distance.totalItra = itraValue;
  gpx.tracks[0].distance.cumulElevation = cumulElevation;
  gpx.tracks[0].distance.totalElevation = elevationValue;
  const boundsMargin = Math.min(maxLon - minLon, maxLat - minLat) / 5;
  gpx.tracks[0].bounds = [
    minLon - boundsMargin,
    minLat - boundsMargin,
    maxLon + boundsMargin,
    maxLat + boundsMargin,
  ];
  return gpx;
};

export {
  capitalize,
  downloadGpx,
  getClosestPointIndexByDistance,
  getITRADistance,
  getMarkerFromTypeOrName,
  getPois,
  overloadGpx,
};
