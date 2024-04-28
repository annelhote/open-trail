import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';

const Blog = () => {
  const params = useParams();

  const [markdown, setMarkdown] = useState();
  const [title, setTitle] = useState();

  useEffect(() => {
    import(`../blog/${params.id}.md`).then((res) => {
      fetch(res.default)
        .then((response) => response.text())
        .then((text) => {
          setMarkdown(text);
          setTitle(text.match(/(?<=(^#)\s).*/g)[0])
        });
    });
  }, [params.id]);

  return (
    <Box className="open-trail" sx={{ flexGrow: 0.75 }}>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Link
          color="inherit"
          href="#"
          underline="hover"
        >
          Open Trails
        </Link>
        <Link
          color="inherit"
          href="#/blog"
          underline="hover"
        >
          Blog
        </Link>
        <Typography>
          {title}
        </Typography>
      </Breadcrumbs>
      <ReactMarkdown>
        {markdown}
      </ReactMarkdown>
    </Box>
  );
};

export default Blog;
