import { Link } from "react-router-dom";

const Movies = () => {
  return (
    <>
      <Link to="/">
        <h1>Open Trails</h1>
      </Link>
      <div>
        <ul>
          <li>
            Wild de Jean-Marc Vallée: https://www.imdb.com/title/tt2305051/
          </li>
        </ul>
      </div>
    </>
  );
};

export default Movies;
