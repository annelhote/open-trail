import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import dayjs from 'dayjs';
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
import 'dayjs/locale/fr';

dayjs.locale('fr');

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
    path: '/trails/:id/:day?',
    element: <Trail />,
    errorElement: <ErrorPage />,
  }
]);

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: "#27272a"
    },
    text:{
      primary: "#e4e5e6"
    }
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
