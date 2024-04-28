import { Box, Breadcrumbs, Link, Typography } from '@mui/material';

const Home = () => {
  return (
    <Box className="open-trail" sx={{ flexGrow: 0.75 }}>
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
    </Box>
  );
};

export default Home;
