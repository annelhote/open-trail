import { Grid2 } from "@mui/material";
import maplibregl from "maplibre-gl";
import React, { useEffect, useRef, useState } from "react";
import {
  default as ReactMapGL,
  FullscreenControl,
  Layer,
  NavigationControl,
  Source,
} from "react-map-gl";

import { CustomMarker, CustomPopup } from "../popup";

const mapStyle = {
  version: 8,
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "raster-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const Map = ({
  gpxs,
  markers,
  selectedFilters,
}) => {
  const mapRef = useRef();

  const [selectedMarker, setSelectedMarker] = useState();

  const closePopup = () => setSelectedMarker();
  const openPopup = (index) => setSelectedMarker(index);

  useEffect(() => {
    if (mapRef && mapRef.current) {
      const bounds = gpxs.reduce(
        (acc, cur) => ({
          minLon: Math.min(acc.minLon, cur?.tracks?.[0]?.bounds[0]),
          minLat: Math.min(acc.minLat, cur?.tracks?.[0]?.bounds[1]),
          maxLon: Math.max(acc.maxLon, cur?.tracks?.[0]?.bounds[2]),
          maxLat: Math.max(acc.maxLat, cur?.tracks?.[0]?.bounds[3]),
        }),
        {
          minLon: gpxs?.[0]?.tracks?.[0]?.bounds[0],
          minLat: gpxs?.[0]?.tracks?.[0]?.bounds[1],
          maxLon: gpxs?.[0]?.tracks?.[0]?.bounds[2],
          maxLat: gpxs?.[0]?.tracks?.[0]?.bounds[3],
        },
      );
      mapRef.current.fitBounds([bounds.minLon, bounds.minLat, bounds.maxLon, bounds.maxLat]);
    }
  }, [gpxs]);

  return (
    <Grid2 className="map" size={{ xs: 12 }}>
      <ReactMapGL
        id="map"
        initialViewState={{ bounds: gpxs?.[0]?.tracks?.[0]?.bounds }}
        interactiveLayerIds={["path"]}
        mapLib={maplibregl}
        mapStyle={mapStyle}
        ref={mapRef}
      >
        {gpxs.map((gpx, index) => (
          <Source data={gpx.toGeoJSON()} key={`gpx-${index}`} type="geojson">
            <Layer
              id={`path-${index}`}
              layout={{ "line-join": "round", "line-cap": "round" }}
              paint={{
                "line-color": index % 2 ? "#9A9EEC" : "#5756A6",
                "line-width": 3,
              }}
              type="line"
            />
          </Source>
        ))}
        {selectedMarker && (
          <CustomPopup
            closePopup={closePopup}
            index={selectedMarker}
            marker={markers[selectedMarker]}
          />
        )}
        {markers
          .filter((marker) => selectedFilters.includes(marker.type))
          .map((marker, index) => (
            <CustomMarker
              index={index}
              key={`marker-${index}`}
              marker={marker}
              openPopup={openPopup}
            />
          ))}
        <FullscreenControl />
        <NavigationControl />
      </ReactMapGL>
    </Grid2>
  );
};

export default Map;
