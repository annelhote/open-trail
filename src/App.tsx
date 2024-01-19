import maplibregl, { Style } from 'maplibre-gl';
// import { useEffect, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl';

import { clusterLayer, lineLayer, unclusteredPointLayer } from './layers.ts';
import './index.css';

const points: any = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {
      id: 3,
      name: 'Van Woustraat'
    },
    geometry: { type: 'Point', coordinates: [4.901, 52.3554, 0] }
  },
  {
    type: 'Feature',
    properties: {
      id: 4,
      name: 'Huidenstraat'
    },
    geometry: { type: 'Point', coordinates: [4.8855, 52.3689, 0] }
  },
  {
    type: 'Feature',
    properties: {
      id: 42,
      name: 'Wycker Brugstraat'
    },
    geometry: { type: 'Point', coordinates: [2.4028425, 48.8957273, 0] }
  },
  {
    type: 'Feature',
    properties: {
      id: 8,
      name: 'Pantin'
    },
    geometry: { type: 'Point', coordinates: [5.6976, 50.8493, 0] }
  }]
};

const lineStrings: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        properties: {},
        coordinates: [
          [5.6976, 50.8493],
          [2.4028425, 48.8957273],
          [4.8855, 52.3689],
          [4.901, 52.3554]
        ]
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        properties: {},
        coordinates: [
          [-122.48369693756104, 37.83381888486939],
          [-122.48348236083984, 37.83317489144141],
          [-122.48339653015138, 37.83270036637107],
          [-122.48356819152832, 37.832056363179625],
          [-122.48404026031496, 37.83114119107971],
          [-122.48404026031496, 37.83049717427869],
          [-122.48348236083984, 37.829920943955045],
          [-122.48356819152832, 37.82954808664175],
          [-122.48507022857666, 37.82944639795659],
          [-122.48610019683838, 37.82880236636284],
          [-122.48695850372314, 37.82931081282506],
          [-122.48700141906738, 37.83080223556934],
          [-122.48751640319824, 37.83168351665737],
          [-122.48803138732912, 37.832158048267786],
          [-122.48888969421387, 37.83297152392784],
          [-122.48987674713133, 37.83263257682617],
          [-122.49043464660643, 37.832937629287755],
          [-122.49125003814696, 37.832429207817725],
          [-122.49163627624512, 37.832564787218985],
          [-122.49223709106445, 37.83337825839438],
          [-122.49378204345702, 37.83368330777276]
        ]
      }
    }
  ]
};

const STYLE: Style = {
  version: 8,
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'raster-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export default function App() {
  /*
  const [storeGeo, setStoreGeo] = useState<any>(lineStrings);

  useEffect(() => {
    fetch("https://api.aceandtate.com/api/locations/full")
      .then((res) => res.json())
      .then((res) => {
        const locations = res?.map((location) => ({
          type: "Feature",
          properties: {
            id: location.id,
            street: location.street
          },
          geometry: {
            type: "Point",
            coordinates: [location.longitude, location.latitude, 0]
          }
        }));

        setStoreGeo({
          type: "FeatureCollection",
          crs: {
            type: "name",
            properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" }
          },
          features: locations
        });
      });
  }, []);
  */

  return (
    <Map
      mapLib={maplibregl}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle={STYLE}
      initialViewState={{
        latitude: 49.8242289,
        longitude: 4.8557294,
        zoom: 6
      }}
    >
      <Source
        id="LineString"
        type="geojson"
        data={lineStrings}
      >
        <Layer {...lineLayer} />
      </Source>
      <Source
        id="Points"
        type="geojson"
        data={points}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...unclusteredPointLayer} />
      </Source>
    </Map>
  );
}
