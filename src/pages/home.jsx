import { Breadcrumbs, Link, Typography } from '@mui/material';

const Home = () => {
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Typography>Open Trails</Typography>
      </Breadcrumbs>
      <div>
        <ul>
          <li>
            <Link color="inherit" href="#/trails" underline="hover">
              Trails
            </Link>
          </li>
          <li>
            <Link color="inherit" href="#/blog" underline="hover">
              Blog
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Home;
