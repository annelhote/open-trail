import { Box, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import gpxParser from 'gpxparser';
import React, { useEffect, useState } from 'react';

import Filters from './components/filters';
import MyMap from './components/map';
import Overview from './components/overview';
import Planner from './components/planner';
import Profile from './components/profile';
import gpxLePoetSigillat from './data/le-poet-sigillat.gpx';
import lalilou from './data/le-poet-sigillat.json';
import { chunkArray, downSampleArray, getDataFromOverpass, getMarkerFromType } from './utils';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#fff',
    },
  },
});

const App = () => {
  const [coordinates, setCoordinates] = useState();
  const [gpx, setGpx] = useState();
  const [markers, setMarkers] = useState([]);
  const [meta, setMeta] = useState(lalilou);
  const [filters, setFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState([]);

  meta.gpx = gpxLePoetSigillat

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
        setGpx(newGpx);
      })
      .catch((e) => console.error(e));
  }, [meta?.gpx]);

  useEffect(() => {
    if (gpx) {
      const coordinatesDataCount = gpx.tracks[0].points.length;
      const targetPathDataCount = Math.pow(coordinatesDataCount, 0.7);
      const pathSamplingPeriod = Math.floor(coordinatesDataCount / targetPathDataCount);
      const downSampledCoordinates = downSampleArray(gpx.tracks[0].points, pathSamplingPeriod);
      let chunks = chunkArray(downSampledCoordinates, meta.kmPerDay);
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
          // Remove duplicates
          markersTmp = [...new Map(markersTmp.map(v => [v.id, v])).values()];
          // Add custom markers
          markersTmp = [...markersTmp, ...(meta?.markers ?? []).map((marker) => ({ ...marker, ...getMarkerFromType(marker.type) }))];
          setMarkers(markersTmp);
        })
        .catch((error) => {
          console.log('error', error);
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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {gpx && (
        <Box className='open-trail' sx={{ flexGrow: 0.75 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Overview gpx={gpx} meta={meta} />
            {(markers.length === 0) ? (
              <Grid item xs={12}>
                Chargement des données ...
              </Grid>
            ) : (
              <>
                <Filters filters={filters} markers={markers} meta={meta} onChange={onChange} selectedFilters={selectedFilters} setMeta={setMeta} />
                <MyMap gpx={gpx} coordinates={coordinates} markers={markers} selectedFilters={selectedFilters} setCoordinates={setCoordinates} />
                <Profile gpx={gpx} coordinates={coordinates} />
                <Planner gpx={gpx} markers={markers} meta={meta} selectedFilters={selectedFilters} />
              </>
            )}
          </Grid>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
