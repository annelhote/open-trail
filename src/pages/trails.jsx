import { Box, Breadcrumbs, Link, Typography } from "@mui/material";

import data from "../data/data.json";

const Trails = () => {
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
      <div>
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
