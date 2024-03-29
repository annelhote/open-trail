import { Breadcrumbs, Link, Typography } from '@mui/material';

const BlogHome = () => {
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Link underline="hover" color="inherit" href="#">
          Open Trails
        </Link>
        <Typography>Blog</Typography>
      </Breadcrumbs>
      <div>
        <ul>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/1">
              Fabriquez son propre équipement - Sac à dos
            </Link>
          </li>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/2">
              Bidouiller des GPX
            </Link>
          </li>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/3">
              Films
            </Link>
          </li>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/4">
              Livres
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default BlogHome;
