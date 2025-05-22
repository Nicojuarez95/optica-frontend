import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCitas,
  addNewCita,
  updateExistingCita,
  deleteExistingCita,
  clearCitasError,
} from '../../store/slices/citaSlice';
import { fetchPacientes } from '../../store/slices/pacienteSlice';
import FormularioCitaControlado from './FormularioCitas';
import Spinner from '../Common/Spinner';
import ModalControlado from '../Common/ModalControlado'; // Para confirmación de eliminación
import { PlusCircle, Edit3, Trash2, ListFilter, CalendarX2, AlertTriangle, CalendarCheck2, XCircle } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('es-AR', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
  });
};

const getEstadoColor = (estado) => {
    switch (estado) {
        case 'Programada': return 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300';
        case 'Confirmada': return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300';
        case 'Completada': return 'bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-slate-200';
        case 'Cancelada por Paciente':
        case 'Cancelada por Óptica': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300';
        case 'No Asistió': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200';
    }
};

export default function GestionCitasControlado() {
  const dispatch = useDispatch();
  const { citas, isLoading, error } = useSelector((state) => state.citas);
  const { pacientes, isLoading: isLoadingPacientes } = useSelector((state) => state.pacientes);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editingCita, setEditingCita] = useState(null);
  const [formKey, setFormKey] = useState(Date.now());

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [citaAEliminar, setCitaAEliminar] = useState(null);
  
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const cargarDatos = useCallback(() => {
    const filtrosActivos = {};
    if (filtroPaciente) filtrosActivos.pacienteId = filtroPaciente;
    if (filtroEstado) filtrosActivos.estado = filtroEstado;
    if (filtroFechaDesde) filtrosActivos.fechaDesde = filtroFechaDesde;
    if (filtroFechaHasta) filtrosActivos.fechaHasta = filtroFechaHasta;
    dispatch(fetchCitas(filtrosActivos));

    if (!pacientes || pacientes.length === 0) {
        dispatch(fetchPacientes());
    }
  }, [dispatch, filtroPaciente, filtroEstado, filtroFechaDesde, filtroFechaHasta, pacientes]);

  useEffect(() => {
    cargarDatos();
    return () => {
        dispatch(clearCitasError());
    }
  }, [cargarDatos, dispatch]);

  const handleAbrirFormulario = useCallback((cita = null) => {
    dispatch(clearCitasError());
    setEditingCita(cita);
    setFormKey(Date.now());
    setMostrarFormulario(true);
  }, [dispatch]);

  const handleCerrarFormulario = useCallback(() => {
    setMostrarFormulario(false);
    setEditingCita(null);
    dispatch(clearCitasError());
  }, [dispatch]);

  const handleGuardarCita = useCallback(async (datosFormulario) => {
    let resultadoAccion;
    if (editingCita && editingCita._id) {
      resultadoAccion = await dispatch(updateExistingCita({ id: editingCita._id, citaData: datosFormulario }));
    } else {
      resultadoAccion = await dispatch(addNewCita(datosFormulario));
    }
    if (resultadoAccion.meta.requestStatus === 'fulfilled') {
      handleCerrarFormulario();
    }
  }, [dispatch, editingCita, handleCerrarFormulario]);
  
  const abrirModalEliminar = useCallback((cita) => {
    setCitaAEliminar(cita);
    setShowDeleteModal(true);
  }, []);

  const confirmarEliminarCita = useCallback(async () => {
    if (citaAEliminar) {
      const resultado = await dispatch(deleteExistingCita(citaAEliminar._id));
      if (resultado.meta.requestStatus === 'fulfilled') {
        setShowDeleteModal(false);
        setCitaAEliminar(null);
      }
    }
  }, [dispatch, citaAEliminar]);

  const handleResetFiltros = useCallback(() => {
    setFiltroPaciente('');
    setFiltroEstado('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
  }, []);
  
  const estadosDeCitaUnicos = ['Programada', 'Confirmada', 'Completada', 'Cancelada por Paciente', 'Cancelada por Óptica', 'No Asistió'];

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white">Agenda de Citas</h2>
        <div className="flex items-center gap-3">
            <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition duration-150 text-sm"
                title={mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
            >
                <ListFilter size={18} /> <span>Filtros</span>
            </button>
            {!mostrarFormulario && (
                <button
                onClick={() => handleAbrirFormulario(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center space-x-2 transition duration-150 text-sm"
                >
                <PlusCircle size={20} />
                <span>Nueva Cita</span>
                </button>
            )}
        </div>
      </div>

      {mostrarFiltros && (
         <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow mb-6 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="filtroPaciente-citas" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Paciente</label>
                    <select id="filtroPaciente-citas" value={filtroPaciente} onChange={(e) => setFiltroPaciente(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500" disabled={isLoadingPacientes}>
                        <option value="">{isLoadingPacientes ? "Cargando..." : "Todos"}</option>
                        {pacientes.map(p => <option key={p._id} value={p._id}>{p.nombreCompleto}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="filtroEstado-citas" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Estado</label>
                    <select id="filtroEstado-citas" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Todos</option>
                        {estadosDeCitaUnicos.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="filtroFechaDesde-citas" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Desde</label>
                    <input type="date" id="filtroFechaDesde-citas" value={filtroFechaDesde} onChange={(e) => setFiltroFechaDesde(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="filtroFechaHasta-citas" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Hasta</label>
                    <input type="date" id="filtroFechaHasta-citas" value={filtroFechaHasta} onChange={(e) => setFiltroFechaHasta(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <button onClick={handleResetFiltros} className="text-sm text-gray-600 dark:text-slate-300 hover:underline hover:text-indigo-500 dark:hover:text-indigo-400">Limpiar filtros</button>
            </div>
        </div>
      )}

      {error && (
        <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300 flex justify-between items-center" role="alert">
          <div><span className="font-medium">Error:</span> {error}</div>
          <button onClick={() => dispatch(clearCitasError())} className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-700/50"><XCircle size={18}/></button>
        </div>
      )}

      {mostrarFormulario && (
        <div className="my-4 p-4 border rounded-lg dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
              {editingCita ? <Edit3 size={22} className="text-amber-500 mr-2"/> : <CalendarCheck2 size={22} className="text-indigo-500 mr-2"/>}
              {editingCita ? 'Editar Cita' : 'Programar Nueva Cita'}
            </h3>
            <FormularioCitaControlado
                key={formKey}
                citaInicial={editingCita}
                onGuardar={handleGuardarCita}
                onCancelar={handleCerrarFormulario}
                isLoading={isLoading}
            />
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-0 sm:p-2 rounded-xl shadow-lg overflow-x-auto">
        {isLoading && citas.length === 0 && <div className="flex justify-center p-6"><Spinner /><p className="ml-2 dark:text-slate-300">Cargando...</p></div>}
        {!isLoading && citas.length === 0 && ( <div className="text-center py-6 text-gray-500 dark:text-slate-400"><CalendarX2 size={40} className="mx-auto mb-1" /><p>No hay citas.</p></div>)}
        
        {citas.length > 0 && (
            <table className="w-full min-w-[768px] text-sm text-left text-gray-500 dark:text-slate-300">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-slate-400">
                    <tr>
                        <th scope="col" className="px-4 py-3">Paciente</th>
                        <th scope="col" className="px-4 py-3">Fecha y Hora</th>
                        <th scope="col" className="px-4 py-3">Tipo</th>
                        <th scope="col" className="px-4 py-3">Optometrista</th>
                        <th scope="col" className="px-4 py-3">Estado</th>
                        <th scope="col" className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {citas.map(cita => (
                        <tr key={cita._id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                {cita.pacienteNombre || (pacientes.find(p=>p._id === cita.pacienteId)?.nombreCompleto || 'N/A')}
                            </td>
                            <td className="px-4 py-3">{formatDate(cita.fechaHora)}</td>
                            <td className="px-4 py-3">{cita.tipoCita}</td>
                            <td className="px-4 py-3">{cita.optometristaAsignado}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getEstadoColor(cita.estado)}`}>
                                    {cita.estado}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => handleAbrirFormulario(cita)} title="Editar Cita" className="p-1.5 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 rounded-full mr-1">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => abrirModalEliminar(cita)} title="Eliminar Cita" className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-full">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
      
      <ModalControlado
          isOpen={showDeleteModal && !!citaAEliminar}
          onClose={() => { setShowDeleteModal(false); setCitaAEliminar(null);}}
          title="Confirmar Eliminación de Cita"
          titleIcon={<AlertTriangle size={20} className="text-red-500"/>}
      >
        {citaAEliminar && (
            <>
                <p className="text-gray-700 dark:text-slate-300 mb-4">
                    ¿Seguro deseas eliminar la cita de <strong className="font-semibold">{citaAEliminar.pacienteNombre || 'este paciente'}</strong> del <strong className="font-semibold">{formatDate(citaAEliminar.fechaHora)}</strong>?
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                    onClick={() => { setShowDeleteModal(false); setCitaAEliminar(null);}}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 rounded-md"
                    >
                    Cancelar
                    </button>
                    <button
                    onClick={confirmarEliminarCita}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-70"
                    >
                    {isLoading && citaAEliminar ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </>
        )}
      </ModalControlado>
    </div>
  );
}