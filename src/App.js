import gpxParser from 'gpxparser';
import React, { useEffect, useState } from 'react';

import Map from './components/map';
import Overview from './components/overview';
import Planner from './components/planner';
import Profile from './components/profile';
import gpxFile from './data/le-poet-sigillat.gpx';

export default function App() {
  const [coordinates, setCoordinates] = useState();
  const [gpx, setGpx] = useState();

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

  return (
    <>
      {gpx && (
        <div className='open-trail'>
          <Overview gpx={gpx} />
          <div>
            {coordinates?.lat ?? 0} / {coordinates?.lng ?? 0}
          </div>
          <Map gpx={gpx} coordinates={coordinates} setCoordinates={setCoordinates} />
          <Profile gpx={gpx} coordinates={coordinates} />
          <Planner gpx={gpx} />
        </div>
    )}
    </>
  );
}
