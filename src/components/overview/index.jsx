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
  Grid2,
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
  const [distanceItra, setDistanceItra] = useState(0);
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
    if (gpxs.length > 0) {
      const { distance, distanceItra, points } = gpxs.reduce(
        (acc, cur) => ({
          distance: acc.distance + cur.tracks[0].distance.total,
          distanceItra: acc.distanceItra + cur.tracks[0].distance.totalItra,
          points : [...acc.points, ...cur.tracks[0].points],
        }),
        { distance: 0, distanceItra: 0, points: [] },
      );
      setDistance(Math.round(distance / 1000));
      setDistanceItra(Math.round(distanceItra / 1000));
      setDuration(Math.ceil(((settings?.itra ? distanceItra : distance) / 1000).toFixed(1) / settings.kmPerDay));
      setElevation(gpxs[0].calcElevation(points));
    }
  }, [gpxs, settings]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  return (
    <Grid2 className="overview" container size={{ xs: 12 }}>
      <Grid2 container size={{ xs: 12 }}>
        <Grid2 size={{ xs: 12, md: 7 }}>
          <h2>
            {settings.name}
          </h2>
        </Grid2>
        <Grid2 size={{ xs: 10, md: 2 }}>
          <LoadingButton
            component="label"
            loading={loading}
            onClick={async () => {
              setLoading(true);
              const newMarkers = await getPois({ gpxs });
              setMarkers([...markers, ...newMarkers]);
              setLoading(false);
            }}
            size="small"
            startIcon={<FontAwesomeIcon icon={faLocationPin} />}
            variant="contained"
          >
            Charger les POIs
          </LoadingButton>
        </Grid2>
        <Grid2 size={{ xs: 10, md: 2 }}>
          <Button
            component="label"
            onClick={() => downloadGpx({ gpx, markers, settings })}
            size="small"
            startIcon={<FontAwesomeIcon icon={faFileArrowDown} />}
            variant="contained"
          >
            Exporter le GPX
          </Button>
        </Grid2>
        <Grid2 justifyContent="center" size={{ xs: 1 }}>
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
        </Grid2>
      </Grid2>
      <Grid2 container size={{ xs: 12 }}>
        <Grid2 size={{ xs: 12, sm: 1 }}>
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
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 1 }}>
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
                <b>{distanceItra}</b>
              </Box>{" "}
              km-e
            </Stack>
          </Stack>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: 1 }}
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
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: 1 }}
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
        </Grid2>
        <Grid2
          size={{ xs:12, sm: 1 }}
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
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: 1 }}
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
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: 1 }}
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
        </Grid2>
      </Grid2>
    </Grid2>
  );
};

export default Overview;
