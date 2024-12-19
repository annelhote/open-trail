import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  FormControl,
  FormControlLabel,
  Grid,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import gpxParser from "gpxparser";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Filters from "../components/filters";
import MyMap from "../components/map";
import Overview from "../components/overview";
import Planner from "../components/planner";
import Profile from "../components/profile";
import Stage from "../components/stage";
import {
  chunkArray,
  downSampleArray,
  getClosestPointByCoordinates,
  getClosestPointIndexByDistance,
  getDataFromOverpass,
  // getDefaultKmPerDayPerActivity,
  getMarkerFromTypeOrName,
  overloadGpx,
} from "../utils";

const Trail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [coordinates, setCoordinates] = useState();
  const [days, setDays] = useState([]);
  const [filters, setFilters] = useState({});
  const [gpx, setGpx] = useState();
  const [gpxComplete, setGpxComplete] = useState();
  const [gpxs, setGpxs] = useState();
  const [markers, setMarkers] = useState([]);
  const [meta, setMeta] = useState({});
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    setMeta(state);
  }, [state]);

  useEffect(() => {
    const getData = async () => {
      if (meta.gpx) {
        // Parse GPX
        let gpxCompleteTmp = new gpxParser();
        gpxCompleteTmp.parse(meta?.gpx);
        gpxCompleteTmp = overloadGpx(gpxCompleteTmp);
        setGpxComplete(gpxCompleteTmp);
        // Compute days
        const duration = Math.ceil(
          gpxCompleteTmp.tracks[0].distance.totalItra / 1000 / meta?.kmPerDay,
        );
        const daysTmp = [...Array(duration).keys()].map((day) => day + 1);
        setDays(daysTmp);
        // Compute GPXs
        const cumulDistances = [0, ...gpxCompleteTmp.tracks[0].distance.cumulItra];
        const gpxsTmp = daysTmp.map((day) => {
          const startPointIndex = getClosestPointIndexByDistance({
            cumulDistances,
            distance: meta.kmPerDay * 1000 * (day - 1),
          });
          const endPointIndex = getClosestPointIndexByDistance({
            cumulDistances,
            distance: meta.kmPerDay * 1000 * day,
          });
          const trkpts = gpxCompleteTmp.tracks[0].points
            .slice(startPointIndex, endPointIndex + 1)
            .map(
              (point) =>
                `<trkpt lat="${point.lat}" lon="${point.lon}"><ele>${point.ele}</ele></trkpt>`,
            );
          let partGpx = new gpxParser();
          partGpx.parse(
            `<xml><gpx><trk><trkseg>${trkpts}</trkseg></trk></gpx></xml>`,
          );
          partGpx = overloadGpx(partGpx);
          return partGpx;
        });
        setGpxs(gpxsTmp);

        // Add custom markers
        const customMarkers = (meta?.markers ?? []).map((marker) => ({
          ...marker,
          ...getMarkerFromTypeOrName(marker),
        }));
        // Add markers from GPX
        const gpxMarkers = (gpxCompleteTmp?.waypoints ?? []).map((marker) => ({
          ...marker,
          ...getMarkerFromTypeOrName(marker),
        }));
        let allMarkers = [...customMarkers, ...gpxMarkers];
        // Compute markers from OpenStreetMap
        const promises = gpxsTmp.map(async (gpx, index) => {
          const coordinatesDataCount = gpx.tracks[0].points.length;
          const targetPathDataCount = Math.pow(coordinatesDataCount, 0.7);
          const pathSamplingPeriod = Math.floor(
            coordinatesDataCount / targetPathDataCount
          );
          const downSampledCoordinates = downSampleArray(
            gpx.tracks[0].points,
            pathSamplingPeriod
          );

          let chunks = chunkArray(downSampledCoordinates, 20);
          chunks = chunks.map((chunk) =>
            chunk.map((item) => [item.lat, item.lon]).flat()
          );

          const responses = await Promise.all(chunks.map((chunk) => getDataFromOverpass(chunk)));
          const jsons = await Promise.all(responses.map((response) => response.json()));
          return jsons.map((json) => json?.elements ?? []).flat().map((item) => {
            const type =
              item?.tags?.amenity ??
              item?.tags?.landuse ??
              item?.tags?.shop ??
              item?.tags?.tourism ??
              item?.tags?.railway ??
              "";
            return {
              addrCity: item?.tags?.["addr:city"],
              addrHousenumber: item?.tags?.["addr:housenumber"],
              addrStreet: item?.tags?.["addr:street"],
              day: (index + 1).toString(),
              email: item?.tags?.email,
              id: item?.id,
              lat: item?.lat ?? item?.center?.lat,
              lon: item?.lon ?? item?.center?.lon,
              name: item?.tags?.name,
              note: item?.tags?.note,
              opening_hours: item?.tags?.opening_hours,
              osmType: item?.type,
              phone:
                item?.tags?.phone?.replace(/ /g, "") ??
                item?.tags?.["contact:phone"]?.replace(/ /g, ""),
              type,
              website: item?.tags?.website,
              ...getMarkerFromTypeOrName({ type }),
            };
          });
        });
        const markersByDay = await Promise.all(promises);
        allMarkers = [
          ...allMarkers,
          ...markersByDay.flat(),
        ]
        // Remove duplicated markers based on lat,lon
        allMarkers = [
          ...new Map(
            allMarkers.map((value) => [`${value.lat},${value.lon}`, value]),
          ).values(),
        ];
        // Add distance from start
        allMarkers = allMarkers.map((marker) => {
          const closestPoint = getClosestPointByCoordinates({
            coordinates: marker,
            gpx: gpxCompleteTmp,
          });
          // TODO fix distance calculation
          const distance = (
            gpxCompleteTmp.calcDistanceBetween(marker, closestPoint.point) +
            gpxCompleteTmp.tracks[0].distance.cumulItra[closestPoint.index] / 1000
          ).toFixed(1);
          return { distance, ...marker };
        });
        setMarkers(allMarkers);
      }
    }

    getData();
  }, [meta.gpx, meta.kmPerDay, meta?.markers]);

  useEffect(() => {
    setGpx(params?.day ? gpxs?.[params.day - 1] : gpxComplete);
  }, [gpxComplete, gpxs, params.day]);

  const onChange = (event) => {
    const eventName = event.target.name;
    const isCategory = Object.keys(filters).includes(eventName);
    if (selectedFilters.includes(eventName)) {
      let excluded = [eventName];
      if (isCategory) {
        excluded = [...excluded, filters[eventName].data];
      }
      setSelectedFilters(
        selectedFilters.filter((item) => !excluded.includes(item)),
      );
    } else {
      let added = [eventName];
      if (isCategory) {
        added = [...added, ...filters[eventName].data];
      }
      setSelectedFilters([...selectedFilters, ...added]);
    }
  };

  useEffect(() => {
    const filtersTmp = {};
    markers.forEach((marker) => {
      if (!Object.keys(filtersTmp).includes(marker.category))
        filtersTmp[marker.category] = { color: marker.color, data: [] };
      if (!filtersTmp[marker.category].data.includes(marker.type))
        filtersTmp[marker.category].data.push(marker.type);
    });
    setFilters(filtersTmp);
  }, [markers]);

  useEffect(() => {
    let selectedFiltersTmp = Object.keys(filters);
    selectedFiltersTmp.forEach((item) => {
      selectedFiltersTmp = [...selectedFiltersTmp, ...filters[item].data];
    });
    setSelectedFilters(selectedFiltersTmp);
  }, [filters]);

  return (
    <>
      {gpx && (
        <Box className="open-trail" sx={{ flexGrow: 0.75 }}>
          <Grid
            columns={{ xs: 4, sm: 8, md: 12 }}
            container
            spacing={{ xs: 2, md: 3 }}
          >
            <Grid item xs={12}>
              <Breadcrumbs aria-label="breadcrumb" color="color.secondary">
                <Link underline="hover" color="inherit" href="#">
                  Open Trail
                </Link>
                <Link underline="hover" color="inherit" href="#/trails">
                  Trails
                </Link>
                {params?.day && (
                  <Link
                    underline="hover"
                    color="inherit"
                    href={`#/trails/${params.id}`}
                  >
                    {meta?.name}
                  </Link>
                )}
                {params?.day ? (
                  <Typography>Jour {params?.day}</Typography>
                ) : (
                  <Typography>{meta?.name}</Typography>
                )}
              </Breadcrumbs>
            </Grid>
            <Overview
              gpx={gpx}
              markers={markers}
              meta={meta}
              setMeta={setMeta}
            />
            {/* {markers.length === 0 ? (
              <Grid item xs={12}>
                Chargement des données ...
              </Grid>
            ) : ( */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  aria-controls="panel1-content"
                  id="panel1-header"
                  expandIcon={<ExpandMoreIcon />}
                >
                  Filtres
                </AccordionSummary>
                <AccordionDetails>
                  <Filters
                    filters={filters}
                    markers={markers}
                    onChange={onChange}
                    selectedFilters={selectedFilters}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion defaultExpanded>
                <AccordionSummary
                  aria-controls="panel2-content"
                  id="panel2-header"
                  expandIcon={<ExpandMoreIcon />}
                >
                  Carte
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                      <MyMap
                        coordinates={coordinates}
                        gpx={gpx}
                        markers={markers}
                        meta={meta}
                        selectedFilters={selectedFilters}
                        setCoordinates={setCoordinates}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <FormControl>
                        <RadioGroup
                          aria-labelledby="radio-buttons-group-label-day"
                          defaultValue="all"
                          name="radio-buttons-group-day"
                          onChange={(e) =>
                            e.target.value === "all"
                              ? navigate(`/trails/trail`, {
                                state: meta,
                              })
                              : navigate(
                                `/trails/trail/${e.target.value}`,
                                { state: meta },
                              )
                          }
                          value={params?.day ?? "all"}
                        >
                          <FormControlLabel
                            value="all"
                            control={<Radio />}
                            key="day-all"
                            label="Tous"
                          />
                          {days &&
                            days.map((day) => (
                              <FormControlLabel
                                value={day}
                                control={<Radio />}
                                key={`day-${day}`}
                                label={`Jour ${day} - ${meta?.startDate
                                  .add(day - 1, "day")
                                  .format("dddd	DD MMMM")}`}
                              />
                            ))}
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  aria-controls="panel3-content"
                  id="panel3-header"
                  expandIcon={<ExpandMoreIcon />}
                >
                  Profile
                </AccordionSummary>
                <AccordionDetails>
                  <Profile
                    coordinates={coordinates}
                    gpx={gpx}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  aria-controls="panel4-content"
                  id="panel4-header"
                  expandIcon={<ExpandMoreIcon />}
                >
                  Déroulé
                </AccordionSummary>
                <AccordionDetails>
                  <Planner
                    gpx={gpx}
                    markers={
                      params?.day
                        ? markers
                          .filter((marker) => marker.day === params?.day)
                          .sort((a, b) => a.day - b.day)
                        : markers.sort((a, b) => a.distance - b.distance)
                    }
                    selectedFilters={selectedFilters}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  aria-controls="panel5-content"
                  id="panel5-header"
                  expandIcon={<ExpandMoreIcon />}
                >
                  Etapes
                </AccordionSummary>
                <AccordionDetails>
                  {params?.day ? (
                    <Stage
                      day={params.day}
                      gpx={gpx}
                      markers={markers}
                      meta={meta}
                    />
                  ) : (
                    days.map((day, index) => (
                      <Stage
                        day={day}
                        gpx={gpxs[index]}
                        key={index}
                        markers={markers}
                        meta={meta}
                      />
                    ))
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
            {/* )} */}
          </Grid>
        </Box>
      )}
    </>
  );
};

export default Trail;
