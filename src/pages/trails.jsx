import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Link,
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

const VisuallyHiddenInput = styled("input")({
  bottom: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  left: 0,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

const Trails = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState();
  const [gpx, setGpx] = useState();
  const [itra, setItra] = useState(false);
  const [kmPerDay, setKmPerDay] = useState(20);
  const [name, setName] = useState();
  const [startDate, setStartDate] = useState(dayjs(new Date().toISOString().split("T")[0]));

  const trails = {
    "hexatrek": "Hexatrek - 16/06/2025 -> 12/11/2025",
    "cretes-du-jura": "Crêtes du Jura - Septembre 2024",
    "le-poet-sigillat": "La Chapelle en Vercors -> Le Poët-Sigillat - Août 2024",
    "gr38": "GR38 - Redon -> Gourin",
    "tour-du-queyras": "GR58 - Tour du Queyras",
    "picos-de-europa": "Picos de Europa",
    "chemin-d-assise": "Chemin d'Assise",
    "nantes-echalas": "Nantes -> Echalas",
  }

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
          <FormGroup>
            <TextField
              defaultValue={name}
              label="Nom de la randonnée"
              onChange={(event) => setName(event.target.value)}
              required
              variant="filled"
            />
            <TextField
              defaultValue={kmPerDay}
              InputProps={{ inputProps: { min: 0 } }}
              label="Kilomètres parcourus par jour"
              onChange={(event) => setKmPerDay(Number(event.target.value))}
              type="number"
              variant="filled"
            />
            <FormControlLabel
              control={<Checkbox checked={itra} onChange={(event) => setItra(event.target.checked)} />}
              label="Calcul des distances en kilomètre-effort (km-e)"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  defaultValue={startDate}
                  format="DD/MM/YYYY"
                  label="Jour du départ"
                  onChange={(event) => setStartDate(event)}
                />
              </DemoContainer>
            </LocalizationProvider>
            <Button
              component="label"
              onClick={() =>
                navigate("/trails/trail", {
                  state: {
                    gpx,
                    itra,
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
          </FormGroup>
        )}
      </FormControl>
      <div>
        <p>Exemples:</p>
        <ul>
          {Object.keys(trails).map((trail) => (
            <li key={trail}>
              <Link href={`#/trails/${trail}`}>
                {trails[trail]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Box>
  );
};

export default Trails;
