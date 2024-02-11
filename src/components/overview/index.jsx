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
    <Grid className='overview' container item>
      <Grid item>
        <h1>
          {meta.name}
        </h1>
      </Grid>
      <Grid container item>
        <Grid item xs={12} sm={1}>
          <b>{distance}</b> km
        </Grid>
        <Grid item xs={12} sm={1} sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
          <b>{elevation}</b> m D+
        </Grid>
        <Grid item xs={12} sm={1} sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
          <b>{duration}</b> jours
        </Grid>
        <Grid item xs={12} sm={8}>
          <Stack direction='row' sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              component='label'
              onClick={() => downloadGpx({ gpx, meta })}
              startIcon={<FontAwesomeIcon icon={faFileArrowDown} />}
              sx={{
                '& .MuiTextField-root': { width: '100%' },
              }}
              variant='outlined'
            >
              Download GPX file
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Overview;