import { Breadcrumbs, Link, Typography } from '@mui/material';

const Movies = () => {
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Link underline="hover" color="inherit" href="/">
          Open Trails
        </Link>
        <Typography>Films</Typography>
      </Breadcrumbs>
      <div>
        <ul>
          <li>
            Wild de Jean-Marc Vallée: https://www.imdb.com/title/tt2305051/
          </li>
        </ul>
      </div>
    </>
  );
};

export default Movies;
