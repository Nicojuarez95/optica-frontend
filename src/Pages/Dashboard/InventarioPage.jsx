import React from 'react';
import GestionInventario from '../../Components/Inventario/GestionInventario'; // Cuando lo crees

export default function InventarioPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Gestión de Inventario</h1>
      {<GestionInventario />}
      <p className="text-gray-600 dark:text-gray-300">Contenido de gestión de inventario irá aquí. Sigue el patrón de PacientesPage.</p>
    </div>
  );
}
