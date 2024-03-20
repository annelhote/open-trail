import { Link } from "react-router-dom";

const BlogHome = () => {
  return (
    <>
      <Link to="/">
        <h1>Open Trails</h1>
      </Link>
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
