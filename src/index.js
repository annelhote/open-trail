import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import Books from './pages/books';
import ErrorPage from './pages/error-page';
import Movies from './pages/movies';
import Trail from './pages/trail';
import Trails from './pages/trails';
import Welcome from './pages/welcome';

import './index.scss';

const router = createHashRouter([
  {
    path: '/',
    element: <Welcome />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/livres',
    element: <Books />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/films',
    element: <Movies />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/trails',
    element: <Trails />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/trails/:trailId',
    element: <Trail />,
    errorElement: <ErrorPage />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
