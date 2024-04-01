import { faArrowDown, faArrowUp, faFileArrowDown, faStopwatch, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Grid, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

import { downloadGpx } from '../../utils';

const Overview = ({ gpx, meta, setMeta }) => {
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elevation, setElevation] = useState({ neg: 0, pos: 0 });
  const [itraDistance, setItraDistance] = useState(0);

  useEffect(() => {
    setDistance(Math.round(gpx.tracks[0].distance.total / 1000));
    setItraDistance(Math.round(gpx.tracks[0].distance.totalItra / 1000))
    setDuration(Math.ceil(distance / meta.kmPerDay));
    setElevation(gpx.calcElevation(gpx.tracks[0].points));
  }, [distance, gpx, meta]);

  return (
    <Grid className='overview' container item>
      <Grid item>
        <h2>
          {meta.name}
        </h2>
      </Grid>
      <Grid container item>
        <Grid item xs={12} sm={1}>
          <Stack sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} className='fa-rotate-by' style={{ '--fa-rotate-angle': '45deg' }} />
            <Stack direction='row' sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
              <b>{distance}</b> km
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={1}>
          <Stack sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} className='fa-rotate-by' style={{ '--fa-rotate-angle': '45deg' }} />
            <Stack direction='row' sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
              <b>{itraDistance.toFixed(0)}</b> km
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={1} sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
          <Stack sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
            <FontAwesomeIcon icon={faArrowUp} className='fa-rotate-by' style={{ '--fa-rotate-angle': '45deg' }} />
            <Stack direction='row' sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
              <b>{elevation.pos.toFixed(0)}</b> m D+
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={1} sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
          <Stack sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
            <FontAwesomeIcon icon={faArrowDown} className='fa-rotate-by' style={{ '--fa-rotate-angle': '-45deg' }} />
            <Stack direction='row' sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
              <b>{elevation.neg.toFixed(0)}</b> m D-
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={1} sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
          <Stack sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
            <FontAwesomeIcon icon={faStopwatch} />
            <Stack direction='row' sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
              <b>{duration}</b> jours
            </Stack>
          </Stack>
        </Grid>
        <Grid container item xs={12} sm={true} direction="row" justifyContent="flex-end" spacing={2}>
          <Grid item>
            <TextField
              id="filled-number"
              label="Kilomètres parcourus par jour (ressentis aka ITRA)"
              onChange={(event) => setMeta({ ...meta, kmPerDay: event.target.value })}
              type="number"
              value={meta.kmPerDay}
              variant="filled"
            />
          </Grid>
          <Grid item>
            <Button
              component='label'
              onClick={() => downloadGpx({ gpx, meta })}
              startIcon={<FontAwesomeIcon icon={faFileArrowDown} />}
              variant='outlined'
            >
              Download GPX file
            </Button>
          </Grid>
        </Grid>
      </Grid >
    </Grid >
  );
};

export default Overview;