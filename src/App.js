import gpxParser from 'gpxparser';
import React, { useEffect, useState } from 'react';

import Chart from './components/chart';
import MyMap from './components/my_map';
import Overview from './components/overview';
import gpxFile from './data/le-poet-sigillat.gpx';

import './index.css';

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
        <div>
          <Overview gpx={gpx} />
          <MyMap gpx={gpx} />
          <Chart />
        </div>
    )}
    </>
  );
}