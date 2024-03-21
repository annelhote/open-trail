import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import Blog from './pages/blog';
import BlogHome from './pages/blog-home';
import ErrorPage from './pages/error-page';
import Home from './pages/home';
import Trail from './pages/trail';
import Trails from './pages/trails';

import './index.scss';

const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/blog',
    element: <BlogHome />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/blog/:id',
    element: <Blog />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/trails',
    element: <Trails />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/trails/:id',
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
