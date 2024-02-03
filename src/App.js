import axios from 'axios';
import gpxParser from 'gpxparser';
import React, { useEffect, useState } from 'react';

import Map from './components/map';
import Overview from './components/overview';
import Planner from './components/planner';
import Profile from './components/profile';
import gpxFile from './data/le-poet-sigillat.gpx';

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
      nwr["tourism"~"alpine_hut|apartment|camp_site|chalet|guest_house|hostel|hotel|motel|wilderness_hut"](around:1000,${bbox});
      nwr["shop"~"deli|department_store|food|general|mall|supermarket"](around:1000,${bbox});
    );
    out center;
  `;
  return axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
}

export default function App() {
  const [coordinates, setCoordinates] = useState();
  const [gpx, setGpx] = useState();
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetch(gpxFile)
      .then((res) => res.text())
      .then((xml) => {
        const gpxP = new gpxParser();
        gpxP.parse(xml);
        setGpx(gpxP);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (gpx) {
      const coordinatesDataCount = gpx.tracks[0].points.length;
      const targetPathDataCount = Math.pow(coordinatesDataCount, 0.7);
      const pathSamplingPeriod = Math.floor(coordinatesDataCount / targetPathDataCount);
      const downSampledCoordinates = downSampleArray(gpx.tracks[0].points, pathSamplingPeriod);
      let chunks = chunkArray(downSampledCoordinates, 20);
      chunks = chunks.map((chunk) => chunk.map((item) => [item.lat, item.lon]).flat());

      Promise.all(chunks.map((chunk) => getDataFromOverpass(chunk)))
        .then((responses) => {
          const response = responses.map((response) => response.data.elements).flat();
          console.log(response);
          setMarkers(response.map((item) => ({
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
            type: item?.tags?.amenity ?? item?.tags?.tourism ?? item?.tags?.shop ?? '',
            website: item?.tags?.website,
          })));
        })
        .catch((error) => {
          console.log('error', error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpx])

  return (
    <>
      {gpx && (
        <div className='open-trail'>
          <Overview gpx={gpx} />
          <div>
            {coordinates?.lat ?? 0} / {coordinates?.lon ?? 0}
          </div>
          <Map gpx={gpx} coordinates={coordinates} markers={markers} setCoordinates={setCoordinates} />
          <Profile gpx={gpx} coordinates={coordinates} />
          <Planner gpx={gpx} markers={markers} />
        </div>
      )}
    </>
  );
}
