import React from 'react';

export default function DashboardHomePage() {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Bienvenido al Dashboard de OptiSys</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">Selecciona una opción del menú lateral para comenzar.</p>
    </div>
  );
}