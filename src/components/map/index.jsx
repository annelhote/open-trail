import axios from 'axios';
import maplibregl from 'maplibre-gl';
import React, { useEffect, useState } from 'react';
import { default as ReactMapGL, Layer, Marker, Source } from 'react-map-gl';

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
    'osm': {
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

function Map({ gpx }) {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const query = `
      [timeout:25][out:json][bbox:44.989387797074784,4.955606247791736,44.99931182955835,4.999551560291735];
      nwr["amenity"~"restaurant|drinking_water"];
      out center;
    `;
    axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      .then((response) => {
        setMarkers(response.data.elements.map((element) => ({
          lat: element?.lat ?? element?.center?.lat,
          lon: element?.lon ?? element?.center?.lon,
          name: element?.tags?.name ?? '',
          type: element?.tags?.amenity ?? '',
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
      {markers.map((marker) => <Marker latitude={marker.lat} longitude={marker.lon} />)}
    </ReactMapGL>
  )
}

export default Map;
