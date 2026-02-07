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
              Films d'aventure longue distance
            </Link>
          </li>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/4">
              Livres d'aventure longue distance
            </Link>
          </li>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/5">
              Que mettre dans son sac à dos ?
            </Link>
          </li>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/6">
              Hydratation et alimentation
            </Link>
          </li>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/7">
              Choisir sa tente ultra-light
            </Link>
          </li>
          <li>
            <Link underline="hover" color="inherit" href="#/blog/8">
              Contruire mon itinéraire Hexatrek
            </Link>
          </li>
        </ul>
      </div>
    </Box>
  );
};

export default BlogHome;
