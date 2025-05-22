import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPacientes } from '../../store/slices/pacienteSlice'; // Para el selector de pacientes
import { Save, XCircle } from 'lucide-react';

const initialStateForm = {
  pacienteId: '',
  fechaHora: '', // Se guardará como ISO string, pero el input es datetime-local
  duracionEstimadaMinutos: '30',
  tipoCita: 'Examen Visual',
  optometristaAsignado: '',
  notasCita: '',
  estado: 'Programada', // Estado por defecto para nuevas citas
};

export default function FormularioCitaControlado({ citaInicial, onGuardar, onCancelar, isLoading, formKey }) {
  const dispatch = useDispatch();
  const { pacientes, isLoading: isLoadingPacientes } = useSelector((state) => state.pacientes);
  const { user: opticoLogueado } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(initialStateForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!pacientes || pacientes.length === 0) {
      dispatch(fetchPacientes());
    }
  }, [dispatch, pacientes]);

  useEffect(() => {
    if (citaInicial) {
      setFormData({
        pacienteId: citaInicial.pacienteId?._id || citaInicial.pacienteId || '',
        fechaHora: citaInicial.fechaHora ? new Date(citaInicial.fechaHora).toISOString().substring(0, 16) : '',
        duracionEstimadaMinutos: citaInicial.duracionEstimadaMinutos?.toString() || '30',
        tipoCita: citaInicial.tipoCita || 'Examen Visual',
        optometristaAsignado: citaInicial.optometristaAsignado || (opticoLogueado ? opticoLogueado.name : ''),
        notasCita: citaInicial.notasCita || '',
        estado: citaInicial.estado || 'Programada',
      });
    } else {
      setFormData({
        ...initialStateForm,
        optometristaAsignado: opticoLogueado ? opticoLogueado.name : '',
      });
    }
    setErrors({});
  }, [citaInicial, formKey, opticoLogueado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.pacienteId) newErrors.pacienteId = 'Debe seleccionar un paciente.';
    if (!formData.fechaHora) newErrors.fechaHora = 'La fecha y hora son obligatorias.';
    if (!formData.tipoCita) newErrors.tipoCita = 'El tipo de cita es obligatorio.';
    if (isNaN(parseInt(formData.duracionEstimadaMinutos)) || parseInt(formData.duracionEstimadaMinutos) <= 0) {
      newErrors.duracionEstimadaMinutos = 'La duración debe ser un número positivo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      const datosParaGuardar = {
        ...formData,
        fechaHora: new Date(formData.fechaHora).toISOString(),
        duracionEstimadaMinutos: parseInt(formData.duracionEstimadaMinutos),
      };
      onGuardar(datosParaGuardar);
    }
  }, [validateForm, formData, onGuardar]);

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1";
  const selectClass = `${inputClass} appearance-none`;

  const tiposDeCita = ['Examen Visual', 'Adaptación Lentes de Contacto', 'Revisión', 'Urgencia', 'Otro'];
  const estadosDeCita = ['Programada', 'Confirmada', 'Cancelada por Paciente', 'Cancelada por Óptica', 'Completada', 'No Asistió'];

  return (
    <div className="p-1">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`pacienteId-cita-${formKey}`} className={labelClass}>Paciente*</label>
          <select
            name="pacienteId"
            id={`pacienteId-cita-${formKey}`}
            value={formData.pacienteId}
            onChange={handleChange}
            className={selectClass}
            disabled={isLoadingPacientes}
          >
            <option value="">{isLoadingPacientes ? 'Cargando pacientes...' : 'Seleccione un paciente'}</option>
            {pacientes.map(p => (
              <option key={p._id} value={p._id}>{p.nombreCompleto}</option>
            ))}
          </select>
          {errors.pacienteId && <p className="text-xs text-red-500 mt-1">{errors.pacienteId}</p>}
        </div>

        <div>
          <label htmlFor={`fechaHora-cita-${formKey}`} className={labelClass}>Fecha y Hora*</label>
          <input
            type="datetime-local"
            name="fechaHora"
            id={`fechaHora-cita-${formKey}`}
            value={formData.fechaHora}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.fechaHora && <p className="text-xs text-red-500 mt-1">{errors.fechaHora}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`duracionEstimadaMinutos-cita-${formKey}`} className={labelClass}>Duración (minutos)*</label>
            <input
              type="number"
              name="duracionEstimadaMinutos"
              id={`duracionEstimadaMinutos-cita-${formKey}`}
              value={formData.duracionEstimadaMinutos}
              onChange={handleChange}
              className={inputClass}
              min="5"
              step="5"
            />
            {errors.duracionEstimadaMinutos && <p className="text-xs text-red-500 mt-1">{errors.duracionEstimadaMinutos}</p>}
          </div>

          <div>
            <label htmlFor={`tipoCita-cita-${formKey}`} className={labelClass}>Tipo de Cita*</label>
            <select
              name="tipoCita"
              id={`tipoCita-cita-${formKey}`}
              value={formData.tipoCita}
              onChange={handleChange}
              className={selectClass}
            >
              {tiposDeCita.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            {errors.tipoCita && <p className="text-xs text-red-500 mt-1">{errors.tipoCita}</p>}
          </div>
        </div>

        <div>
          <label htmlFor={`optometristaAsignado-cita-${formKey}`} className={labelClass}>Optometrista Asignado</label>
          <input
            type="text"
            name="optometristaAsignado"
            id={`optometristaAsignado-cita-${formKey}`}
            value={formData.optometristaAsignado}
            onChange={handleChange}
            className={inputClass}
            placeholder="Nombre del optometrista"
          />
        </div>

        {citaInicial && (
          <div>
            <label htmlFor={`estado-cita-${formKey}`} className={labelClass}>Estado de la Cita</label>
            <select
              name="estado"
              id={`estado-cita-${formKey}`}
              value={formData.estado}
              onChange={handleChange}
              className={selectClass}
            >
              {estadosDeCita.map(est => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor={`notasCita-cita-${formKey}`} className={labelClass}>Notas Adicionales</label>
          <textarea
            name="notasCita"
            id={`notasCita-cita-${formKey}`}
            rows="3"
            value={formData.notasCita}
            onChange={handleChange}
            className={inputClass}
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200 dark:border-slate-700 mt-5">
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
            disabled={isLoading || isLoadingPacientes}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
          >
            <Save size={18} className="mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
