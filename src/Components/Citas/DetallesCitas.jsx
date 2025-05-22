import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DetallesCitas({ cita, onEditar, onEliminar }) {
  return (
    <div className="p-4 border rounded-md dark:border-slate-600 dark:bg-slate-800">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold">{cita.pacienteNombre}</h4>
          <p className="text-sm text-gray-500">
            {format(new Date(cita.fechaHora), "PPPp", { locale: es })}
          </p>
          <p className="text-sm">Tipo: {cita.tipoCita}</p>
          {cita.optometristaAsignado && (
            <p className="text-sm">Optometrista: {cita.optometristaAsignado}</p>
          )}
          {cita.notasCita && (
            <p className="text-sm italic text-gray-400 mt-1">{cita.notasCita}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onEditar} className="text-blue-600 hover:underline">Editar</button>
          <button onClick={onEliminar} className="text-red-600 hover:underline">Eliminar</button>
        </div>
      </div>
    </div>
  );
}
