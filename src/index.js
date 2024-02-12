import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import ErrorPage from './pages/error-page';
import Trail from './pages/trail';
import Trails from './pages/trails';

import './index.scss';

const router = createHashRouter([
  {
    path: '/',
    element: <Trails />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/trails/:trailId',
    element: <Trail />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
