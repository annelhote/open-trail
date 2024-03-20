import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <>
      <Link to="/">
        <h1>Open Trails</h1>
      </Link>
      <div>
        <ul>
          <li>
            <Link to="/trails">Trails</Link>
          </li>
          <li>
            <Link to="/livres">Livres</Link>
          </li>
          <li>
            <Link to="/films">Films</Link>
          </li>
          <li>
            <Link to="/blog">Blog</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Welcome;
