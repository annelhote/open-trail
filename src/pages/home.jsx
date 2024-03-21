import { Breadcrumbs, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Typography>Open Trails</Typography>
      </Breadcrumbs>
      <div>
        <ul>
          <li>
            <Link to="/trails">Trails</Link>
          </li>
          <li>
            <Link to="/blog">Blog</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Home;
