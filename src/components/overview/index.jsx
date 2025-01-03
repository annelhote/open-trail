import {
  faArrowDown,
  faArrowUp,
  faFileArrowDown,
  faGear,
  faLocationPin,
  faStopwatch,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
} from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { downloadGpx, getPois } from "../../utils";

const Overview = ({ gpx, gpxs, markers, setMarkers, setSettings, settings }) => {
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elevation, setElevation] = useState({
    max: 0,
    min: 0,
    neg: 0,
    pos: 0,
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // TODO: Do it in the trail page in order to avoid duplicated code
    const distanceTmp = (settings?.itra ? gpx.tracks[0].distance.totalItra : gpx.tracks[0].distance.total) / 1000;
    setDistance(Math.round(distanceTmp));
    setDuration(Math.ceil(distanceTmp.toFixed(1) / settings.kmPerDay));
    setElevation(gpx.calcElevation(gpx.tracks[0].points));
  }, [gpx, settings]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  return (
    <Grid className="overview" container item>
      <Grid container item>
        <Grid item xs={7}>
          <h2>
            {settings.name}
          </h2>
        </Grid>
        <Grid item xs={2}>
          <LoadingButton
            component="label"
            loading={loading}
            onClick={async () => {
              setLoading(true);
              const markersTmp = await getPois({ gpx, gpxs, settings });
              setMarkers([...markers, ...markersTmp]);
              setLoading(false);
            }}
            size="small"
            startIcon={<FontAwesomeIcon icon={faLocationPin} />}
            variant="contained"
          >
            Charger les POIs
          </LoadingButton>
        </Grid>
        <Grid item xs={2}>
          <Button
            component="label"
            onClick={() => downloadGpx({ gpx, markers, settings })}
            size="small"
            startIcon={<FontAwesomeIcon icon={faFileArrowDown} />}
            variant="contained"
          >
            Exporter le GPX
          </Button>
        </Grid>
        <Grid item justifyContent="center" xs={1}>
          <Button onClick={handleOpen} variant="none">
            <FontAwesomeIcon icon={faGear} />
          </Button>
          <Dialog
            aria-modal
            open={open}
            onClose={handleClose}
            PaperProps={{
              component: "form",
              onSubmit: (event) => {
                event.preventDefault();
                setSettings({
                  ...settings,
                  itra: event.target.itra.checked,
                  kmPerDay: Number(event.target.kmPerDay.value),
                  name: event.target.name.value,
                  startDate: dayjs(event.target.departureDate.value, 'DD/MM/YYYY'),
                });
                handleClose();
              },
            }}
          >
            <DialogContent>
              <FormGroup>
                <TextField
                  defaultValue={settings.name}
                  label="Nom de la randonnée"
                  name="name"
                  required
                  variant="filled"
                />
                <TextField
                  defaultValue={settings.kmPerDay}
                  InputProps={{ inputProps: { min: 0 } }}
                  label="Kilomètres parcourus par jour"
                  name="kmPerDay"
                  type="number"
                  variant="filled"
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked={settings?.itra ?? false} name="itra" />}
                  label="Calcul des distances en kilomètre-effort (km-e)"
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      defaultValue={settings.startDate}
                      format="DD/MM/YYYY"
                      label="Jour du départ"
                      name="departureDate"
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </FormGroup>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Fermer</Button>
              <Button type="submit">OK</Button>
            </DialogActions>
          </Dialog>
        </Grid>
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
              {settings?.itra ? 'km-e' : 'km'}
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
                <b>{elevation.max.toFixed(0)}</b>
              </Box>{" "}
              alt. max.
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
                <b>{elevation.min.toFixed(0)}</b>
              </Box>{" "}
              alt. min.
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
      </Grid>
    </Grid>
  );
};

export default Overview;
