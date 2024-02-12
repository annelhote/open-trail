import { Link } from "react-router-dom";

const Trails = () => {
  return (
    <>
      <Link to="/trails">
        <h1>Open Trails</h1>
      </Link>
      <div>
        <ul>
          <li>
            <Link to="/trails/le-poet-sigillat">Le Poët-Sigillat (juillet 2024)</Link>
          </li>
          <li>
            <Link to="/trails/picos-de-europa">Picos de Europa (@coco)</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Trails;
