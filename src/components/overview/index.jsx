import {
  faArrowDown,
  faArrowUp,
  faFileArrowDown,
  faGear,
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
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { downloadGpx } from "../../utils";

const Overview = ({ gpx, markers, meta, setMeta }) => {
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elevation, setElevation] = useState({
    max: 0,
    min: 0,
    neg: 0,
    pos: 0,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // TODO: Do it in the trail page in order to avoid duplicated code
    const distanceTmp = (meta?.itra ? gpx.tracks[0].distance.totalItra : gpx.tracks[0].distance.total) / 1000;
    setDistance(Math.round(distanceTmp));
    setDuration(Math.ceil(distanceTmp.toFixed(1) / meta.kmPerDay));
    setElevation(gpx.calcElevation(gpx.tracks[0].points));
  }, [gpx, meta]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  return (
    <Grid className="overview" container item>
      <Grid container item>
        <Grid item xs={11}>
          <h2>{meta.name}</h2>
        </Grid>
        <Grid item>
          <Button variant="none" onClick={handleOpen}>
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
                setMeta({
                  ...meta,
                  activity: event.target.activity.value,
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
                  defaultValue={meta.name}
                  label="Nom de la randonnée"
                  name="name"
                  required
                  variant="filled"
                />
                <Select
                  defaultValue={meta.activity}
                  name="activity"
                >
                  <MenuItem value={"hiking"}>Randonnée pédestre</MenuItem>
                  <MenuItem value={"cycling"}>Randonnée cycliste</MenuItem>
                </Select>
                <TextField
                  defaultValue={meta.kmPerDay}
                  InputProps={{ inputProps: { min: 0 } }}
                  label="Kilomètres parcourus par jour"
                  name="kmPerDay"
                  type="number"
                  variant="filled"
                />
                <FormControlLabel
                  control={<Checkbox defaultChecked={meta?.itra ?? false} name="itra" />}
                  label="Calcul des distances en kilomètre-effort (km-e)"
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      defaultValue={meta.startDate}
                      format="DD/MM/YYYY"
                      label="Jour du départ"
                      name="departureDate"
                    />
                  </DemoContainer>
                </LocalizationProvider>
                <Button
                  component="label"
                  onClick={() => {
                    downloadGpx({ gpx, markers, meta });
                    handleClose();
                  }}
                  startIcon={<FontAwesomeIcon icon={faFileArrowDown} />}
                  variant="contained"
                >
                  Télécharger le fichier GPX
                </Button>
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
              {meta?.itra ? 'km-e' : 'km'}
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
