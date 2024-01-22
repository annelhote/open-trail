import gpxParser from 'gpxparser';
import maplibregl from 'maplibre-gl';
import Map, { Source, Layer } from 'react-map-gl';
import { useEffect, useState } from 'react';

import { lineLayer } from '../../layers.ts';
// import { downSampleArray } from '../../utils.js';

import gpxFile from '../../data/le-poet-sigillat.gpx';

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

function MyMap() {
  const [distance, setDistance] = useState(0);
  const [elevation, setElevation] = useState({});
  const [geoJson, setGeoJson] = useState({ type: 'FeatureCollection', features: [] });

  useEffect(() => {
    fetch(gpxFile)
      .then((res) => res.text())
      .then((xml) => {
        const gpx = new gpxParser();
        gpx.parse(xml);
        setDistance(gpx.tracks[0].distance.total);
        // const positions = gpx.tracks[0].points.map(p => [p.lat, p.lon, p.ele]);
        // const coordinatesDataCount = positions.length;
        // const targetPathDataCount = Math.pow(coordinatesDataCount, 1);
        // const pathSamplingPeriod = Math.floor(coordinatesDataCount / targetPathDataCount);
        // const downSampledCoordinates = downSampleArray(positions, pathSamplingPeriod);
        setGeoJson(gpx.toGeoJSON());
        // setStoreGeo({
        //   type: 'FeatureCollection',
        //   features: [
        //     {
        //       type: 'Feature',
        //       geometry: {
        //         type: 'LineString',
        //         coordinates: downSampledCoordinates.map((c) => [c[1], c[0]])
        //       }
        //     },
        //   ]
        // });
        setElevation(gpx.calcElevation(gpx.tracks[0].points));
        console.log(elevation);
      });
  }, [elevation]);

  return (
    <>
      <div style={{ width: "50%", margin: "auto" }}>
        {Math.floor(distance / 100)} km // {Math.floor(elevation.pos)} D+
      </div>
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
          data={geoJson}
        >
          <Layer {...lineLayer} />
        </Source>
      </Map>
    </>
  )
}

export default MyMap;
