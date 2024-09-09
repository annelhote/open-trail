import { Box, Breadcrumbs, Link, Typography } from "@mui/material";

const BlogHome = () => {
  return (
    <Box className="open-trail" sx={{ flexGrow: 0.75 }}>
      <Breadcrumbs aria-label="breadcrumb" color="color.secondary">
        <Link underline="hover" color="inherit" href="#">
          Open Trail
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
          <li>
            <Link underline="hover" color="inherit" href="#/blog/5">
              Sac à dos
            </Link>
          </li>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/6">
              Hydratation et alimentation
            </Link>
          </li>
        </ul>
      </div>
    </Box>
  );
};

export default BlogHome;
