import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from './Spinner'; // Crearemos este componente

const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    // Muestra un spinner o similar mientras se verifica el estado de autenticación
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-slate-900">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirigir a login, guardando la ubicación a la que intentaban acceder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Si está autenticado, renderiza el contenido de la ruta anidada
};

export default PrivateRoute;
