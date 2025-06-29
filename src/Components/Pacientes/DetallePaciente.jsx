import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    X, Edit3, PlusCircle, ChevronDown, ChevronUp, FileText,
    CalendarDays, Phone, Mail, MapPin, Briefcase, Stethoscope, StickyNote, Printer,
    Trash2, AlertTriangle
} from 'lucide-react';
import { addNewPrescripcion, deletePrescripcionHistorial } from '../../store/slices/pacienteSlice';
import Spinner from '../Common/Spinner';
import Modal from '../Common/ModalControlado';
import { generarPdfPrescripcion } from '../../Utils/generacionPdf'; // Ajusta la ruta si es diferente
import { formatDisplayDateFromString } from '../../Utils/dateUtils'; // <-- IMPORTANTE: Importa la función de formato

// --- Componente InfoItem ---
const InfoItem = ({ icon, label, value, isBlock = false }) => (
    <div className={`flex items-start ${isBlock ? 'flex-col items-start w-full' : 'mb-2'}`}>
      {React.cloneElement(icon, { size: 16, className: "text-indigo-500 dark:text-indigo-400 mr-2 mt-1 flex-shrink-0" })}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
        <span className="text-sm text-gray-800 dark:text-slate-200 break-words">{value || 'N/A'}</span>
      </div>
    </div>
);

