import { Breadcrumbs, Link, Typography } from '@mui/material';

const Books = () => {
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" color="color.scecondary">
        <Link underline="hover" color="inherit" href="/">
          Open Trails
        </Link>
        <Typography>Livres</Typography>
      </Breadcrumbs>
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
