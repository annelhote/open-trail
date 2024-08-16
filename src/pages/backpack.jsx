import {
  Box,
  Breadcrumbs,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { capitalize } from "../utils";
import materials from "./backpack.json";

const BackPack = () => {
  const [activity, setActivity] = useState("hiking");
  const [ultralight, setUltralight] = useState(true);

  return (
    <Box className="open-trail" sx={{ flexGrow: 0.75 }}>
      <Breadcrumbs aria-label="breadcrumb" color="color.secondary">
        <Link color="inherit" href="#" underline="hover">
          Open Trails
        </Link>
        <Link color="inherit" href="#/blog" underline="hover">
          Blog
        </Link>
        <Typography>Sac à dos</Typography>
      </Breadcrumbs>
      <div>
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">Activité</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            value={activity}
            onChange={(event, value) => setActivity(value)}
          >
            <FormControlLabel
              value="hiking"
              control={<Radio />}
              label="Randonnée pédestre"
            />
            <FormControlLabel
              value="cycling"
              control={<Radio />}
              label="Randonnée cyclo"
            />
          </RadioGroup>
        </FormControl>
        <FormControlLabel
          label="Ultra light"
          control={
            <Checkbox
              checked={ultralight}
              onChange={(event) => setUltralight(event.target.checked)}
            />
          }
        />
      </div>
      {Object.keys(materials).map((category) => (
        <>
          <h3 key={category}>{capitalize(category)}</h3>
          <ul>
            {materials[category]
              .filter((item) => [activity, undefined].includes(item.activity))
              .filter((item) => (ultralight ? item?.mandatory ?? true : true))
              .map(({ material }, i) => (
                <li key={`material-${i}`}>{capitalize(material)}</li>
              ))}
          </ul>
        </>
      ))}
    </Box>
  );
};

export default BackPack;
