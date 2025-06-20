import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPacientes,
  addNewPaciente,
  updateExistingPaciente,
  deleteExistingPaciente,
  seleccionarPaciente,
  limpiarPacienteSeleccionado,
  clearPacientesError,
  // addNewPrescripcion, // Se maneja desde DetallePaciente
} from '../../store/slices/pacienteSlice.js';
import FormularioPaciente from './FormularioPaciente';
import DetallePaciente from './DetallePaciente';
import Spinner from '../Common/Spinner';
import Modal from '../Common/ModalControlado.jsx';
import { PlusCircle, UserSearch, Edit3, Trash2, UserX, Eye as ViewIcon, AlertTriangle, Users as UsersIcon } from 'lucide-react';
import { formatDisplayDateFromString } from '../../Utils/dateUtils.js'; 

export default function GestionPacientes() {
  const dispatch = useDispatch();
  const { pacientes, pacienteSeleccionado, isLoading, error } = useSelector((state) => state.pacientes);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pacienteParaEditar, setPacienteParaEditar] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);

  // Cargar pacientes al montar el componente
  useEffect(() => {
    dispatch(fetchPacientes());
    return () => { // Limpiar errores al desmontar
        dispatch(clearPacientesError());
        dispatch(limpiarPacienteSeleccionado()); // Limpiar selección al salir de la vista
    }
  }, [dispatch]);

  const handleAbrirFormulario = (paciente = null) => {
    dispatch(clearPacientesError());
    setPacienteParaEditar(paciente);
    setMostrarFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setPacienteParaEditar(null);
    dispatch(clearPacientesError());
  };

  const handleGuardarPaciente = async (datosPaciente) => {
    let resultadoAccion;
    if (pacienteParaEditar && pacienteParaEditar._id) { // Asegurarse que hay _id para editar
      resultadoAccion = await dispatch(updateExistingPaciente({ id: pacienteParaEditar._id, pacienteData: datosPaciente }));
    } else {
      resultadoAccion = await dispatch(addNewPaciente(datosPaciente));
    }
    if (resultadoAccion.meta.requestStatus === 'fulfilled') {
      handleCerrarFormulario();
      // Opcional: seleccionar el paciente recién creado/editado
      if (resultadoAccion.payload) dispatch(seleccionarPaciente(resultadoAccion.payload));
    }
    // El error se maneja a través del estado 'error' del slice y se muestra en la UI
  };

  const handleSeleccionarPaciente = (paciente) => {
    if (pacienteSeleccionado && pacienteSeleccionado._id === paciente._id) {
        dispatch(limpiarPacienteSeleccionado());
    } else {
        dispatch(seleccionarPaciente(paciente));
    }
  };
  
  const abrirModalEliminar = (paciente) => {
    setPacienteAEliminar(paciente);
    setShowDeleteModal(true);
  };

  const confirmarEliminarPaciente = async () => {
    if (pacienteAEliminar) {
      const resultado = await dispatch(deleteExistingPaciente(pacienteAEliminar._id));
      if (resultado.meta.requestStatus === 'fulfilled') {
        setShowDeleteModal(false);
        setPacienteAEliminar(null);
      }
      // El error se maneja a través del estado 'error' del slice
    }
  };

  const pacientesFiltrados = pacientes.filter(p =>
    p.nombreCompleto.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    (p.telefono && p.telefono.includes(terminoBusqueda)) ||
    (p.email && p.email.toLowerCase().includes(terminoBusqueda.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white">Pacientes Registrados</h2>
        <button
          onClick={() => handleAbrirFormulario()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center space-x-2 transition duration-150 ease-in-out"
        >
          <PlusCircle size={20} />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {error && ( // Mostrar errores generales del slice (fetch, delete, etc.)
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800 animate-pulse" role="alert">
          <span className="font-medium">Error:</span> {typeof error === 'object' ? JSON.stringify(error) : error}
          <button onClick={() => dispatch(clearPacientesError())} className="ml-4 text-red-700 dark:text-red-800 font-bold">X</button>
        </div>
      )}

      {mostrarFormulario && (
        <Modal 
            isOpen={mostrarFormulario} 
            onClose={handleCerrarFormulario} 
            title={pacienteParaEditar ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
            titleIcon={pacienteParaEditar ? <Edit3 className="text-amber-500"/> : <PlusCircle className="text-indigo-500"/>}
        >
          <FormularioPaciente
            pacienteInicial={pacienteParaEditar}
            onGuardar={handleGuardarPaciente}
            onCancelar={handleCerrarFormulario}
            isLoading={isLoading} // Usar el isLoading general o uno específico para el form
          />
        </Modal>
      )}

      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Buscar paciente por nombre, teléfono o email..."
            className="w-full p-3 pl-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
          <UserSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400" size={20} />
        </div>

        {isLoading && pacientes.length === 0 && <div className="flex justify-center p-10"><Spinner /><p className="ml-2 dark:text-slate-300">Cargando pacientes...</p></div>}
        
        {!isLoading && pacientesFiltrados.length === 0 && terminoBusqueda && (
             <div className="text-center py-10 text-gray-500 dark:text-slate-400">
                <UserX size={48} className="mx-auto mb-2" />
                <p>No se encontraron pacientes que coincidan con "{terminoBusqueda}".</p>
            </div>
        )}
        {!isLoading && pacientes.length === 0 && !terminoBusqueda && (
             <div className="text-center py-10 text-gray-500 dark:text-slate-400">
                <UsersIcon size={48} className="mx-auto mb-2" />
                <p>Aún no hay pacientes registrados.</p>
                <p>Comienza agregando uno con el botón "Nuevo Paciente".</p>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Pacientes */}
          <div className={`lg:col-span-${pacienteSeleccionado ? '1' : '3'} transition-all duration-300 ease-in-out`}>
            <div className="max-h-[calc(100vh-20rem)] overflow-y-auto space-y-3 pr-2 custom-scrollbar"> {/* Ajustar max-h según necesidad */}
              {pacientesFiltrados.map(paciente => (
                <div 
                  key={paciente._id}
                  className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ease-in-out border-l-4
                              ${pacienteSeleccionado?._id === paciente._id 
                                ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500 dark:ring-indigo-400' 
                                : 'bg-gray-50 dark:bg-slate-700/50 border-transparent hover:bg-gray-100 dark:hover:bg-slate-700 hover:shadow-lg'}`}
                  onClick={() => handleSeleccionarPaciente(paciente)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg font-semibold ${pacienteSeleccionado?._id === paciente._id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-white'}`}>{paciente.nombreCompleto}</h3>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{paciente.telefono || 'Sin teléfono'}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          Última visita: {formatDisplayDateFromString(paciente.ultimaVisita)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1.5 mt-1 sm:mt-0 flex-shrink-0"> {/* Ajuste para botones */}
                       <button 
                        onClick={(e) => { e.stopPropagation(); handleSeleccionarPaciente(paciente);}} 
                        title="Ver Detalles"
                        className="p-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-700/50 rounded-full transition-colors"
                      >
                        <ViewIcon size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAbrirFormulario(paciente);}} 
                        title="Editar Paciente"
                        className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-700/50 rounded-full transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); abrirModalEliminar(paciente);}} 
                        title="Eliminar Paciente"
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/50 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detalle del Paciente */}
          {pacienteSeleccionado && (
            <div className="lg:col-span-2 bg-transparent dark:bg-transparent rounded-xl transition-all duration-300 ease-in-out"> {/* Quitar fondo para que el de DetallePaciente prevalezca */}
              <DetallePaciente 
                paciente={pacienteSeleccionado} 
                onClose={() => dispatch(limpiarPacienteSeleccionado())}
                onEdit={() => handleAbrirFormulario(pacienteSeleccionado)}
              />
            </div>
          )}
        </div>
      </div>
      
      {showDeleteModal && pacienteAEliminar && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setPacienteAEliminar(null);}}
          title="Confirmar Eliminación"
          titleIcon={<AlertTriangle size={24} className="text-red-500 mr-2"/>}
        >
          <p className="text-gray-700 dark:text-slate-300 mb-4">
            ¿Estás seguro de que deseas eliminar al paciente <strong className="font-semibold">{pacienteAEliminar.nombreCompleto}</strong>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => { setShowDeleteModal(false); setPacienteAEliminar(null);}}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 rounded-md shadow-sm border border-gray-300 dark:border-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminarPaciente}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading && pacienteAEliminar ? <Spinner size="h-5 w-5" color="border-white" /> : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; // slate-300
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; // slate-600
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; // slate-400
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b; // slate-500
        }
      `}</style>
    </div>
  );
}