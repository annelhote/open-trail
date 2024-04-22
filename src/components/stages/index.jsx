import Stage from '../stage';

const Stages = ({ gpx, markers, meta }) => {
  // TODO: Do it in the trail page in order to avoid duplicated code
  const duration = Math.ceil(gpx.tracks[0].distance.totalItra / 1000 / meta.kmPerDay);
  const days = [...Array(duration).keys()];

  return (
    <>
      {days.map((day, index) =>
        <Stage day={day} gpx={gpx} key={index} markers={markers} meta={meta} />
      )}
    </>
  );
};

export default Stages;
