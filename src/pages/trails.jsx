import {
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import data from "../data/data.json";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Trails = () => {
  const navigate = useNavigate();

  const [activity, setActivity] = useState("hiking");
  const [file, setFile] = useState();
  const [gpx, setGpx] = useState();
  const [kmPerDay, setKmPerDay] = useState(20);
  const [name, setName] = useState();
  const [startDate, setStartDate] = useState(dayjs(new Date().toISOString().split("T")[0]));

  useEffect(() => {
    const getGpxFromFile = async () => {
      const xml = await file.text();
      setGpx(xml);
    };
    if (file) getGpxFromFile();
  }, [file]);

  return (
    <Box className="open-trail" sx={{ flexGrow: 0.75 }}>
      <Breadcrumbs aria-label="breadcrumb" color="color.secondary">
        <Link underline="hover" color="inherit" href="#">
          Open Trail
        </Link>
        <Typography>Trails</Typography>
      </Breadcrumbs>
      <div>
        Outil d'assitance en ligne à l'organisation de randonnées pédestres ou
        cyclistes longues distances.
      </div>
      <FormControl>
        <Button component="label" variant="contained">
          Télécharger un GPX
          <VisuallyHiddenInput
            accept=".gpx"
            onChange={(event) => setFile(event.target.files[0])}
            type="file"
          />
        </Button>
        {file && !gpx && <div>Spinner</div>}
        {gpx && (
          <>
            <TextField
              defaultValue={name}
              label="Nom de la randonnée"
              onChange={(event) => setName(event.target.value)}
              required
              variant="filled"
            />
            <Select
              defaultValue={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              <MenuItem value={"hiking"}>Randonnée pédestre</MenuItem>
              <MenuItem value={"cycling"}>Randonnée cycliste</MenuItem>
            </Select>
            <TextField
              defaultValue={kmPerDay}
              InputProps={{ inputProps: { min: 0 } }}
              label="Kilomètres parcourus par jour (ITRA)"
              onChange={(event) => setKmPerDay(Number(event.target.value))}
              type="number"
              variant="filled"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  defaultValue={startDate}
                  format="DD/MM/YYYY"
                  label="Jour du départ"
                  name="departureDate"
                  onChange={(event) => setStartDate(event)}
                />
              </DemoContainer>
            </LocalizationProvider>
            <Button
              component="label"
              onClick={() =>
                navigate("/trails/trail", {
                  state: {
                    activity,
                    file,
                    gpx,
                    kmPerDay,
                    name,
                    startDate,
                  },
                })
              }
              variant="contained"
            >
              Envoyer
            </Button>
          </>
        )}
      </FormControl>
      <div>
        <i>Exemples:</i>
        <ul>
          {Object.keys(data).map((trail) => (
            <li key={trail}>
              <Link href={`#/trails/${trail}`}>{data[trail].name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </Box>
  );
};

export default Trails;
