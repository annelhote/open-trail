import { Breadcrumbs, Link, Typography } from "@mui/material";

import data from "../data/data.json";

const Trails = () => {
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Link underline="hover" color="inherit" href="#">
          Open Trails
        </Link>
        <Typography>Trails</Typography>
      </Breadcrumbs>
      <div>
        Outil d'assitance en ligne à la l'organisation de randonnées pédestres
        ou cyclo sur plusieurs jours
      </div>
      <div>
        <ul>
          {Object.keys(data).map((trail) => (
            <li key={trail}>
              <Link href={`#/trails/${trail}`}>
                {data[trail].name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Trails;
