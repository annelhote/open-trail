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
import { useNavigate, useParams } from "react-router-dom";

import Filters from "../components/filters";
import MyMap from "../components/map";
import Overview from "../components/overview";
import Planner from "../components/planner";
import Profile from "../components/profile";
import Stage from "../components/stage";
import gpxCheminDassise from "../data/chemin-d-assise-01.gpx";
import gpxGr38 from "../data/gr38.gpx";
import gpxLaChapelleEnVercorsLePoet from "../data/la-chapelle-en-vercors-le-poet.gpx";
import gpxNantesEchalas from "../data/nantes-echalas.gpx";
import gpxPicosDeEuropa from "../data/picos-de-europa.gpx";
import gpxTourDuQueyras from "../data/tour-du-queyras.gpx";
import data from "../data/data.json";
import {
  chunkArray,
  downSampleArray,
  getClosestPointByCoordinates,
  getClosestPointIndexByDistance,
  getDataFromOverpass,
  getMarkerFromType,
  getTypeFromName,
  overloadGpx,
} from "../utils";

const Trail = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [coordinates, setCoordinates] = useState();
  const [days, setDays] = useState([]);
  const [filters, setFilters] = useState({});
  const [gpx, setGpx] = useState();
  const [gpxComplete, setGpxComplete] = useState();
  const [gpxs, setGpxs] = useState();
  const [markers, setMarkers] = useState([]);
  const [meta, setMeta] = useState(data?.[params?.id] ?? {});
  const [selectedFilters, setSelectedFilters] = useState([]);

  const gpxes = {
    "chemin-d-assise-01": gpxCheminDassise,
    gr38: gpxGr38,
    "le-poet-sigillat": gpxLaChapelleEnVercorsLePoet,
    "nantes-echalas": gpxNantesEchalas,
    "picos-de-europa": gpxPicosDeEuropa,
    "tour-du-queyras": gpxTourDuQueyras,
  };
  meta.gpx = gpxes[params?.id];
  meta.kmPerDay = meta?.kmPerDay ?? 25;

  const onChange = (event) => {
    const eventName = event.target.name;
    const isCategory = Object.keys(filters).includes(eventName);
    if (selectedFilters.includes(eventName)) {
      let excluded = [eventName];
      if (isCategory) {
        excluded = [...excluded, filters[eventName].data];
      }
      setSelectedFilters(
        selectedFilters.filter((item) => !excluded.includes(item))
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
    fetch(meta?.gpx)
      .then((res) => res.text())
      .then((xml) => {
        let newGpx = new gpxParser();
        newGpx.parse(xml);
        newGpx = overloadGpx(newGpx);
        // Calculate days
        const duration = Math.ceil(
          newGpx.tracks[0].distance.totalItra / 1000 / meta.kmPerDay
        );
        const days = [...Array(duration).keys()].map((day) => day + 1);
        setDays(days);
        // Determinates each day
        const cumulDistances = [0, ...newGpx.tracks[0].distance.cumulItra];
        const gpxs = days.map((day) => {
          const startPointIndex = getClosestPointIndexByDistance({
            cumulDistances,
            distance: meta.kmPerDay * 1000 * (day - 1),
          });
          const endPointIndex = getClosestPointIndexByDistance({
            cumulDistances,
            distance: meta.kmPerDay * 1000 * day,
          });
          const trkpts = newGpx.tracks[0].points
            .slice(startPointIndex, endPointIndex + 1)
            .map(
              (point) =>
                `<trkpt lat="${point.lat}" lon="${point.lon}"><ele>${point.ele}</ele></trkpt>`
            );
          let partGpx = new gpxParser();
          partGpx.parse(
            `<xml><gpx><trk><trkseg>${trkpts}</trkseg></trk></gpx></xml>`
          );
          partGpx = overloadGpx(partGpx);
          return partGpx;
        });
        setGpxs(gpxs);
        setGpxComplete(newGpx);

        // Load markers
        const coordinatesDataCount = newGpx.tracks[0].points.length;
        const targetPathDataCount = Math.pow(coordinatesDataCount, 0.7);
        const pathSamplingPeriod = Math.floor(
          coordinatesDataCount / targetPathDataCount
        );
        const downSampledCoordinates = downSampleArray(
          newGpx.tracks[0].points,
          pathSamplingPeriod
        );
        let chunks = chunkArray(downSampledCoordinates, 20);
        chunks = chunks.map((chunk) =>
          chunk.map((item) => [item.lat, item.lon]).flat()
        );

        Promise.all(chunks.map((chunk) => getDataFromOverpass(chunk)))
          .then((responses) => {
            const response = responses
              .map((response) => response.data.elements)
              .flat();
            let markersTmp = response.map((item) => {
              const type =
                item?.tags?.amenity ??
                item?.tags?.landuse ??
                item?.tags?.shop ??
                item?.tags?.tourism ??
                "";
              return {
                addrHousenumber: item?.tags?.["addr:housenumber"],
                addrStreet: item?.tags?.["addr:street"],
                email: item?.tags?.email,
                id: item?.id,
                lat: item?.lat ?? item?.center?.lat,
                lon: item?.lon ?? item?.center?.lon,
                name: item?.tags?.name,
                note: item?.tags?.note,
                osmType: item?.type,
                phone:
                  item?.tags?.phone?.replace(/ /g, "") ??
                  item?.tags?.["contact:phone"]?.replace(/ /g, ""),
                type,
                website: item?.tags?.website,
                ...getMarkerFromType(type),
              };
            });
            // Add custom markers
            const customMarkers = (meta?.markers ?? []).map((marker) => ({
              ...marker,
              ...getMarkerFromType(marker.type),
            }));
            // Add markers from GPX
            const gpxMarkers = (newGpx?.waypoints ?? []).map((marker) => ({
              ...marker,
              ...getMarkerFromType(
                marker?.type ?? getTypeFromName(marker.name)
              ),
            }));
            markersTmp = [...markersTmp, ...customMarkers, ...gpxMarkers];
            // Remove duplicates based on lat,lon
            markersTmp = [
              ...new Map(
                markersTmp.map((value) => [`${value.lat},${value.lon}`, value])
              ).values(),
            ];
            // Add distance from start
            markersTmp = markersTmp.map((marker) => {
              const closestPoint = getClosestPointByCoordinates({
                coordinates: marker,
                gpx: newGpx,
              });
              const distance = (
                newGpx.calcDistanceBetween(marker, closestPoint.point) +
                cumulDistances[closestPoint.index] / 1000
              ).toFixed(1);
              // TODO calculate distance ITRA instead
              return { distance, ...marker };
            });
            newGpx.waypoints = markersTmp;
            setMarkers(markersTmp);
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((e) => console.error(e));
  }, [meta?.gpx, meta.kmPerDay, meta?.markers]);

  useEffect(() => {
    setGpx(params?.day ? gpxs?.[params.day - 1] : gpxComplete);
  }, [gpxComplete, gpxs, params.day]);

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
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
          >
            <Grid item xs={12}>
              <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
                <Link underline="hover" color="inherit" href="#">
                  Open Trails
                </Link>
                <Link underline="hover" color="inherit" href="#/trails">
                  Trails
                </Link>
                <Typography>{meta.name}</Typography>
              </Breadcrumbs>
            </Grid>
            <Overview gpx={gpx} meta={meta} setMeta={setMeta} />
            {markers.length === 0 ? (
              <Grid item xs={12}>
                Chargement des données ...
              </Grid>
            ) : (
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
                                ? navigate(`/trails/${params.id}`)
                                : navigate(
                                    `/trails/${params.id}/${e.target.value}`
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
                                  label={`Jour ${day}`}
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
                    <Profile gpx={gpx} coordinates={coordinates} />
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
                      markers={markers}
                      meta={meta}
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
                    {days &&
                      days.map((day, index) => (
                        <Stage
                          day={day}
                          gpx={gpxs[index]}
                          key={index}
                          markers={markers}
                        />
                      ))}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </>
  );
};

export default Trail;
