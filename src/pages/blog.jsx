import ReactMarkdown from 'react-markdown';
import { Breadcrumbs, Link, Typography } from '@mui/material';

const Blog = () => {
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Link underline="hover" color="inherit" href="/">
          Open Trails
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/blog"
        >
          Blog
        </Link>
        <Typography>Projet Couture</Typography>
      </Breadcrumbs>
      <div>
        <ReactMarkdown>*React-Markdown* is **Awesome**</ReactMarkdown>
      </div>
    </>
  );
};

export default Blog;
