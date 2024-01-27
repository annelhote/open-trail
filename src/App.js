import gpxParser from 'gpxparser';
import React, { useEffect, useState } from 'react';

import Map from './components/map';
import Overview from './components/overview';
import Profile from './components/profile';
import gpxFile from './data/le-poet-sigillat.gpx';

export default function App() {
  const [gpx, setGpx] = useState(null);

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
          <Map gpx={gpx} />
          <Profile gpx={gpx} />
        </div>
    )}
    </>
  );
}
