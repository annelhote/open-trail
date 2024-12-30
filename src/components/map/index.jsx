import { Grid } from "@mui/material";
import gpxParser from "gpxparser";
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
import { getClosestPointIndexByDistance } from "../../utils";

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
  coordinates,
  gpx,
  markers,
  selectedFilters,
  setCoordinates,
  settings,
}) => {
  const mapRef = useRef();

  const [gpxs, setGpxs] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState();

  const closePopup = () => setSelectedMarker();
  const openPopup = (index) => setSelectedMarker(index);

  useEffect(() => {
    // Calculate number of days in trail
    // TODO: Do it in the trail page in order to avoid duplicated code
    const distanceTmp = (settings?.itra ? gpx.tracks[0].distance.totalItra : gpx.tracks[0].distance.total) / 1000;
    const duration = Math.ceil(distanceTmp.toFixed(1) / settings.kmPerDay)
    const days = [...Array(duration).keys()];
    // Determinates each step
    const points = gpx.tracks[0].points;
    const cumulDistances = settings?.itra ? gpx.tracks[0].distance.cumulItra : gpx.tracks[0].distance.cumul;
    const gpxsTmp = days.map((day) => {
      const startPointIndex = getClosestPointIndexByDistance({
        cumulDistances,
        distance: settings.kmPerDay * 1000 * day,
      });
      const endPointIndex = getClosestPointIndexByDistance({
        cumulDistances,
        distance: settings.kmPerDay * 1000 * (day + 1),
      });
      const trkpts = points
        .slice(startPointIndex, endPointIndex + 1)
        .map(
          (point) =>
            `<trkpt lat="${point.lat}" lon="${point.lon}"><ele>${point.ele}</ele></trkpt>`
        );
      const newGpx = new gpxParser();
      newGpx.parse(
        `<xml><gpx><trk><trkseg>${trkpts}</trkseg></trk></gpx></xml>`
      );
      return newGpx;
    });
    setGpxs(gpxsTmp);
    if (mapRef && mapRef.current) {
      mapRef.current.fitBounds(gpx.tracks[0].bounds);
    }
  }, [gpx, settings?.itra, settings?.kmPerDay]);

  return (
    <Grid className="map" item xs={12}>
      <ReactMapGL
        id="map"
        initialViewState={{ bounds: gpx.tracks[0].bounds }}
        interactiveLayerIds={["path"]}
        mapLib={maplibregl}
        mapStyle={mapStyle}
        onMouseLeave={() => setCoordinates()}
        onMouseEnter={(e) =>
          setCoordinates({ lat: e.lngLat.lat, lon: e.lngLat.lng })
        }
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
        {coordinates && (
          <Source data={{ coordinates, type: "Point" }} type="geojson">
            <Layer
              paint={{ "circle-color": "red", "circle-radius": 7 }}
              type="circle"
            />
          </Source>
        )}
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
    </Grid>
  );
};

export default Map;
