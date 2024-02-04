import { useEffect, useState } from 'react';

const Overview = ({ gpx, meta }) => {
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elevation, setElevation] = useState(0);

  useEffect(() => {
    setDistance(Math.floor(gpx.tracks[0].distance.total / 1000));
    setElevation(Math.floor((gpx.calcElevation(gpx.tracks[0].points)).pos));
    setDuration(Math.ceil(distance / meta.kmPerDay));
  }, [distance, gpx, meta]);

  return (
    <div className='overview'>
      <h1>
        {meta.name}
      </h1>
      <div className='subtitle'>
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