import { Grid } from '@mui/material';
import maplibregl from 'maplibre-gl';
import React, { useState } from 'react';
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

const Map = ({ coordinates, gpx, markers, selectedFilters, setCoordinates }) => {
  const [selectedMarker, setSelectedMarker] = useState();

  const closePopup = () => setSelectedMarker();
  const openPopup = (index) => setSelectedMarker(index);

  return (
    <Grid className="map" item xs={12}>
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
        onMouseEnter={(e) => setCoordinates({ lat: e.lngLat.lat, lon: e.lngLat.lng })}
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
          markers.filter((marker) => selectedFilters.includes(marker.type)).map((marker, index) => (
            <CustomMarker
              key={`marker-${index}`}
              index={index}
              marker={marker}
              openPopup={openPopup}
            />
          ))
        }
      </ReactMapGL>
    </Grid>
  )
}

export default Map;
