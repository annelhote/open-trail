import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Breadcrumbs, Grid, Link, Typography } from '@mui/material';
import gpxParser from 'gpxparser';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Filters from '../components/filters';
import MyMap from '../components/map';
import Overview from '../components/overview';
import Planner from '../components/planner';
import Profile from '../components/profile';
import Stages from '../components/stages';
import gpxCheminDassise from '../data/chemin-d-assise-01.gpx';
import gpxGr38 from '../data/gr38.gpx';
import gpxLePoetSigillat from '../data/le-poet-sigillat.gpx';
import gpxNantesEchalas from '../data/nantes-echalas.gpx';
import gpxPicosDeEuropa from '../data/picos-de-europa.gpx';
import gpxTourDuQueyras from '../data/tour-du-queyras.gpx';
import data from '../data/data.json';
import { chunkArray, downSampleArray, getClosestPointByCoordinates, getDataFromOverpass, getMarkerFromType, getTypeFromName } from '../utils';

const Trail = () => {
  const params = useParams();

  const [coordinates, setCoordinates] = useState();
  const [filters, setFilters] = useState({});
  const [gpx, setGpx] = useState();
  const [markers, setMarkers] = useState([]);
  const [meta, setMeta] = useState(data?.[params?.id] ?? {});
  const [selectedFilters, setSelectedFilters] = useState([]);

  const gpxes = {
    'chemin-d-assise-01': gpxCheminDassise,
    'gr38': gpxGr38,
    'le-poet-sigillat': gpxLePoetSigillat,
    'nantes-echalas': gpxNantesEchalas,
    'picos-de-europa': gpxPicosDeEuropa,
    'tour-du-queyras': gpxTourDuQueyras,
  }
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
      setSelectedFilters(selectedFilters.filter((item) => !excluded.includes(item)));
    } else {
      let added = [eventName];
      if (isCategory) {
        added = [...added, ...filters[eventName].data];
      }
      setSelectedFilters([...selectedFilters, ...added]);
    }
  }

  useEffect(() => {
    fetch(meta?.gpx)
      .then((res) => res.text())
      .then((xml) => {
        const newGpx = new gpxParser();
        newGpx.parse(xml);
        // Compute cumulative positiv elevation and ITRA distance at each point of the Route/Track
        const cumulItra = [];
        const cumulElevation = [];
        let itraValue = 0;
        let elevationValue = 0;
        const points = newGpx.tracks[0].points;
        for (let i = 0; i < points.length - 1; i++) {
          const pointFrom = points[i];
          const pointTo = points[i + 1];
          let distance = newGpx.calcDistanceBetween(pointFrom, pointTo);
          const elevation = pointTo.ele - pointFrom.ele;
          if (elevation > 0) {
            distance += elevation * 10;
            elevationValue += elevation;
          }
          itraValue += distance;
          cumulItra.push(itraValue);
          cumulElevation.push(elevationValue);
        };
        newGpx.tracks[0].distance.cumulItra = cumulItra;
        newGpx.tracks[0].distance.totalItra = itraValue;
        newGpx.tracks[0].distance.cumulElevation = cumulElevation;
        newGpx.tracks[0].distance.totalElevation = elevationValue;
        setGpx(newGpx);
      })
      .catch((e) => console.error(e));
  }, [meta?.gpx]);

  useEffect(() => {
    if (gpx) {
      const cumulDistances = [0, ...gpx.calculDistance(gpx.tracks[0].points).cumul.slice(0, -1)];
      const coordinatesDataCount = gpx.tracks[0].points.length;
      const targetPathDataCount = Math.pow(coordinatesDataCount, 0.7);
      const pathSamplingPeriod = Math.floor(coordinatesDataCount / targetPathDataCount);
      const downSampledCoordinates = downSampleArray(gpx.tracks[0].points, pathSamplingPeriod);
      let chunks = chunkArray(downSampledCoordinates, 20);
      chunks = chunks.map((chunk) => chunk.map((item) => [item.lat, item.lon]).flat());

      Promise.all(chunks.map((chunk) => getDataFromOverpass(chunk)))
        .then((responses) => {
          const response = responses.map((response) => response.data.elements).flat();
          let markersTmp = response.map((item) => {
            const type = item?.tags?.amenity ?? item?.tags?.landuse ?? item?.tags?.shop ?? item?.tags?.tourism ?? '';
            return {
              addrHousenumber: item?.tags?.['addr:housenumber'],
              addrStreet: item?.tags?.['addr:street'],
              email: item?.tags?.email,
              id: item?.id,
              lat: item?.lat ?? item?.center?.lat,
              lon: item?.lon ?? item?.center?.lon,
              name: item?.tags?.name,
              note: item?.tags?.note,
              osmType: item?.type,
              phone: item?.tags?.phone?.replace(/ /g, '') ?? item?.tags?.['contact:phone']?.replace(/ /g, ''),
              type,
              website: item?.tags?.website,
              ...getMarkerFromType(type),
            }
          });
          // Add custom markers
          const customMarkers = (meta?.markers ?? []).map((marker) => ({ ...marker, ...getMarkerFromType(marker.type) }));
          // Add markers from GPX file
          const gpxMarkers = (gpx?.waypoints ?? []).map((marker) => ({ ...marker, ...getMarkerFromType(marker?.type ?? getTypeFromName(marker.name)) }));
          markersTmp = [...markersTmp, ...customMarkers, ...gpxMarkers];
          // Remove duplicates based on lat,lon
          markersTmp = [...new Map(markersTmp.map((v) => [`${v.lat},${v.lon}`, v])).values()];
          // Add distance from start
          markersTmp = markersTmp.map((marker) => {
            const closestPoint = getClosestPointByCoordinates({ coordinates: marker, gpx });
            const distance = (gpx.calcDistanceBetween(marker, closestPoint.point) + cumulDistances[closestPoint.index] / 1000).toFixed(1);
            // TODO calculate distance ITRA
            return { distance, ...marker };
          });
          setMarkers(markersTmp);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpx]);

  useEffect(() => {
    const filtersTmp = {};
    markers.forEach((marker) => {
      if (!Object.keys(filtersTmp).includes(marker.category)) filtersTmp[marker.category] = { color: marker.color, data: [] };
      if (!filtersTmp[marker.category].data.includes(marker.type)) filtersTmp[marker.category].data.push(marker.type);
    });
    setFilters(filtersTmp);
  }, [markers]);

  useEffect(() => {
    let selectedFiltersTmp = Object.keys(filters);
    selectedFiltersTmp.forEach((item) => {
      selectedFiltersTmp = [...selectedFiltersTmp, ...filters[item].data];
    })
    setSelectedFilters(selectedFiltersTmp);
  }, [filters]);

  return (
    <>
      {gpx && (
        <Box className='open-trail' sx={{ flexGrow: 0.75 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
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
            {(markers.length === 0) ? (
              <Grid item xs={12}>
                Chargement des données ...
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary aria-controls="panel1-content" id="panel1-header" expandIcon={<ExpandMoreIcon />}>
                    Filtres
                  </AccordionSummary>
                  <AccordionDetails>
                    <Filters filters={filters} markers={markers} onChange={onChange} selectedFilters={selectedFilters} />
                  </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded>
                  <AccordionSummary aria-controls="panel2-content" id="panel2-header" expandIcon={<ExpandMoreIcon />}>
                    Carte
                  </AccordionSummary>
                  <AccordionDetails>
                    <MyMap gpx={gpx} coordinates={coordinates} markers={markers} meta={meta} selectedFilters={selectedFilters} setCoordinates={setCoordinates} />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary aria-controls="panel3-content" id="panel3-header" expandIcon={<ExpandMoreIcon />}>
                    Profile
                  </AccordionSummary>
                  <AccordionDetails>
                    <Profile gpx={gpx} coordinates={coordinates} />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary aria-controls="panel4-content" id="panel4-header" expandIcon={<ExpandMoreIcon />}>
                    Déroulé
                  </AccordionSummary>
                  <AccordionDetails>
                    <Planner gpx={gpx} markers={markers} meta={meta} selectedFilters={selectedFilters} />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary aria-controls="panel5-content" id="panel5-header" expandIcon={<ExpandMoreIcon />}>
                    Etapes
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stages gpx={gpx} markers={markers} meta={meta} />
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
