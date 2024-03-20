import { Breadcrumbs, Link, Typography } from '@mui/material';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';



const Blog = () => {
  const params = useParams();
  const [markdown, setMarkdown] = useState();

  import(`../blog/${params.id}.md`).then((res) => {
    fetch(res.default)
      .then((response) => response.text())
      .then((text) => setMarkdown(text))
  })

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
      <ReactMarkdown>
        {markdown}
      </ReactMarkdown>
    </>
  );
};

export default Blog;
