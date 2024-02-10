import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Grid, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import { downloadGpx } from '../../utils';

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
    <Grid className="overview" container item xs={12}>
      <h1>
        {meta.name}
      </h1>
      <Grid className="subtitle" item xs={10}>
        <span className="space-right">
          <b>{distance}</b> km
        </span>
        /
        <span className="space-right space-left">
          <b>{elevation}</b> m D+
        </span>
        /
        <span className="space-right space-left">
          <b>{duration}</b> jours
        </span>
      </Grid>
      <Grid item xs={2}>
        <Stack direction="row" justifyContent="flex-end">
          <Button component="label" onClick={() => downloadGpx({ gpx, meta })} startIcon={<FontAwesomeIcon icon={faFileArrowDown} />} variant="outlined">
            Download GPX file
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Overview;