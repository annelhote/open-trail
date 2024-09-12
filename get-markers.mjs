// node get-markers.mjs le-poet-sigillat
import {
  faCartShopping,
  faChampagneGlasses,
  faCoffee,
  faFaucetDrip,
  faHouse,
  faQuestion,
  faRestroom,
} from "@fortawesome/free-solid-svg-icons";
import fs from "fs";
import gpxParser from "gpxparser";

import data from "./src/data/data.json" assert { type: "json" };

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const downloadGpx = ({ gpx, markers }) => {
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
      let sym1 = "";
      if (wpt.category === "hébergement") sym1 = "friends-home";
      if (wpt.category === "alimentation") sym1 = "stores-supermarket";
      if (wpt.category === "sorties") sym1 = "restaurant-restaurant";
      if (wpt.category === "eau") sym1 = "tourism-drinkingwater";
      if (sym1.length > 0) {
        const sym = source.createElementNS(
          "http://www.topografix.com/GPX/1/1",
          "sym"
        );
        sym.appendChild(source.createTextNode(sym1));
        node.appendChild(sym);
      }
    }
    root.appendChild(node);
  };
  console.log(gpx);
  fs.writeFileSync(`./src/data/${gpx.metadata.name}-generated.gpx`, new window.XMLSerializer().serializeToString(source), "utf-8");
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

const getMarkerFromType = (type) => {
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
    motel: {
      category: "hébergement",
      color: "#F3B95F",
      icon: faHouse,
      label: "motel",
    },
    restaurant: {
      category: "sorties",
      color: "#E26352",
      icon: faChampagneGlasses,
      label: "restaurant",
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
  return (
    types?.[type] ?? {
      category: "autre",
      color: "#a9a9a9",
      icon: faQuestion,
      label: type,
    }
  );
};

const getGpx = async (trailId) => {
  try {
    const data = fs.readFileSync(`./src/data/${trailId}.gpx`, "utf-8");
    const gpx = new gpxParser();
    gpx.parse(data);
    return gpx;
  } catch (error) {
    console.error("Error reading file:", error);
    return;
  }
};

const overloadGpx = (gpx) => {
  // Compute cumulative positiv elevation and ITRA distance at each point of the Route/Track
  const cumulItra = [];
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

const getMarkers = async (gpx) => {
  // Compute markers from OpenStreetMap
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

  let responses = await Promise.all(
    chunks.map((chunk) => getDataFromOverpass(chunk))
  );
  console.log('flag_04');
  // Needed to make it work
  console.log(responses);
  responses = await Promise.all(responses.map((response) => response.json()));
  responses = responses.map((response) => response.elements).flat();

  console.log('flag_05');
  console.log(responses);
  let markers = [];
  const markersTmp = responses.map((marker) => {
    const type =
      marker?.tags?.amenity ??
      marker?.tags?.landuse ??
      marker?.tags?.shop ??
      marker?.tags?.tourism ??
      "";
    return {
      addrHousenumber: marker?.tags?.["addr:housenumber"],
      addrStreet: marker?.tags?.["addr:street"],
      // day: (index + 1).toString(),
      email: marker?.tags?.email,
      id: marker?.id,
      lat: marker?.lat ?? marker?.center?.lat,
      lon: marker?.lon ?? marker?.center?.lon,
      name: marker?.tags?.name,
      note: marker?.tags?.note,
      osmType: marker?.type,
      phone:
        marker?.tags?.phone?.replace(/ /g, "") ??
        marker?.tags?.["contact:phone"]?.replace(/ /g, ""),
      type,
      website: marker?.tags?.website,
      ...getMarkerFromType(type),
    };
  });
  markers = markers.concat(markersTmp);
  // Remove duplicated markers based on lat,lon
  markers = [
    ...new Map(
      markers.map((value) => [`${value.lat},${value.lon}`, value])
    ).values(),
  ];
  // Add distance from start
  markers = markers.map((marker) => {
    const closestPoint = getClosestPointByCoordinates({
      coordinates: marker,
      gpx,
    });
    // TODO fix distance calculation
    const distance = (
      gpx.calcDistanceBetween(marker, closestPoint.point) +
      gpx.tracks[0].distance.cumulItra[closestPoint.index] / 1000
    ).toFixed(1);
    return { distance, ...marker };
  });
  return markers;
};

if (process.argv.length === 3) {
  const trailId = process.argv[2];
  const trailName = data?.[trailId]?.name;
  if (trailName) {
    console.log('1. Read GPX file');
    let gpx = await getGpx(trailId);
    console.log('2. Overload GPX');
    gpx = overloadGpx(gpx);
    console.log('3. Load markers');
    const markers = await getMarkers(gpx);
    console.log('4. Write GPX file');
    await downloadGpx({ gpx, markers });
    console.log('5. Done');
  } else {
    console.error(
      `This trailId "${trailId}" is not in local config file "./src/data/data.json".`
    );
  }
} else {
  console.error(
    "Misuse, this command line require one and only one argument : trail id"
  );
}
