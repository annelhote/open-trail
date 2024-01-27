import { useEffect, useState } from 'react';

const Overview = ({ gpx }) => {
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elevation, setElevation] = useState(0);

  useEffect(() => {
    setDistance(Math.floor(gpx.tracks[0].distance.total / 1000));
    setElevation(Math.floor((gpx.calcElevation(gpx.tracks[0].points)).pos));
    setDuration(Math.ceil(distance / 20));
  }, [distance, gpx]);

  return (
    <div>
      <h1>
        Valence -> Le Poët-Sigillat
      </h1>
      <div className='overview'>
        <span className='space-right'>
          <b>{distance}</b> km
        </span>
        /
        <span className='space-right space-left'>
          <b>{elevation}</b> m D+
        </span>
        /
        <span className='space-right space-left'>
          <b>{duration}</b> days
        </span>
      </div>
    </div>
  );
};

export default Overview;