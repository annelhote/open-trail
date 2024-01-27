import axios from 'axios';
import maplibregl from 'maplibre-gl';
import Map, { Layer, Marker, Source } from 'react-map-gl';

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
      // tileSize: 256
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

function makeOverpassQuery(qstrg) {
  const overpassQuery = `
    node(3470507586);   // starting here...
    complete(100) { nwr[amenity=pub](around:500); };
    out center;
  `;
  return overpassQuery;
}

const latlons = [];
// node(3470507586);
// 44.9918299
// 4.9789472



// Saint-Marcel-lès-Valence
// 26320
// 44.988977, 4.966287

// double latitude = location.getLatitude();
// double longitude = location.getLongitude();

// // 6378000 Size of the Earth (in meters)
// double longitudeD = (Math.asin(1000 / (6378000 * Math.cos(Math.PI*latitude/180))))*180/Math.PI;
// double latitudeD = (Math.asin((double)1000 / (double)6378000))*180/Math.PI;

// double latitudeMax = latitude+(latitudeD);
// double latitudeMin = latitude-(latitudeD);
// double longitudeMax = longitude+(longitudeD);
// double longitudeMin = longitude-(longitudeD);

// (latitudeMin,longitudeMin,latitudeMax,longitudeMax)
const query = `
  [out:json];
  node(44.98284655416309,4.966244641623936,45.00081324583691,4.991649758376065);
  complete(100) { nwr[amenity=pub](around:500); };
  out center;
`;
axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
  .then((response) => {
    // Handle the response data here
    const restaurants = response.data.elements.filter(node => node.tags && node.tags.name);
    response.data.elements.forEach(restaurant => {
      const rname = restaurant.tags.name ? restaurant.tags.name : undefined;
      latlons.push([[restaurant.lat, restaurant.lon], rname]);
    });
    // addMarkers(latlons);
  })
  .catch(error => {
    console.log("error", error);
  });

function MyMap({ gpx }) {
  return (
    <Map
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
      <Marker longitude={12.550343} latitude={55.665957} />
    </Map>
  )
}

export default MyMap;
