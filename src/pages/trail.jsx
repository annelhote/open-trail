import {
  faFlagCheckered,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  FormControl,
  FormControlLabel,
  Grid2,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
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
  getClosestPointIndexByDistance,
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
  const [settings, setSettings] = useState({});
  const [selectedFilters, setSelectedFilters] = useState([]);

  // If there is a trailId in the url params (meaning a GPX file in public/data), use it as settings
  // Else if there is a state (meaning uploaded GPX file), use it as settings
  useEffect(() => {
    const getGpxFromTrailId = async () => {
      const trailId = params?.trailId;
      const file = await fetch(`/open-trail/data/${trailId}.gpx`);
      const _gpx = await file.text();
      setSettings({
        gpx: _gpx,
        itra: false,
        kmPerDay: 20,
        name: trailId,
        startDate: dayjs(new Date().toISOString().split("T")[0]),
      });
    }

    if (!settings?.gpx) {
      if (params?.trailId) {
        getGpxFromTrailId();
      } else if (state) setSettings(state);
    }
  }, [params?.trailId, settings?.gpx, state]);

  // If gpx in settings, parse GPX
  useEffect(() => {
    if (settings?.gpx) {
      let gpxCompleteTmp = new gpxParser();
      gpxCompleteTmp.parse(settings?.gpx);
      gpxCompleteTmp = overloadGpx(gpxCompleteTmp);
      const metadata = JSON.parse(gpxCompleteTmp.metadata.desc);
      if (metadata?.startDate) metadata.startDate = dayjs(metadata.startDate);
      setSettings({
        ...settings,
        ...metadata,
      });
      setGpxComplete(gpxCompleteTmp);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.gpx]);

  // If GPX Complete has been computed, calculate distance, duration ...
  useEffect(() => {
    if (gpxComplete) {
      // Compute days
      // TODO: Do it in the trail page in order to avoid duplicated code
      const distanceTmp = (settings?.itra ? gpxComplete.tracks[0].distance.totalItra : gpxComplete.tracks[0].distance.total) / 1000;
      const duration = Math.ceil(distanceTmp.toFixed(1) / settings.kmPerDay);
      const daysTmp = [...Array(duration).keys()].map((day) => day + 1);
      setDays(daysTmp);
      // Compute GPXs
      const cumulDistances = settings?.itra ? gpxComplete.tracks[0].distance.cumulItra : gpxComplete.tracks[0].distance.cumul;
      const stepsMarkers = [];
      const gpxsTmp = daysTmp.map((day) => {
        const startPointIndex = getClosestPointIndexByDistance({
          cumulDistances,
          distance: settings.kmPerDay * 1000 * (day - 1),
        });
        const endPointIndex = getClosestPointIndexByDistance({
          cumulDistances,
          distance: settings.kmPerDay * 1000 * day,
        });
        const trkpts = gpxComplete.tracks[0].points
          .slice(startPointIndex, endPointIndex + 1)
          .map(
            (point) =>
              `<trkpt lat="${point.lat}" lon="${point.lon}"><ele>${point.ele}</ele></trkpt>`,
          );
        const startPoint = gpxComplete.tracks[0].points[startPointIndex];
        stepsMarkers.push({
          category: 'étape',
          color: '#5DC245',
          icon: faPlay,
          label: 'départ',
          lat: startPoint.lat,
          lon: startPoint.lon,
          name: `Etape ${day} - Début`,
          type: 'start'
        })
        let partGpx = new gpxParser();
        partGpx.parse(
          `<xml><gpx><trk><trkseg>${trkpts}</trkseg></trk></gpx></xml>`,
        );
        partGpx = overloadGpx(partGpx);
        return partGpx;
      });
      // Add marker for arrival
      const lastPoint = gpxComplete.tracks[0].points[gpxComplete.tracks[0].points.length - 1];
      stepsMarkers.push({
        category: 'étape',
        color: '#FF0000',
        icon: faFlagCheckered,
        label: 'arrivée',
        lat: lastPoint.lat,
        lon: lastPoint.lon,
        name: `Arrivée !`,
        type: 'end',
      })
      setGpxs(gpxsTmp);
      // Add markers from GPX
      const gpxMarkers = (gpxComplete?.waypoints ?? []).map((marker) => ({
        ...marker,
        ...getMarkerFromTypeOrName(marker),
      }));
      setMarkers([...gpxMarkers, ...stepsMarkers]);
    }
  }, [gpxComplete, settings?.itra, settings.kmPerDay, settings?.markers]);

  // Choose current GPX displayd as complete GPX or stage of the GPX
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
          <Grid2
            container
            size={{ xs: 4, sm: 8, md: 12 }}
            spacing={{ xs: 2, md: 3 }}
          >
            <Grid2 size={{ xs: 12 }}>
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
                    href={`#/trails/${params.trailId}`}
                  >
                    {settings?.name}
                  </Link>
                )}
                {params?.day ? (
                  <Typography>Jour {params?.day}</Typography>
                ) : (
                  <Typography>{settings?.name}</Typography>
                )}
              </Breadcrumbs>
            </Grid2>
            <Overview
              gpx={gpx}
              gpxs={gpxs}
              markers={markers}
              setMarkers={setMarkers}
              setSettings={setSettings}
              settings={settings}
            />
            <Grid2 size={{ xs: 12 }}>
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
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 7 }}>
                      <MyMap
                        coordinates={coordinates}
                        gpx={gpx}
                        markers={markers}
                        selectedFilters={selectedFilters}
                        setCoordinates={setCoordinates}
                        settings={settings}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 5 }}>
                      <FormControl>
                        <RadioGroup
                          aria-labelledby="radio-buttons-group-label-day"
                          defaultValue="all"
                          name="radio-buttons-group-day"
                          onChange={(e) =>
                            e.target.value === "all"
                              ? navigate(`/trails/${params?.trailId ?? 'trail'}`, {
                                state: settings,
                              })
                              : navigate(
                                `/trails/${params?.trailId ?? 'trail'}/${e.target.value}`,
                                { state: settings },
                              )
                          }
                          value={params?.day ?? "all"}
                        >
                          <FormControlLabel
                            value="all"
                            control={<Radio />}
                            key="day-all"
                            label="Tout le parcours"
                          />
                          {days &&
                            days.map((day) => (
                              <FormControlLabel
                                value={day}
                                control={<Radio />}
                                key={`day-${day}`}
                                label={`Jour ${day} - ${settings?.startDate
                                  .add(day - 1, "day")
                                  .format("dddd	DD MMMM")}`}
                              />
                            ))}
                        </RadioGroup>
                      </FormControl>
                    </Grid2>
                  </Grid2>
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
                      settings={settings}
                    />
                  ) : (
                    days.map((day, index) => (
                      <Stage
                        day={day}
                        gpx={gpxs[index]}
                        key={index}
                        markers={markers}
                        settings={settings}
                      />
                    ))
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid2>
          </Grid2>
        </Box>
      )}
    </>
  );
};

export default Trail;