// --- FormularioPrescripcion ---
const FormularioPrescripcion = ({ pacienteId, onClose, isLoading: isLoadingProp }) => {
    const dispatch = useDispatch();
    const { user: opticoLogueado } = useSelector(state => state.auth);
    const { isLoading: isLoadingPacienteSliceOp, error: errorPacienteSliceOp } = useSelector(state => state.pacientes);
    const actualLoading = isLoadingProp || isLoadingPacienteSliceOp;

    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        optometristaResponsable: '',
        diagnostico: '',
        graduacionOD_Esfera: '', graduacionOD_Cilindro: '', graduacionOD_Eje: '',
        graduacionOI_Esfera: '', graduacionOI_Cilindro: '', graduacionOI_Eje: '',
        adicion: '',
        dp: '',
        descripcionConceptos: '',
        subtotal: '',
        descuentoPorcentaje: '0',
        montoEntregado: '0',
        metodoPagoEntregado: 'Efectivo',
        numeroComprobante: '',
        observaciones: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (opticoLogueado) {
            setFormData(prev => ({
                ...prev,
                optometristaResponsable: prev.optometristaResponsable || opticoLogueado.nombre || opticoLogueado.name || ''
            }));
        }
    }, [opticoLogueado]);

    const calculosFinancieros = useMemo(() => {
        const subtotalNum = parseFloat(formData.subtotal) || 0;
        const descuentoPorcNum = parseFloat(formData.descuentoPorcentaje) || 0;
        const montoEntregadoNum = parseFloat(formData.montoEntregado) || 0;
        const montoDescuento = (subtotalNum * descuentoPorcNum) / 100;
        const totalNeto = subtotalNum - montoDescuento;
        const saldoPendiente = totalNeto - montoEntregadoNum;
        return {
            montoDescuento: montoDescuento.toFixed(2),
            totalNeto: totalNeto.toFixed(2),
            saldoPendiente: saldoPendiente.toFixed(2)
        };
    }, [formData.subtotal, formData.descuentoPorcentaje, formData.montoEntregado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validatePrescripcion = () => {
        const newErrors = {};
        const totalNetoNum = parseFloat(calculosFinancieros.totalNeto);

        if (!formData.diagnostico.trim()) newErrors.diagnostico = 'El diagnóstico es obligatorio.';
        if (!formData.descripcionConceptos.trim()) newErrors.descripcionConceptos = 'La descripción de conceptos es obligatoria.';
        if (formData.subtotal.trim() === '' || isNaN(parseFloat(formData.subtotal)) || parseFloat(formData.subtotal) < 0) {
            newErrors.subtotal = 'El subtotal es obligatorio y debe ser un número positivo.';
        }
        if (isNaN(parseFloat(formData.descuentoPorcentaje)) || parseFloat(formData.descuentoPorcentaje) < 0 || parseFloat(formData.descuentoPorcentaje) > 100) {
            newErrors.descuentoPorcentaje = 'El descuento debe ser entre 0 y 100.';
        }
        if (formData.montoEntregado.trim() !== '' && (isNaN(parseFloat(formData.montoEntregado)) || parseFloat(formData.montoEntregado) < 0)) {
            newErrors.montoEntregado = 'El monto entregado debe ser un número positivo.';
        }
        if (!formData.numeroComprobante.trim()) {
            newErrors.numeroComprobante = 'El número de comprobante es obligatorio.';
        } else if (!/^[\dA-Za-z\-]+$/.test(formData.numeroComprobante.trim())) {
            newErrors.numeroComprobante = 'Número de comprobante inválido.';
        }
        if (parseFloat(formData.montoEntregado) > totalNetoNum) {
            newErrors.montoEntregado = `El monto entregado no puede ser mayor al Total Neto ($${totalNetoNum.toFixed(2)}).`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitPrescripcion = async (e) => {
        e.preventDefault();
        if (validatePrescripcion()) {
            const prescripcionDataToSend = {
                ...formData, // formData.fecha ya es YYYY-MM-DD string
                subtotal: parseFloat(formData.subtotal) || 0,
                descuentoPorcentaje: parseFloat(formData.descuentoPorcentaje) || 0,
                montoEntregado: parseFloat(formData.montoEntregado) || 0,
                optometristaResponsable: formData.optometristaResponsable || opticoLogueado?.nombre || opticoLogueado?.name || '',
            };
            // console.log("Datos a enviar al backend (prescripción):", prescripcionDataToSend);
            const resultado = await dispatch(addNewPrescripcion({ pacienteId, prescripcionData: prescripcionDataToSend }));
            if (resultado.meta.requestStatus === 'fulfilled') {
                onClose();
            } else {
                let formErrors = {};
                if (resultado.payload && typeof resultado.payload === 'object' && resultado.payload.errors) {
                    for (const key in resultado.payload.errors) {
                        formErrors[key] = resultado.payload.errors[key].message;
                    }
                } else if (resultado.payload && typeof resultado.payload === 'string') {
                    formErrors.form = resultado.payload;
                } else if (errorPacienteSliceOp) {
                     formErrors.form = typeof errorPacienteSliceOp === 'string' ? errorPacienteSliceOp : "Error al guardar la prescripción.";
                } else {
                    formErrors.form = "Ocurrió un error inesperado al guardar la prescripción.";
                }
                setErrors(formErrors);
            }
        }
    };
    
    const inputClass = "w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white text-xs";
    const labelClass = "block text-xs font-medium text-gray-700 dark:text-slate-300 mb-0.5";

    return (
        <form onSubmit={handleSubmitPrescripcion} className="space-y-3 text-xs">
            {errors.form && <p className="text-xs text-red-500 p-2 bg-red-100 dark:bg-red-900/30 rounded-md">{errors.form}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label htmlFor={`presc-fecha-${pacienteId}`} className={labelClass}>Fecha*</label>
                    <input type="date" name="fecha" id={`presc-fecha-${pacienteId}`} value={formData.fecha} onChange={handleChange} className={inputClass} required />
                     {errors.fecha && <p className="text-xs text-red-500 mt-1">{errors.fecha}</p>}
                </div>
                <div>
                    <label htmlFor={`presc-optometrista-${pacienteId}`} className={labelClass}>Optometrista Responsable</label>
                    <input type="text" name="optometristaResponsable" id={`presc-optometrista-${pacienteId}`} value={formData.optometristaResponsable} onChange={handleChange} className={inputClass} placeholder="Nombre del óptico"/>
                    {errors.optometristaResponsable && <p className="text-xs text-red-500 mt-1">{errors.optometristaResponsable}</p>}
                </div>
            </div>
            <div>
                <label htmlFor={`presc-diagnostico-${pacienteId}`} className={labelClass}>Diagnóstico*</label>
                <textarea name="diagnostico" id={`presc-diagnostico-${pacienteId}`} rows="2" value={formData.diagnostico} onChange={handleChange} className={inputClass} required></textarea>
                {errors.diagnostico && <p className="text-xs text-red-500 mt-1">{errors.diagnostico}</p>}
            </div>

            <fieldset className="border border-slate-300 dark:border-slate-600 p-2 rounded-md">
                <legend className="text-xs font-medium px-1 text-gray-700 dark:text-slate-300">Graduación</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    <div><label htmlFor={`presc-od-esf-${pacienteId}`} className={labelClass}>OD Esfera</label><input type="text" name="graduacionOD_Esfera" id={`presc-od-esf-${pacienteId}`} value={formData.graduacionOD_Esfera} onChange={handleChange} className={inputClass} placeholder="+0.00 / -0.00"/></div>
                    <div><label htmlFor={`presc-od-cil-${pacienteId}`} className={labelClass}>OD Cilindro</label><input type="text" name="graduacionOD_Cilindro" id={`presc-od-cil-${pacienteId}`} value={formData.graduacionOD_Cilindro} onChange={handleChange} className={inputClass} placeholder="-0.00"/></div>
                    <div><label htmlFor={`presc-od-eje-${pacienteId}`} className={labelClass}>OD Eje</label><input type="text" name="graduacionOD_Eje" id={`presc-od-eje-${pacienteId}`} value={formData.graduacionOD_Eje} onChange={handleChange} className={inputClass} placeholder="0°"/></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div><label htmlFor={`presc-oi-esf-${pacienteId}`} className={labelClass}>OI Esfera</label><input type="text" name="graduacionOI_Esfera" id={`presc-oi-esf-${pacienteId}`} value={formData.graduacionOI_Esfera} onChange={handleChange} className={inputClass} placeholder="+0.00 / -0.00"/></div>
                    <div><label htmlFor={`presc-oi-cil-${pacienteId}`} className={labelClass}>OI Cilindro</label><input type="text" name="graduacionOI_Cilindro" id={`presc-oi-cil-${pacienteId}`} value={formData.graduacionOI_Cilindro} onChange={handleChange} className={inputClass} placeholder="-0.00"/></div>
                    <div><label htmlFor={`presc-oi-eje-${pacienteId}`} className={labelClass}>OI Eje</label><input type="text" name="graduacionOI_Eje" id={`presc-oi-eje-${pacienteId}`} value={formData.graduacionOI_Eje} onChange={handleChange} className={inputClass} placeholder="0°"/></div>
                </div>
            </fieldset>
            
            <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor={`presc-adicion-${pacienteId}`} className={labelClass}>Adición (ADD)</label><input type="text" name="adicion" id={`presc-adicion-${pacienteId}`} value={formData.adicion} onChange={handleChange} className={inputClass} placeholder="+0.00"/></div>
                <div><label htmlFor={`presc-dp-${pacienteId}`} className={labelClass}>DP (mm)</label><input type="text" name="dp" id={`presc-dp-${pacienteId}`} value={formData.dp} onChange={handleChange} className={inputClass} placeholder="Ej: 62"/></div>
            </div>

            <fieldset className="border border-slate-300 dark:border-slate-600 p-2 rounded-md mt-4">
                <legend className="text-xs font-medium px-1 text-gray-700 dark:text-slate-300">Detalles Financieros</legend>
                <div className="mt-1">
                    <label htmlFor={`presc-numeroComprobante-${pacienteId}`} className={labelClass}>N° Comprobante/Boleta*</label>
                    <input type="text" name="numeroComprobante" id={`presc-numeroComprobante-${pacienteId}`} value={formData.numeroComprobante} onChange={handleChange} className={inputClass} />
                     {errors.numeroComprobante && <p className="text-xs text-red-500 mt-1">{errors.numeroComprobante}</p>}
                </div>
                <div className="mt-2">
                    <label htmlFor={`presc-descripcionConceptos-${pacienteId}`} className={labelClass}>Descripción de Conceptos/Productos*</label>
                    <input type="text" name="descripcionConceptos" id={`presc-descripcionConceptos-${pacienteId}`} value={formData.descripcionConceptos} onChange={handleChange} className={inputClass} placeholder="Ej: Lentes BlueCut + Armazón Modelo Z" required/>
                    {errors.descripcionConceptos && <p className="text-xs text-red-500 mt-1">{errors.descripcionConceptos}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div>
                        <label htmlFor={`presc-subtotal-${pacienteId}`} className={labelClass}>Subtotal*</label>
                        <input type="number" name="subtotal" id={`presc-subtotal-${pacienteId}`} value={formData.subtotal} onChange={handleChange} className={inputClass} placeholder="0.00" step="0.01" min="0" required/>
                        {errors.subtotal && <p className="text-xs text-red-500 mt-1">{errors.subtotal}</p>}
                    </div>
                    <div>
                        <label htmlFor={`presc-descuentoPorcentaje-${pacienteId}`} className={labelClass}>Descuento (%)</label>
                        <input type="number" name="descuentoPorcentaje" id={`presc-descuentoPorcentaje-${pacienteId}`} value={formData.descuentoPorcentaje} onChange={handleChange} className={inputClass} placeholder="0" step="0.01" min="0" max="100"/>
                        {errors.descuentoPorcentaje && <p className="text-xs text-red-500 mt-1">{errors.descuentoPorcentaje}</p>}
                    </div>
                </div>
                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-600/50 rounded text-xs space-y-0.5">
                    <p>Monto Descuento: <span className="font-semibold">${calculosFinancieros.montoDescuento}</span></p>
                    <p className="text-indigo-600 dark:text-indigo-400">Total Neto a Pagar: <span className="font-semibold text-base">${calculosFinancieros.totalNeto}</span></p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div>
                        <label htmlFor={`presc-montoEntregado-${pacienteId}`} className={labelClass}>Monto Entregado</label>
                        <input type="number" name="montoEntregado" id={`presc-montoEntregado-${pacienteId}`} value={formData.montoEntregado} onChange={handleChange} className={inputClass} placeholder="0.00" step="0.01" min="0"/>
                        {errors.montoEntregado && <p className="text-xs text-red-500 mt-1">{errors.montoEntregado}</p>}
                    </div>
                    <div>
                        <label htmlFor={`presc-metodoPagoEntregado-${pacienteId}`} className={labelClass}>Método de Pago (Entrega)</label>
                        <select name="metodoPagoEntregado" id={`presc-metodoPagoEntregado-${pacienteId}`} value={formData.metodoPagoEntregado} onChange={handleChange} className={inputClass}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Otro">Otro</option>
                        </select>
                         {errors.metodoPagoEntregado && <p className="text-xs text-red-500 mt-1">{errors.metodoPagoEntregado}</p>}
                    </div>
                </div>
                 <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded text-xs">
                    <p className="text-orange-600 dark:text-orange-400">Saldo Pendiente: <span className="font-semibold text-base">${calculosFinancieros.saldoPendiente}</span></p>
                </div>
            </fieldset>
            
            <div className="mt-3">
                <label htmlFor={`presc-observaciones-${pacienteId}`} className={labelClass}>Fecha prometida</label>
                <textarea name="observaciones" id={`presc-observaciones-${pacienteId}`} rows="2" value={formData.observaciones} onChange={handleChange} className={inputClass}></textarea>
            </div>
            <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-md">Cancelar</button>
                <button 
                    type="submit" 
                    disabled={actualLoading} 
                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-70 flex items-center"
                >
                    {actualLoading ? <Spinner size="h-3 w-3" color="border-white mr-1.5"/> : null}
                    {actualLoading ? 'Guardando...' : 'Guardar Prescripción'}
                </button>
            </div>
        </form>
    );
};


// --- Componente Principal: DetallePaciente ---
export default function DetallePaciente({ paciente, onClose, onEdit }) {
    const dispatch = useDispatch();
    const [mostrarFormPrescripcion, setMostrarFormPrescripcion] = useState(false);
    const [historialVisible, setHistorialVisible] = useState(true);
    const { isLoading, error } = useSelector(state => state.pacientes);
    const { user: opticoLogueado } = useSelector(state => state.auth);

    const [showDeletePrescModal, setShowDeletePrescModal] = useState(false);
    const [prescripcionAEliminar, setPrescripcionAEliminar] = useState(null);

    const opticoParaImpresion = useMemo(() => ({
        nombreCompleto: opticoLogueado?.nombre || opticoLogueado?.name || 'Optómetra No Especificado',
        matricula: opticoLogueado?.matricula,
        telefono: opticoLogueado?.telefono
    }), [opticoLogueado]);

    const handleImprimirPrescripcion = useCallback(async (prescripcionAImprimir) => {
        if (!paciente || !prescripcionAImprimir || !opticoParaImpresion) {
            alert("Faltan datos esenciales para generar el PDF de la prescripción.");
            console.error("Datos faltantes para PDF:", { paciente, prescripcionAImprimir, opticoLogueado });
            return;
        }
        try {
            await generarPdfPrescripcion(prescripcionAImprimir, paciente, opticoParaImpresion, opticoParaImpresion);
        } catch (e) {
            console.error("Error al intentar generar PDF desde DetallePaciente:", e);
        }
    }, [paciente, opticoParaImpresion, opticoLogueado]); // Añadido opticoLogueado como dependencia

    const abrirModalEliminarPrescripcion = (prescripcion) => {
        setPrescripcionAEliminar(prescripcion);
        setShowDeletePrescModal(true);
    };

    const confirmarEliminarPrescripcion = async () => {
        if (prescripcionAEliminar && paciente) {
            // console.log("Eliminando prescripción - Paciente ID:", paciente._id, "Prescripción ID:", prescripcionAEliminar._id);
            const resultado = await dispatch(deletePrescripcionHistorial({ 
                pacienteId: paciente._id, 
                prescripcionId: prescripcionAEliminar._id 
            }));
            if (resultado.meta.requestStatus === 'fulfilled') {
                setShowDeletePrescModal(false);
                setPrescripcionAEliminar(null);
            }
        }
    };
    
    if (!paciente) {
        return (
            <div className="p-6 text-center text-gray-500 dark:text-slate-400 h-full flex flex-col justify-center items-center">
                <FileText size={40} className="mb-2" />
                <p>Selecciona un paciente de la lista para ver sus detalles.</p>
            </div>
        );
    }
    
    // console.log("DETALLE PACIENTE - paciente.ultimaVisita RAW:", paciente.ultimaVisita);
    // console.log("DETALLE PACIENTE - paciente.fechaNacimiento RAW:", paciente.fechaNacimiento);
    
    const toggleHistorial = () => setHistorialVisible(!historialVisible);

    return (
        <div className="p-5 h-full flex flex-col bg-white dark:bg-slate-800 rounded-r-xl md:rounded-xl shadow-xl">
            {/* Cabecera del Detalle */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-slate-700 mb-4">
                <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 truncate" title={paciente.nombreCompleto}>
                    {paciente.nombreCompleto}
                </h2>
                <div className="flex items-center space-x-2">
                    <button onClick={onEdit} className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-700/50 rounded-full transition-colors" title="Editar Paciente">
                        <Edit3 size={18} />
                    </button>
                    <button onClick={onClose} className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="Cerrar Detalles">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Contenido del Detalle (Scrollable) */}
            <div className="flex-grow overflow-y-auto space-y-5 pr-1 text-sm custom-scrollbar"> {/* Añadido custom-scrollbar */}
                {/* Información del Paciente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    <InfoItem icon={<Phone />} label="Teléfono" value={paciente.telefono} />
                    <InfoItem icon={<Mail />} label="Email" value={paciente.email} />
                    <InfoItem 
                        icon={<CalendarDays />} 
                        label="Fecha de Nacimiento" 
                        value={formatDisplayDateFromString(paciente.fechaNacimiento)} 
                    />
                    <InfoItem icon={<Briefcase />} label="Ocupación" value={paciente.ocupacion} />
                </div>
                <InfoItem 
                    icon={<CalendarDays />} 
                    label="Última Visita" 
                    value={formatDisplayDateFromString(paciente.ultimaVisita)} 
                    isBlock 
                />
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
                        <button onClick={() => setMostrarFormPrescripcion(true)} className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1.5 px-3 rounded-md flex items-center space-x-1.5 transition-colors">
                            <PlusCircle size={16} /> <span>Nueva</span>
                        </button>
                    </div>

                    {historialVisible && (
                        paciente.historialPrescripciones && paciente.historialPrescripciones.length > 0 ? (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar-thumb"> {/* Añadido custom-scrollbar-thumb */}
                                {paciente.historialPrescripciones.slice().sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map((item) => (
                                    <div key={item._id} className="p-3 bg-gray-50 dark:bg-slate-700/60 rounded-lg border border-gray-200 dark:border-slate-600 text-xs shadow hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-700 dark:text-slate-200">Fecha: {formatDisplayDateFromString(item.fecha)}</p>
                                                {item.optometristaResponsable && <p className="text-gray-600 dark:text-slate-300">Opt.: {item.optometristaResponsable}</p>}
                                                <p className="text-gray-600 dark:text-slate-300">Dx: <span className="font-medium">{item.diagnostico}</span></p>
                                            </div>
                                            <div className="flex space-x-1">
                                                <button 
                                                    onClick={() => handleImprimirPrescripcion(item)}
                                                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700/50 rounded-full transition-colors"
                                                    title="Imprimir/Descargar Prescripción"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => abrirModalEliminarPrescripcion(item)}
                                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/50 rounded-full transition-colors"
                                                    title="Eliminar Prescripción"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-1 border-t border-gray-200 dark:border-slate-600 pt-1">
                                            <p className="text-gray-600 dark:text-slate-300">
                                                OD: Esf: {item.graduacionOD_Esfera || '-'}, Cil: {item.graduacionOD_Cilindro || '-'}, Eje: {item.graduacionOD_Eje || '-'}
                                            </p>
                                            <p className="text-gray-600 dark:text-slate-300">
                                                OI: Esf: {item.graduacionOI_Esfera || '-'}, Cil: {item.graduacionOI_Cilindro || '-'}, Eje: {item.graduacionOI_Eje || '-'}
                                            </p>
                                            {item.adicion && <p className="text-gray-600 dark:text-slate-300">Adición: {item.adicion}</p>}
                                            {item.dp && <p className="text-gray-600 dark:text-slate-300">DP: {item.dp} mm</p>}
                                        </div>
                                        {(item.subtotal !== undefined) && ( 
                                            <div className="mt-2 border-t border-gray-200 dark:border-slate-600 pt-1 text-gray-500 dark:text-slate-400">
                                                <p>Conceptos: {item.descripcionConceptos || 'N/A'}</p>
                                                <p>Subtotal: ${parseFloat(item.subtotal)?.toFixed(2)} | Dcto: {item.descuentoPorcentaje || 0}% (-${parseFloat(item.montoDescuento)?.toFixed(2)})</p>
                                                <p className="font-semibold">Total: ${parseFloat(item.totalNeto)?.toFixed(2)}</p>
                                                <p>Entregado: ${parseFloat(item.montoEntregado)?.toFixed(2)} | Saldo: ${parseFloat(item.saldoPendiente)?.toFixed(2)}</p>
                                                {item.numeroComprobante && <p>N° Comp: {item.numeroComprobante}</p>}
                                            </div>
                                        )}
                                        {item.observaciones && <p className="text-gray-500 dark:text-slate-400 italic mt-1">Obs: {item.observaciones}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : ( <p className="text-xs text-gray-500 dark:text-slate-400 py-2">No hay historial de prescripciones para este paciente.</p> )
                    )}
                </div>
            </div>

            {/* Modal para Nueva Prescripción */}
            {mostrarFormPrescripcion && (
                <Modal 
                    isOpen={mostrarFormPrescripcion} 
                    onClose={() => setMostrarFormPrescripcion(false)} 
                    title="Nueva Prescripción"
                    size="max-w-2xl"
                >
                    <FormularioPrescripcion 
                        pacienteId={paciente._id} 
                        onClose={() => setMostrarFormPrescripcion(false)}
                        isLoading={isLoading} 
                    />
                </Modal>
            )}

            {/* Modal de Confirmación para Eliminar Prescripción */}
            {showDeletePrescModal && prescripcionAEliminar && (
                <Modal
                    isOpen={showDeletePrescModal}
                    onClose={() => { setShowDeletePrescModal(false); setPrescripcionAEliminar(null); }}
                    title="Confirmar Eliminación de Prescripción"
                    titleIcon={<AlertTriangle size={20} className="text-red-500" />}
                    size="max-w-md"
                >
                    <p className="text-sm text-gray-700 dark:text-slate-300 mb-4">
                        ¿Estás seguro de que deseas eliminar la prescripción del paciente 
                        <strong className="font-semibold"> {paciente.nombreCompleto} </strong> 
                        con fecha <strong className="font-semibold">{formatDisplayDateFromString(prescripcionAEliminar.fecha)}</strong>?
                        Esta acción no se puede deshacer.
                    </p>
                    {error && prescripcionAEliminar && <p className="text-xs text-red-500 mb-3">Error: {typeof error === 'object' ? JSON.stringify(error) : error}</p>}
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => { setShowDeletePrescModal(false); setPrescripcionAEliminar(null); }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 rounded-md"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmarEliminarPrescripcion}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-70 flex items-center"
                        >
                            {isLoading && prescripcionAEliminar ? <Spinner size="h-4 w-4" color="border-white mr-2"/> : null}
                            {isLoading && prescripcionAEliminar ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </Modal>
            )}

            {error && !mostrarFormPrescripcion && !prescripcionAEliminar && ( 
                <div className="mt-3 p-2 text-xs text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                    <span className="font-medium">Error:</span> {typeof error === 'object' ? JSON.stringify(error) : error}
                </div>
            )}
        </div>
    );
}