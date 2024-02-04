import {
  faCartShopping,
  faCoffee,
  faFaucetDrip,
  faHouse,
  faQuestion,
  faRestroom,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons'
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import axios from 'axios';
import gpxParser from 'gpxparser';
import React, { useEffect, useState } from 'react';

import Map from './components/map';
import Overview from './components/overview';
import Planner from './components/planner';
import Profile from './components/profile';
import gpxLePoetSigillat from './data/le-poet-sigillat.gpx';

const meta = {
  gpx: gpxLePoetSigillat,
  kmPerDay: 20,
  activity: 'hiking',
  name: 'Valence -> Le Poët-Sigillat',
}

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
      category = 'accommodation';
      color = '#f2df16';
      icon = faHouse;
      break;
    case 'cafe':
      category = 'water';
      color = '#996600';
      icon = faCoffee;
      break;
    case 'deli':
    case 'department_store':
    case 'food':
    case 'general':
    case 'mall':
    case 'supermarket':
      category = 'food';
      color = '#006633';
      icon = faCartShopping;
      break;
    case 'cemetery':
    case 'drinking_water':
    case 'water_point':
      category = 'water';
      color = '#0099ff';
      icon = faFaucetDrip;
      break;
    case 'restaurant':
      category = 'food';
      color = '#f21629';
      icon = faUtensils;
      break;
    case 'toilets':
      category = 'water';
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
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    fetch(meta?.gpx)
      .then((res) => res.text())
      .then((xml) => {
        const newGpx = new gpxParser();
        newGpx.parse(xml);
        setGpx(newGpx);
      })
      .catch((e) => console.error(e));
  }, []);

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
    setFilters([...new Set(markers.map((item) => item?.type ?? 'unknown'))]);
  }, [markers]);

  useEffect(() => {
    setSelectedFilters(filters);
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
        <div className='open-trail'>
          <Overview gpx={gpx} meta={meta} />
          <FormGroup row>
            {filters.map((item, index) => (
              <FormControlLabel
                control={<Checkbox checked={selectedFilters.includes(item)} />}
                key={index}
                label={item.replace('_', ' ')}
                name={item}
                onChange={(event) => selectedFilters.includes(event.target.name) ? setSelectedFilters(selectedFilters.filter((item) => item !== event.target.name)) : setSelectedFilters([...selectedFilters, event.target.name])}
              />
            ))}
          </FormGroup>
          <Map gpx={gpx} coordinates={coordinates} markers={markers} selectedFilters={selectedFilters} setCoordinates={setCoordinates} />
          <Profile gpx={gpx} coordinates={coordinates} />
          <Planner gpx={gpx} markers={markers} meta={meta} />
        </div>
      )}
    </>
  );
}
