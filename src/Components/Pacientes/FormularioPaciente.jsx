import React, { useState, useEffect } from 'react';
import Spinner from '../Common/Spinner'; // Asumiendo que tienes un componente Spinner
import { Save, XCircle } from 'lucide-react';

export default function FormularioPaciente({ pacienteInicial, onGuardar, onCancelar, isLoading }) {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    email: '',
    fechaNacimiento: '',
    direccion: '',
    ocupacion: '',
    antecedentesMedicos: '',
    notasAdicionales: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (pacienteInicial) {
      setFormData({
        nombreCompleto: pacienteInicial.nombreCompleto || '',
        telefono: pacienteInicial.telefono || '',
        email: pacienteInicial.email || '',
        fechaNacimiento: pacienteInicial.fechaNacimiento ? new Date(pacienteInicial.fechaNacimiento).toISOString().split('T')[0] : '',
        direccion: pacienteInicial.direccion || '',
        ocupacion: pacienteInicial.ocupacion || '',
        antecedentesMedicos: pacienteInicial.antecedentesMedicos || '',
        notasAdicionales: pacienteInicial.notasAdicionales || '',
      });
    } else {
      // Resetear formulario si no hay paciente inicial (modo creación)
      setFormData({
        nombreCompleto: '', telefono: '', email: '', fechaNacimiento: '',
        direccion: '', ocupacion: '', antecedentesMedicos: '', notasAdicionales: '',
      });
    }
    setErrors({}); // Limpiar errores al cambiar de paciente o al abrir
  }, [pacienteInicial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error específico al empezar a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es obligatorio.';
    }
    // Validación básica de email (puedes hacerla más robusta)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido.';
    }
    // Validación básica de teléfono (puedes hacerla más específica)
    if (formData.telefono && !/^[0-9+\-\s()]*$/.test(formData.telefono)) {
        newErrors.telefono = 'El formato del teléfono no es válido.';
    }
    // Puedes añadir más validaciones aquí (ej. fecha de nacimiento no futura)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Devuelve true si no hay errores
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onGuardar(formData);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="nombreCompleto" className={labelClass}>Nombre Completo*</label>
        <input type="text" name="nombreCompleto" id="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} className={inputClass} />
        {errors.nombreCompleto && <p className="text-xs text-red-500 mt-1">{errors.nombreCompleto}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefono" className={labelClass}>Teléfono</label>
          <input type="tel" name="telefono" id="telefono" value={formData.telefono} onChange={handleChange} className={inputClass} />
          {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="fechaNacimiento" className={labelClass}>Fecha de Nacimiento</label>
        <input type="date" name="fechaNacimiento" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className={inputClass} />
      </div>

      <div>
        <label htmlFor="direccion" className={labelClass}>Dirección</label>
        <textarea name="direccion" id="direccion" rows="2" value={formData.direccion} onChange={handleChange} className={inputClass}></textarea>
      </div>
      
      <div>
        <label htmlFor="ocupacion" className={labelClass}>Ocupación</label>
        <input type="text" name="ocupacion" id="ocupacion" value={formData.ocupacion} onChange={handleChange} className={inputClass} />
      </div>

      <div>
        <label htmlFor="antecedentesMedicos" className={labelClass}>Antecedentes Médicos Relevantes</label>
        <textarea name="antecedentesMedicos" id="antecedentesMedicos" rows="3" value={formData.antecedentesMedicos} onChange={handleChange} className={inputClass}></textarea>
      </div>

      <div>
        <label htmlFor="notasAdicionales" className={labelClass}>Notas Adicionales</label>
        <textarea name="notasAdicionales" id="notasAdicionales" rows="3" value={formData.notasAdicionales} onChange={handleChange} className={inputClass}></textarea>
      </div>

      <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200 dark:border-slate-700 mt-6">
        <button
          type="button"
          onClick={onCancelar}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 rounded-md shadow-sm border border-gray-300 dark:border-slate-500 flex items-center"
        >
          <XCircle size={18} className="mr-2" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-70"
        >
          {isLoading ? <Spinner size="h-5 w-5" color="border-white" /> : <Save size={18} className="mr-2" />}
          {pacienteInicial ? 'Guardar Cambios' : 'Crear Paciente'}
        </button>
      </div>
    </form>
  );
}
