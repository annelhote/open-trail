import { Breadcrumbs, Link, Typography } from '@mui/material';

const BlogHome = () => {
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Link underline="hover" color="inherit" href="/">
          Open Trails
        </Link>
        <Typography>Blog</Typography>
      </Breadcrumbs>
      <div>
        <ul>
          <li>
            <Link to="/blog/1">
              <h1>Projet couture</h1>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default BlogHome;
