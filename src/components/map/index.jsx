import axios from 'axios';
import maplibregl from 'maplibre-gl';
import React, { useEffect, useState } from 'react';
import { default as ReactMapGL, Layer, Source, Marker } from 'react-map-gl';

import { lineLayer } from '../../layers.ts';

const STYLE = {
  version: 8,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256
    },
    osm: {
      type: 'vector',
      tiles: [
        'https://vtiles.openhistoricalmap.org/maps/osm/{z}/{x}/{y}.pbf'
      ],
    }
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'raster-tiles',
      // source: 'osm',
      minzoom: 0,
      maxzoom: 19
    }
  ]
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

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

const getMarkerColorByType = (amenity) => {
  let icon = 'marker_11';
  switch (amenity) {
    case 'alpine_hut':
    case 'apartment':
    case 'camp_site':
    case 'chalet':
    case 'guest_house':
    case 'hostel':
    case 'hotel':
    case 'motel':
    case 'wilderness_hut':
      icon = '#f2df16';
      break;
    case 'cafe':
      icon = '#996600';
      break;
    case 'deli':
    case 'department_store':
    case 'food':
    case 'general':
    case 'mall':
    case 'supermarket':
      icon = '#006633';
      break;
    case 'drinking_water':
    case 'water_point':
      icon = '#0099ff';
      break;
    case 'restaurant':
      icon = '#f21629';
      break;
    case 'toilets':
      icon = '#f3802e';
      break;
    default:
      break;
  }
  return icon;
}

const getDataFromOverpass = (bbox) => {
  const query = `
    [out:json][timeout:500];
    (
      nwr["amenity"~"cafe|drinking_water|restaurant|toilets|water_point"](around:1000,${bbox});
      nwr["tourism"~"alpine_hut|apartment|camp_site|chalet|guest_house|hostel|hotel|motel|wilderness_hut"](around:1000,${bbox});
      nwr["shop"~"deli|department_store|food|general|mall|supermarket"](around:1000,${bbox});
    );
    out center;
  `;
  return axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
}

function Map({ gpx }) {
  const [markers, setMarkers] = useState([]);

  const coordinatesDataCount = gpx.tracks[0].points.length;
  const targetPathDataCount = Math.pow(coordinatesDataCount, 0.7);
  const pathSamplingPeriod = Math.floor(coordinatesDataCount / targetPathDataCount);
  const downSampledCoordinates = downSampleArray(gpx.tracks[0].points, pathSamplingPeriod);
  let chunks = chunkArray(downSampledCoordinates, 20);
  chunks = chunks.map((chunk) => chunk.map((item) => [item.lat, item.lon]).flat());
  
  useEffect(() => {
    Promise.all(chunks.map((chunk) => getDataFromOverpass(chunk)))
      .then((responses) => {
        const response = responses.map((response) => response.data.elements).flat();
        setMarkers(response.map((item) => ({
          email: item?.tags?.email,
          id: item?.id,
          lat: item?.lat ?? item?.center?.lat,
          lon: item?.lon ?? item?.center?.lon,
          name: item?.tags?.name,
          phone: item?.tags?.phone ?? item?.tags?.['contact:phone'],
          type: item?.tags?.amenity ?? item?.tags?.tourism ?? '',
          website: item?.tags?.website,
        })));
      })
      .catch(error => {
        console.log("error", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (markers.length === 0) {
    return (
      <div>
        Loading ...
      </div>
    )
  }

  return (
    <ReactMapGL
      id="map"
      initialViewState={{
        latitude: 44.6937849,
        longitude: 5.36890464,
        zoom: 8
      }}
      mapLib={maplibregl}
      mapStyle={STYLE}
    >
      <Source
        data={gpx.toGeoJSON()}
        id="LineString"
        type="geojson"
      >
        <Layer {...lineLayer} />
      </Source>
      {markers.map((marker, index) => (
        <Marker
          color={getMarkerColorByType(marker.type)}
          key={`marker-${index}`}
          latitude={marker.lat}
          longitude={marker.lon}
          popup={new maplibregl.Popup({ className: 'popup' }).setHTML(`
            <div className='popup'>
              <h3>${marker.name}</h3>
              <div>
                <ul>
                  <li>${marker.type}</li>
                  <li>${marker.phone}</li>
                  <li>${marker.email}</li>
                  <li>${marker.website}</li>
                </ul>
              </div>
            </div>
          `)}
        />
      ))}
    </ReactMapGL>
  )
}

export default Map;
