import Stage from '../stage';

const Stages = ({ gpx, markers, meta }) => {
  const duration = Math.ceil(Math.floor(gpx.tracks[0].distance.total / 1000) / meta.kmPerDay)
  const days = [...Array(duration).keys()];
  days.pop()

  return (
    <>
      {days.map((day, index) =>
        <Stage day={day} gpx={gpx} key={index} markers={markers} meta={meta} />
      )}
    </>
  );
};

export default Stages;
