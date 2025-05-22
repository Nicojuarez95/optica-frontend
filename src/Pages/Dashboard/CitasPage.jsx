import React from 'react';
import GestionCitas from '../../Components/Citas/GestionCitas'; // Cuando lo crees

export default function CitasPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Gestión de Citas</h1>
      {<GestionCitas />}
    </div>
  );
}
