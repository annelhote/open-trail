import {
  faCartShopping,
  faCoffee,
  faFaucetDrip,
  faHouse,
  faQuestion,
  faRestroom,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';
import { Box, Grid } from '@mui/material';
import axios from 'axios';
import gpxParser from 'gpxparser';
import React, { useEffect, useState } from 'react';

import Filters from './components/filters';
import Map from './components/map';
import Overview from './components/overview';
import Planner from './components/planner';
import Profile from './components/profile';
import gpxLePoetSigillat from './data/le-poet-sigillat.gpx';
import { chunkArray, downSampleArray } from './utils';

const getDataFromOverpass = (bbox) => {
  const query = `
    [out:json][timeout:500];
    (
      nwr["amenity"~"cafe|drinking_water|restaurant|toilets|water_point"](around:1000,${bbox});
      nwr["landuse"~"cemetery"](around:1000,${bbox});
      nwr["shop"~"deli|department_store|food|general|mall|supermarket"](around:1000,${bbox});
      nwr["tourism"~"alpine_hut|apartment|camp_site|chalet|guest_house|hostel|hotel|motel|wilderness_hut"](around:1000,${bbox});
    );
    out center;
  `;
  return axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
}

const getMarkerFromType = (type) => {
  let category = 'unknown';
  let color = '#e4e5e6';
  let icon = faQuestion;
  switch (type) {
    case 'alpine_hut':
    case 'apartment':
    case 'camp_site':
    case 'chalet':
    case 'guest_house':
    case 'hostel':
    case 'hotel':
    case 'motel':
    case 'shelter':
    case 'wilderness_hut':
      category = 'Hébergement';
      color = '#f2df16';
      icon = faHouse;
      break;
    case 'cafe':
      category = 'Eau';
      color = '#996600';
      icon = faCoffee;
      break;
    case 'deli':
    case 'department_store':
    case 'food':
    case 'general':
    case 'mall':
    case 'supermarket':
      category = 'Alimentation';
      color = '#006633';
      icon = faCartShopping;
      break;
    case 'cemetery':
    case 'drinking_water':
    case 'water_point':
      category = 'Eau';
      color = '#0099ff';
      icon = faFaucetDrip;
      break;
    case 'restaurant':
      category = 'Alimentation';
      color = '#f21629';
      icon = faUtensils;
      break;
    case 'toilets':
      category = 'Eau';
      color = '#f3802e';
      icon = faRestroom;
      break;
    default:
      break;
  }
  return { category, color, icon };
}

export default function App() {
  const [coordinates, setCoordinates] = useState();
  const [gpx, setGpx] = useState();
  const [markers, setMarkers] = useState([]);
  const [meta, setMeta] = useState({
    activity: 'hiking',
    gpx: gpxLePoetSigillat,
    id: 'le-poet-sigillat',
    kmPerDay: 20,
    name: 'Valence -> Le Poët-Sigillat',
  });
  const [filters, setFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState([]);

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
          setMarkers(response.map((item) => {
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
              phone: item?.tags?.phone ?? item?.tags?.['contact:phone'],
              type,
              website: item?.tags?.website,
              ...getMarkerFromType(type),
            }
          }));
        })
        .catch((error) => {
          console.log('error', error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpx])

  useEffect(() => {
    const filtersTmp = {};
    markers.forEach((marker) => {
      if (!Object.keys(filtersTmp).includes(marker.category)) filtersTmp[marker.category] = { color: marker.color, data: [] };
      if (!filtersTmp[marker.category].data.includes(marker.type)) filtersTmp[marker.category].data.push(marker.type);
    })
    setFilters(filtersTmp);
  }, [markers]);

  useEffect(() => {
    let selectedFiltersTmp = Object.keys(filters);
    selectedFiltersTmp.forEach((item) => {
      selectedFiltersTmp = [...selectedFiltersTmp, ...filters[item].data];
    })
    setSelectedFilters(selectedFiltersTmp);
  }, [filters]);

  if (markers.length === 0) {
    return (
      <div>
        Loading data ...
      </div>
    )
  }

  return (
    <>
      {gpx && (
        <Box className='open-trail' sx={{ flexGrow: 0.75 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            <Overview gpx={gpx} meta={meta} />
            <Filters filters={filters} markers={markers} meta={meta} onChange={onChange} selectedFilters={selectedFilters} setMeta={setMeta} />
            <Map gpx={gpx} coordinates={coordinates} markers={markers} selectedFilters={selectedFilters} setCoordinates={setCoordinates} />
            <Profile gpx={gpx} coordinates={coordinates} />
            <Planner gpx={gpx} markers={markers} meta={meta} selectedFilters={selectedFilters} />
          </Grid>
        </Box>
      )}
    </>
  );
}
