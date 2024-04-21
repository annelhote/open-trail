import { Breadcrumbs, Link, Typography } from '@mui/material';

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
        Outil d'assitance en ligne à la l'organisation de randonnées pédestres ou cyclo sur plusieurs jours
      </div>
      <div>
        <ul>
          <li>
            <Link href="#/trails/le-poet-sigillat">Le Poët-Sigillat (juillet 2024)</Link>
          </li>
          <li>
            <Link href="#/trails/picos-de-europa">Picos de Europa (@coco)</Link>
          </li>
          <li>
            <Link href="#/trails/tour-du-queyras">Tour du Queyras - GR58 (septembre 2022)</Link>
          </li>
          <li>
            <Link href="#/trails/gr38">GR38 (septembre 2022)</Link>
          </li>
          <li>
            <Link href="#/trails/chemin-d-assise-01">Chemin d'Assise</Link>
          </li>
          <li>
            <Link href="#/trails/nantes-echalas">Nantes -> Echalas</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Trails;
