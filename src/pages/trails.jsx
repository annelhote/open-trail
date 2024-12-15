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
import dayjs from "dayjs";
import { useEffect } from "react";
import { useState } from "react";
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
              label="Nom de la randonnée"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
              variant="filled"
            />
            <Select
              onChange={(event) => setActivity(event.target.value)}
              value={activity}
            >
              <MenuItem value={"hiking"}>Randonnée pédestre</MenuItem>
              <MenuItem value={"cycling"}>Randonnée cycliste</MenuItem>
            </Select>
            <TextField
              InputProps={{ inputProps: { min: 0 } }}
              label="Kilomètres parcourus par jour (ITRA)"
              onChange={(event) => setKmPerDay(event.target.value)}
              type="number"
              value={kmPerDay}
            />
            {/* TODO: Add date picker for the start date */}
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
                    startDate: dayjs(new Date().toISOString().split("T")[0]),
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
