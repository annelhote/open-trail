import maplibregl from 'maplibre-gl';
import Map, { Source, Layer } from 'react-map-gl';

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

function MyMap({ gpx }) {
  return (
    <Map
      mapLib={maplibregl}
      style={{ width: "910px", height: "500px", margin: "auto" }}
      mapStyle={STYLE}
      initialViewState={{
        latitude: 44.6937849,
        longitude: 5.36890464,
        zoom: 8
      }}
    >
      <Source
        id="LineString"
        type="geojson"
        data={gpx.toGeoJSON()}
      >
        <Layer {...lineLayer} />
      </Source>
    </Map>
  )
}

export default MyMap;
