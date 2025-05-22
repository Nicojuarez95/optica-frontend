import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Edit3, PlusCircle, ChevronDown, ChevronUp, FileText, CalendarDays, Phone, Mail, MapPin, Briefcase, Stethoscope, StickyNote } from 'lucide-react';
import { addNewPrescripcion } from '../../store/slices/pacienteSlice';
import Spinner from '../Common/Spinner';
import Modal from '../Common/ModalControlado'; // Para el formulario de nueva prescripción

const InfoItem = ({ icon, label, value, isBlock = false }) => (
  <div className={`flex items-start ${isBlock ? 'flex-col items-start w-full' : 'mb-2'}`}>
    {React.cloneElement(icon, { size: 16, className: "text-indigo-500 dark:text-indigo-400 mr-2 mt-1 flex-shrink-0" })}
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
      <span className="text-sm text-gray-800 dark:text-slate-200 break-words">{value || 'N/A'}</span>
    </div>
  </div>
);

const FormularioPrescripcion = ({ pacienteId, onClose, isLoading }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        optometristaResponsable: '',
        diagnostico: '',
        graduacionOD: '',
        graduacionOI: '',
        adicion: '',
        dp: '',
        observaciones: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null}));
    };

    const validatePrescripcion = () => {
        const newErrors = {};
        if (!formData.diagnostico.trim()) newErrors.diagnostico = 'El diagnóstico es obligatorio.';
        // Añadir más validaciones si es necesario
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitPrescripcion = async (e) => {
        e.preventDefault();
        if (validatePrescripcion()) {
            const resultado = await dispatch(addNewPrescripcion({ pacienteId, prescripcionData: formData }));
            if (!resultado.error) {
                onClose(); // Cierra el modal si la prescripción se guarda con éxito
            }
            // El error global del slice de pacientes se mostrará si hay uno
        }
    };
    
    const inputClass = "w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white text-xs";
    const labelClass = "block text-xs font-medium text-gray-700 dark:text-slate-300 mb-0.5";

    return (
        <form onSubmit={handleSubmitPrescripcion} className="space-y-3">
            <div>
                <label htmlFor="presc-fecha" className={labelClass}>Fecha*</label>
                <input type="date" name="fecha" id="presc-fecha" value={formData.fecha} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
                <label htmlFor="presc-optometrista" className={labelClass}>Optometrista Responsable</label>
                <input type="text" name="optometristaResponsable" id="presc-optometrista" value={formData.optometristaResponsable} onChange={handleChange} className={inputClass} placeholder="Ej: Dr. Optico"/>
            </div>
             <div>
                <label htmlFor="presc-diagnostico" className={labelClass}>Diagnóstico*</label>
                <textarea name="diagnostico" id="presc-diagnostico" rows="2" value={formData.diagnostico} onChange={handleChange} className={inputClass} required></textarea>
                {errors.diagnostico && <p className="text-xs text-red-500 mt-1">{errors.diagnostico}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="presc-od" className={labelClass}>Graduación OD</label><input type="text" name="graduacionOD" id="presc-od" value={formData.graduacionOD} onChange={handleChange} className={inputClass} /></div>
                <div><label htmlFor="presc-oi" className={labelClass}>Graduación OI</label><input type="text" name="graduacionOI" id="presc-oi" value={formData.graduacionOI} onChange={handleChange} className={inputClass} /></div>
            </div>
             <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="presc-adicion" className={labelClass}>Adición</label><input type="text" name="adicion" id="presc-adicion" value={formData.adicion} onChange={handleChange} className={inputClass} /></div>
                <div><label htmlFor="presc-dp" className={labelClass}>DP (mm)</label><input type="text" name="dp" id="presc-dp" value={formData.dp} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div>
                <label htmlFor="presc-observaciones" className={labelClass}>Observaciones</label>
                <textarea name="observaciones" id="presc-observaciones" rows="2" value={formData.observaciones} onChange={handleChange} className={inputClass}></textarea>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-md">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-70">
                    {isLoading ? <Spinner size="h-4 w-4" color="border-white"/> : 'Guardar Prescripción'}
                </button>
            </div>
        </form>
    );
};


export default function DetallePaciente({ paciente, onClose, onEdit }) {
  const [mostrarFormPrescripcion, setMostrarFormPrescripcion] = useState(false);
  const [historialVisible, setHistorialVisible] = useState(true);
  const { isLoading, error } = useSelector(state => state.pacientes); // Para el spinner de guardar prescripción

  if (!paciente) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-slate-400 h-full flex flex-col justify-center items-center">
        <FileText size={40} className="mb-2" />
        <p>Selecciona un paciente de la lista para ver sus detalles.</p>
      </div>
    );
  }
  
  const toggleHistorial = () => setHistorialVisible(!historialVisible);

  return (
    <div className="p-5 h-full flex flex-col bg-white dark:bg-slate-800 rounded-r-xl md:rounded-xl">
      {/* Cabecera del Detalle */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-700 mb-4">
        <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 truncate" title={paciente.nombreCompleto}>
          {paciente.nombreCompleto}
        </h2>
        <div className="flex items-center space-x-2">
            <button
                onClick={onEdit}
                className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-700/50 rounded-full transition-colors"
                title="Editar Paciente"
            >
                <Edit3 size={18} />
            </button>
            <button
                onClick={onClose}
                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Cerrar Detalles"
            >
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Contenido del Detalle (Scrollable) */}
      <div className="flex-grow overflow-y-auto space-y-5 pr-1 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <InfoItem icon={<Phone />} label="Teléfono" value={paciente.telefono} />
            <InfoItem icon={<Mail />} label="Email" value={paciente.email} />
            <InfoItem icon={<CalendarDays />} label="Fecha de Nacimiento" value={paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento).toLocaleDateString() : 'N/A'} />
            <InfoItem icon={<Briefcase />} label="Ocupación" value={paciente.ocupacion} />
        </div>
        <InfoItem icon={<MapPin />} label="Dirección" value={paciente.direccion} isBlock />
        <InfoItem icon={<Stethoscope />} label="Antecedentes Médicos" value={paciente.antecedentesMedicos} isBlock />
        <InfoItem icon={<StickyNote />} label="Notas Adicionales" value={paciente.notasAdicionales} isBlock />

        {/* Sección de Historial de Prescripciones */}
        <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <button onClick={toggleHistorial} className="flex items-center text-lg font-semibold text-gray-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400">
              Historial de Prescripciones
              {historialVisible ? <ChevronUp size={20} className="ml-1"/> : <ChevronDown size={20} className="ml-1"/>}
            </button>
            <button
              onClick={() => setMostrarFormPrescripcion(true)}
              className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1.5 px-3 rounded-md flex items-center space-x-1.5 transition-colors"
            >
              <PlusCircle size={16} /> <span>Nueva</span>
            </button>
          </div>

          {historialVisible && (
            paciente.historialPrescripciones && paciente.historialPrescripciones.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {paciente.historialPrescripciones.slice().sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map((item, index) => ( // Ordenar por fecha descendente
                  <div key={item._id || index} className="p-3 bg-gray-50 dark:bg-slate-700/60 rounded-lg border border-gray-200 dark:border-slate-600 text-xs">
                    <p className="font-semibold text-gray-700 dark:text-slate-200">Fecha: {new Date(item.fecha).toLocaleDateString()}</p>
                    {item.optometristaResponsable && <p className="text-gray-600 dark:text-slate-300">Optometrista: {item.optometristaResponsable}</p>}
                    <p className="text-gray-600 dark:text-slate-300">Diagnóstico: <span className="font-medium">{item.diagnostico}</span></p>
                    <p className="text-gray-600 dark:text-slate-300">OD: {item.graduacionOD || 'N/A'} | OI: {item.graduacionOI || 'N/A'}</p>
                    {item.adicion && <p className="text-gray-600 dark:text-slate-300">Adición: {item.adicion}</p>}
                    {item.dp && <p className="text-gray-600 dark:text-slate-300">DP: {item.dp}</p>}
                    {item.observaciones && <p className="text-gray-500 dark:text-slate-400 italic mt-1">Obs: {item.observaciones}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-slate-400 py-2">No hay historial de prescripciones para este paciente.</p>
            )
          )}
        </div>
      </div>

      {/* Modal para Nueva Prescripción */}
      {mostrarFormPrescripcion && (
        <Modal 
            isOpen={mostrarFormPrescripcion} 
            onClose={() => setMostrarFormPrescripcion(false)} 
            title="Nueva Prescripción"
            size="max-w-lg"
        >
          <FormularioPrescripcion 
            pacienteId={paciente._id} 
            onClose={() => setMostrarFormPrescripcion(false)}
            isLoading={isLoading} // Usar el isLoading general de pacientes o uno específico
          />
        </Modal>
      )}
       {error && ( // Mostrar error si existe al guardar prescripción
        <div className="mt-3 p-2 text-xs text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
          <span className="font-medium">Error al guardar prescripción:</span> {typeof error === 'object' ? JSON.stringify(error) : error}
        </div>
      )}
    </div>
  );
}