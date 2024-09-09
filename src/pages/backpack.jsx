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
import materials from "./materials.json";

const BackPack = () => {
  const [activity, setActivity] = useState("hiking");
  const [isUltralight, setIsUltralight] = useState(true);

  return (
    <Box className="open-trail" sx={{ flexGrow: 0.75 }}>
      <Breadcrumbs aria-label="breadcrumb" color="color.secondary">
        <Link color="inherit" href="#" underline="hover">
          Open Trail
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
            onChange={(_, value) => setActivity(value)}
          >
            <FormControlLabel
              control={<Radio />}
              label="Randonnée pédestre"
              value="hiking"
            />
            <FormControlLabel
              control={<Radio />}
              label="Randonnée cyclo"
              value="cycling"
            />
          </RadioGroup>
        </FormControl>
        <FormControlLabel
          label="Ultra light"
          control={
            <Checkbox
              checked={isUltralight}
              onChange={(event) => setIsUltralight(event.target.checked)}
            />
          }
        />
      </div>
      {Object.keys(materials).map((category) => (
        <>
          <h3 key={`category-${category}`}>{capitalize(category)}</h3>
          <ul>
            {materials[category]
              .filter((item) => [activity, undefined].includes(item.activity))
              .filter((item) => (isUltralight ? item?.mandatory ?? true : true))
              .map(({ material }, i) => (
                <li key={`category-${category}-material-${i}`}>{capitalize(material)}</li>
              ))}
          </ul>
        </>
      ))}
    </Box>
  );
};

export default BackPack;
