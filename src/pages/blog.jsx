import { Breadcrumbs, Link, Typography } from '@mui/material';
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
    <>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Link underline="hover" color="inherit" href="/">
          Open Trails
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="#/blog"
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
    </>
  );
};

export default Blog;
