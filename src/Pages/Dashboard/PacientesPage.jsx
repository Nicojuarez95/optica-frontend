import React from 'react';
import GestionPacientes from '../../Components/Pacientes/GestionPacientes'; // <--- IMPORTA EL COMPONENTE

export default function PacientesPage() {
  return (
    // El layout principal ya aplica padding y fondo, así que GestionPacientes puede ir directo
    <GestionPacientes />
  );
}
