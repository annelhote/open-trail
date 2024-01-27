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

function Map({ gpx }) {
  const [features, setFeatures] = useState([]);
  const oneKmInDegree = 0.0089982311916;
  const point = gpx.tracks[0].points[0];
  const bbox = [point.lat - oneKmInDegree, point.lon - oneKmInDegree, point.lat + oneKmInDegree, point.lon + oneKmInDegree];

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

  useEffect(() => {
    const query = `
      [timeout:25][out:json][bbox:${bbox}];
      (
        nwr["amenity"~"cafe|drinking_water|restaurant|toilets|water_point"];
        nwr["tourism"~"camp_site|hotel"];
      );
      out center;
    `;
    axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      .then((response) => {
        setFeatures(response.data.elements.map((element) => ({
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
  }, [])

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
      style={{ height: "500px" }}
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
