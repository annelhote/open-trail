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
    <div style={{ width: "50%", margin: "auto" }}>
      {distance} km // {elevation} D+ // {duration} days
    </div>
  );
};

export default Overview;