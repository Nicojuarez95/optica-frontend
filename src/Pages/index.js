import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../Layouts/MainLayout.jsx'; // El layout principal para el dashboard
// import AuthLayout from '../Layouts/AuthLayout.jsx'; // Opcional si quieres un layout diferente para login/register

// Componentes de Ruta Privada
import PrivateRoute from '../Components/Common/PrivateRouter.jsx';

// Páginas de Autenticación
import LoginPage from './Auth/LoginPage.jsx';
import RegisterPage from './Auth/RegisterPage.jsx';

// Páginas del Dashboard (crearemos estas)
import DashboardHomePage from './Dashboard/DashboardHomePage.jsx';
import PacientesPage from './Dashboard/PacientesPage.jsx';
import CitasPage from './Dashboard/CitasPage.jsx';
import InventarioPage from './Dashboard/InventarioPage.jsx';
// import ConfiguracionPage from './Dashboard/ConfiguracionPage.jsx';

// Tu componente IndexLayout original podría ser el AuthLayout si es simple
// import IndexLayout from "../Layouts/IndexLayout"; // Ya no lo usaremos directamente así

export const router = createBrowserRouter([
  // Rutas de Autenticación (públicas)
  // Puedes usar un AuthLayout si quieres un wrapper diferente para estas páginas
  // {
  //   element: <AuthLayout />, // O simplemente <Outlet /> si no hay layout específico
  //   children: [
  //     { path: '/login', element: <LoginPage /> },
  //     { path: '/register', element: <RegisterPage /> },
  //   ]
  // },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // Rutas Protegidas del Dashboard
  {
    path: '/dashboard',
    element: <PrivateRoute />, // Protege todas las rutas anidadas
    children: [
      {
        element: <MainLayout />, // El layout principal con sidebar/navbar
        children: [
          { index: true, element: <Navigate to="home" replace /> }, // Redirige /dashboard a /dashboard/home
          { path: 'home', element: <DashboardHomePage /> },
          { path: 'pacientes', element: <PacientesPage /> },
          { path: 'citas', element: <CitasPage /> },
          { path: 'inventario', element: <InventarioPage /> },
          // { path: 'configuracion', element: <ConfiguracionPage /> },
          // Cualquier otra ruta del dashboard aquí
        ],
      },
    ],
  },

  // Redirección por defecto si no está logueado y va a la raíz,
  // o si la ruta no existe y no está logueado.
  // Si está logueado y va a una ruta no definida dentro de /dashboard,
  // podrías manejar un "NotFound" dentro de MainLayout.
  {
    path: '*',
    element: <Navigate to="/login" replace />, // O a /dashboard/home si está autenticado
  },
]);
