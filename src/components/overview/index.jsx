import {
  faArrowDown,
  faArrowUp,
  faFileArrowDown,
  faStopwatch,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Grid, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useEffect, useState } from "react";

import { downloadGpx, downloadPoi } from "../../utils";

const Overview = ({ gpx, markers, meta, setMeta }) => {
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elevation, setElevation] = useState({ neg: 0, pos: 0 });
  const [itraDistance, setItraDistance] = useState(0);

  useEffect(() => {
    const itraDistanceTmp = gpx.tracks[0].distance.totalItra / 1000;
    setDistance(Math.round(gpx.tracks[0].distance.total / 1000));
    setItraDistance(Math.round(itraDistanceTmp));
    setDuration(Math.ceil(itraDistanceTmp.toFixed(1) / meta.kmPerDay));
    setElevation(gpx.calcElevation(gpx.tracks[0].points));
  }, [gpx, meta]);

  return (
    <Grid className="overview" container item>
      <Grid item>
        <h2>{meta.name}</h2>
      </Grid>
      <Grid container item>
        <Grid item xs={12} sm={1}>
          <Stack sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}>
            <FontAwesomeIcon
              icon={faUpRightAndDownLeftFromCenter}
              className="fa-rotate-by"
              style={{ "--fa-rotate-angle": "45deg" }}
            />
            <Stack
              direction="row"
              sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}
            >
              <Box sx={{ pr: 0.5 }}>
                <b>{distance}</b>
              </Box>{" "}
              km
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={1}>
          <Stack sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}>
            <FontAwesomeIcon
              icon={faUpRightAndDownLeftFromCenter}
              className="fa-rotate-by"
              style={{ "--fa-rotate-angle": "45deg" }}
            />
            <Stack
              direction="row"
              sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}
            >
              <Box sx={{ pr: 0.5 }}>
                <b>{itraDistance.toFixed(0)}</b>
              </Box>{" "}
              km
            </Stack>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          sm={1}
          sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}
        >
          <Stack sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}>
            <FontAwesomeIcon
              icon={faArrowUp}
              className="fa-rotate-by"
              style={{ "--fa-rotate-angle": "45deg" }}
            />
            <Stack
              direction="row"
              sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}
            >
              <Box sx={{ pr: 0.5 }}>
                <b>{elevation.pos.toFixed(0)}</b>
              </Box>{" "}
              m D+
            </Stack>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          sm={1}
          sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}
        >
          <Stack sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}>
            <FontAwesomeIcon
              icon={faArrowDown}
              className="fa-rotate-by"
              style={{ "--fa-rotate-angle": "-45deg" }}
            />
            <Stack
              direction="row"
              sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}
            >
              <Box sx={{ pr: 0.5 }}>
                <b>{elevation.neg.toFixed(0)}</b>
              </Box>{" "}
              m D-
            </Stack>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          sm={1}
          sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}
        >
          <Stack sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}>
            <FontAwesomeIcon icon={faStopwatch} />
            <Stack
              direction="row"
              sx={{ justifyContent: { xs: "flex-start", sm: "center" } }}
            >
              <Box sx={{ pr: 0.5 }}>
                <b>{duration}</b>
              </Box>{" "}
              {duration > 1 ? "jours" : "jour"}
            </Stack>
          </Stack>
        </Grid>
        <Grid
          container
          item
          xs={12}
          sm={true}
          direction="row"
          justifyContent="flex-end"
          spacing={2}
        >
          <Grid item>
            <TextField
              id="filled-number"
              label="Kilomètres parcourus par jour (ITRA)"
              onChange={(event) => setMeta({ ...meta, kmPerDay: event.target.value })}
              type="number"
              value={meta.kmPerDay}
              variant="filled"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  id="start-date"
                  label="Jour du départ"
                  onChange={(value) => setMeta({ ...meta, startDate: value })}
                  value={meta.startDate}
                />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid item>
            <Button
              component="label"
              onClick={() => downloadGpx({ gpx, meta })}
              startIcon={<FontAwesomeIcon icon={faFileArrowDown} />}
              variant="outlined"
            >
              Télécharger le fichier GPX
            </Button>
            <Button
              component="label"
              onClick={() => downloadPoi({ gpx, markers, meta })}
              startIcon={<FontAwesomeIcon icon={faFileArrowDown} />}
              variant="outlined"
            >
              Télécharger les points d'intérêt
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Overview;
