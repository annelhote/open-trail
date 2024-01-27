import axios from 'axios';
import maplibregl from 'maplibre-gl';
import React, { useEffect, useState } from 'react';
import { default as ReactMapGL, Layer, Source } from 'react-map-gl';

import { lineLayer, pointLayer } from '../../layers.ts';

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
  sprite: 'https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite',
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

const getPointIcon = (amenity) => {
  let icon = 'marker_11';
  switch (amenity) {
    case 'cafe':
      icon = 'beer_11';
      break;
    case 'camp_site':
      icon = 'campsite_11';
      break;
    case 'drinking_water':
    case 'water_point':
      icon = 'drinking_water_11';
      break;
    case 'hotel':
      icon = 'lodging_11';
      break;
    case 'restaurant':
      icon = 'restaurant_11';
      break;
    case 'toilets':
      icon = 'toilet_11';
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
      nwr["tourism"~"camp_site|hotel"](around:1000,${bbox});
    );
    out center;
  `;
  return axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
}

function Map({ gpx }) {
  const [features, setFeatures] = useState([]);

  const coordinatesDataCount = gpx.tracks[0].points.length;
  const targetPathDataCount = Math.pow(coordinatesDataCount, 0.7);
  const pathSamplingPeriod = Math.floor(coordinatesDataCount / targetPathDataCount);
  const downSampledCoordinates = downSampleArray(gpx.tracks[0].points, pathSamplingPeriod);
  let chunks = chunkArray(downSampledCoordinates, 100);
  chunks = chunks.map((chunk) => chunk.map((item) => [item.lat, item.lon]).flat());
  
  useEffect(() => {
    Promise.all(chunks.map((chunk) => getDataFromOverpass(chunk)))
      .then((responses) => {
        const response = responses.map((response) => response.data.elements).flat();
        setFeatures(response.map((element) => ({
          type: 'Feature',
          properties: {
            description: element?.tags?.name ?? '',
            icon: getPointIcon(element?.tags?.amenity ?? element?.tags?.tourism ?? '')
          },
          geometry: {
            type: 'Point',
            coordinates: [element?.lon ?? element?.center?.lon, element?.lat ?? element?.center?.lat]
          }
        })));
      })
      .catch(error => {
        console.log("error", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (features.length === 0) {
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
        id="LineString"
        type="geojson"
        data={gpx.toGeoJSON()}
      >
        <Layer {...lineLayer} />
      </Source>
      <Source
        id="places"
        type="geojson"
        data={{
          type: "FeatureCollection",
          features,
        }}
      >
        <Layer {...pointLayer} />
      </Source>
    </ReactMapGL>
  )
}

export default Map;
