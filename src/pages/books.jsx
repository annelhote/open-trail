import { Link } from "react-router-dom";

const Books = () => {
  return (
    <>
      <Link to="/">
        <h1>Open Trails</h1>
      </Link>
      <div>
        <ul>
          <li>
            La nuit de feu - Eric-Emmanuel Schmitt
          </li>
          <li>
            Wild de Cheryl Strayed: https://www.librairiesindependantes.com/product/9782264062208/
          </li>
          <li>
            Americana Ou Comment J'Ai Renoncé À Mon Rêve Américain de Luke Healy: https://www.librairiesindependantes.com/product/9782203211933/
          </li>
        </ul>
      </div>
    </>
  );
};

export default Books;
