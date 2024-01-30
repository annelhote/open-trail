import axios from 'axios';
import maplibregl from 'maplibre-gl';
import React, { useEffect, useState } from 'react';
import { default as ReactMapGL, Layer, Source } from 'react-map-gl';

import { CustomMarker, CustomPopup } from '../popup';

const mapStyle = {
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

function Map({ coordinates, gpx, setCoordinates }) {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState();

  const coordinatesDataCount = gpx.tracks[0].points.length;
  const targetPathDataCount = Math.pow(coordinatesDataCount, 0.7);
  const pathSamplingPeriod = Math.floor(coordinatesDataCount / targetPathDataCount);
  const downSampledCoordinates = downSampleArray(gpx.tracks[0].points, pathSamplingPeriod);
  let chunks = chunkArray(downSampledCoordinates, 20);
  chunks = chunks.map((chunk) => chunk.map((item) => [item.lat, item.lon]).flat());

  const closePopup = () => setSelectedMarker();
  const openPopup = (index) => setSelectedMarker(index);

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
          type: item?.tags?.amenity ?? item?.tags?.tourism ?? item?.tags?.shop ?? '',
          website: item?.tags?.website,
        })));
      })
      .catch((error) => {
        console.log('error', error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (markers.length === 0) {
    return (
      <div>
        Loading data ...
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
      interactiveLayerIds={["path"]}
      mapLib={maplibregl}
      mapStyle={mapStyle}
      onMouseLeave={() => setCoordinates()}
      onMouseEnter={(e) => setCoordinates(e.lngLat)}
    >
      <Source
        data={gpx.toGeoJSON()}
        type="geojson"
      >
        <Layer
          id="path"
          layout={{ "line-join": "round", "line-cap": "round" }}
          paint={{ "line-color": '#10a4e5', "line-width": 3 }}
          type="line"
        />
      </Source>
      {coordinates && (
        <Source
          data={{ coordinates, type: "Point" }}
          type="geojson"
        >
          <Layer
            paint={{ "circle-color": "red", "circle-radius": 7 }}
            type="circle"
          />
        </Source>
      )}
      {
        selectedMarker &&
        <CustomPopup
          closePopup={closePopup}
          index={selectedMarker}
          marker={markers[selectedMarker]}
        />
      }
      {
        markers.map((marker, index) => (
          <CustomMarker
            key={`marker-${index}`}
            index={index}
            marker={marker}
            openPopup={openPopup}
          />
        ))
      }
    </ReactMapGL >
  )
}

export default Map;
