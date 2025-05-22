import React, { useState, useEffect } from 'react';

export default function FormularioPacienteUltraSimple({ pacienteInicial, onGuardar, onCancelar, isLoading }) {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ocupacion, setOcupacion] = useState('');
  const [antecedentesMedicos, setAntecedentesMedicos] = useState('');
  const [ultimaVisita, setUltimaVisita] = useState('');
  const [notasAdicionales, setNotasAdicionales] = useState('');

  const [errorNombre, setErrorNombre] = useState('');
  const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1";

  useEffect(() => {
    if (pacienteInicial) {
      setNombreCompleto(pacienteInicial.nombreCompleto || '');
      setTelefono(pacienteInicial.telefono || '');
      setEmail(pacienteInicial.email || '');
      setFechaNacimiento(pacienteInicial.fechaNacimiento?.slice(0, 10) || '');
      setDireccion(pacienteInicial.direccion || '');
      setOcupacion(pacienteInicial.ocupacion || '');
      setAntecedentesMedicos(pacienteInicial.antecedentesMedicos || '');
      setUltimaVisita(pacienteInicial.ultimaVisita?.slice(0, 10) || '');
      setNotasAdicionales(pacienteInicial.notasAdicionales || '');
    } else {
      setNombreCompleto('');
      setTelefono('');
      setEmail('');
      setFechaNacimiento('');
      setDireccion('');
      setOcupacion('');
      setAntecedentesMedicos('');
      setUltimaVisita('');
      setNotasAdicionales('');
    }
    setErrorNombre('');
  }, [pacienteInicial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombreCompleto.trim()) {
      setErrorNombre('El nombre es obligatorio.');
      return;
    }

    const nuevoPaciente = {
      nombreCompleto,
      telefono,
      email,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      direccion,
      ocupacion,
      antecedentesMedicos,
      ultimaVisita: ultimaVisita ? new Date(ultimaVisita) : null,
      notasAdicionales,
    };

    setErrorNombre('');
    onGuardar(nuevoPaciente);
  };

  return (
    <div className="p-4 my-4 border rounded-md dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">
        {pacienteInicial ? 'Editar Paciente' : 'Nuevo Paciente'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className={labelClass}>Nombre Completo*</label>
          <input id="nombre" type="text" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} className={inputClass} />
          {errorNombre && <p className="text-xs text-red-500 mt-1">{errorNombre}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className={labelClass}>Teléfono</label>
          <input id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputClass} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label htmlFor="fechaNacimiento" className={labelClass}>Fecha de Nacimiento</label>
          <input id="fechaNacimiento" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className={inputClass} />
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="direccion" className={labelClass}>Dirección</label>
          <input id="direccion" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className={inputClass} />
        </div>

        {/* Ocupación */}
        <div>
          <label htmlFor="ocupacion" className={labelClass}>Ocupación</label>
          <input id="ocupacion" type="text" value={ocupacion} onChange={(e) => setOcupacion(e.target.value)} className={inputClass} />
        </div>

        {/* Antecedentes Médicos */}
        <div>
          <label htmlFor="antecedentes" className={labelClass}>Antecedentes Médicos</label>
          <textarea id="antecedentes" value={antecedentesMedicos} onChange={(e) => setAntecedentesMedicos(e.target.value)} className={inputClass} />
        </div>

        {/* Última visita */}
        <div>
          <label htmlFor="ultimaVisita" className={labelClass}>Última Visita</label>
          <input id="ultimaVisita" type="date" value={ultimaVisita} onChange={(e) => setUltimaVisita(e.target.value)} className={inputClass} />
        </div>

        {/* Notas adicionales */}
        <div>
          <label htmlFor="notas" className={labelClass}>Notas Adicionales</label>
          <textarea id="notas" value={notasAdicionales} onChange={(e) => setNotasAdicionales(e.target.value)} className={inputClass} />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : (pacienteInicial ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
}