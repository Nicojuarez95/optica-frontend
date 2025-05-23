// src/Pages/Dashboard/DashboardHomePage.jsx
import React, { useEffect, useMemo, useCallback } from 'react'; // Añadido useCallback a los imports
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
    UserPlus, 
    CalendarPlus, 
    PackagePlus, 
    CalendarDays, 
    ArchiveSearch, // Si lo usas en otro lado, si no, considera PackageSearch o AlertIcon para el widget de inventario
    Users, 
    ClipboardList, 
    BarChart3, 
    AlertTriangle as AlertIcon, // Usaremos este para Stock Crítico
    ExternalLink, 
    RefreshCw,
    Edit3, // Aunque no se usa directamente aquí, puede ser útil si expandes
    Trash2 // Igual que Edit3
} from 'lucide-react';
import Spinner from '../../Components/Common/Spinner'; // Ajusta esta ruta si es diferente

// Importa los thunks para cargar los datos de los widgets
import { fetchCitasParaDashboard } from '../../store/slices/citaSlice';
import { fetchItemsStockBajoDashboard } from '../../store/slices/inventarioSlice';
import { fetchTotalPacientesDashboard } from '../../store/slices/pacienteSlice';

// Función para formatear fecha y hora (puedes moverla a utils)
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('es-AR', { // es-AR para formato argentino
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export default function DashboardHomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectores para los datos del Dashboard
  const { citasDashboard, isLoadingDashboardCitas, errorDashboardCitas } = useSelector(state => state.citas);
  const { itemsStockBajo, isLoadingStockBajo, errorStockBajo } = useSelector(state => state.inventario);
  const { totalPacientes, isLoadingTotalPacientes, errorTotalPacientes } = useSelector(state => state.pacientes);

  const { user } = useSelector(state => state.auth); // Para el saludo personalizado

  const cargarDatosDashboard = useCallback(() => {
    const hoy = new Date().toISOString().split('T')[0];
    dispatch(fetchCitasParaDashboard({ fecha: hoy, limite: 3, sort: 'fechaHoraAsc' }));
    // Este fetch trae ítems con stockActual <= stockMinimoAlerta (según la lógica de tu backend para alertaStock:true)
    dispatch(fetchItemsStockBajoDashboard({ alertaStock: true, limite: 10 })); // Aumentamos el límite
    dispatch(fetchTotalPacientesDashboard());
  }, [dispatch]);

  useEffect(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

  const handleNavigation = (path) => navigate(path);

  // --- Componente Widget: Acciones Rápidas ---
  const AccionesRapidasWidget = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4 flex items-center">
        <ClipboardList size={22} className="mr-2 text-indigo-500" />
        Acciones Rápidas
      </h2>
      <div className="space-y-3 mt-auto">
        <button onClick={() => handleNavigation('/dashboard/citas#nueva')} className="w-full flex items-center text-sm bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
          <CalendarPlus size={18} className="mr-2" /> Programar Cita
        </button>
        <button onClick={() => handleNavigation('/dashboard/pacientes#nuevo')} className="w-full flex items-center text-sm bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
          <UserPlus size={18} className="mr-2" /> Registrar Paciente
        </button>
        <button onClick={() => handleNavigation('/dashboard/inventario#nuevo')} className="w-full flex items-center text-sm bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105">
          <PackagePlus size={18} className="mr-2" /> Añadir Producto
        </button>
      </div>
    </div>
  );

  // --- Componente Widget: Citas ---
  const CitasWidget = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4 flex items-center">
        <CalendarDays size={22} className="mr-2 text-teal-500" />
        Citas para Hoy
      </h2>
      {isLoadingDashboardCitas && <div className="flex-grow flex justify-center items-center p-3"><Spinner /></div>}
      {errorDashboardCitas && <p className="text-sm text-red-500 dark:text-red-400 flex-grow flex justify-center items-center">Error: {errorDashboardCitas}</p>}
      {!isLoadingDashboardCitas && !errorDashboardCitas && (
        <div className="text-gray-600 dark:text-gray-300 space-y-3 text-sm max-h-60 overflow-y-auto flex-grow">
          {citasDashboard && citasDashboard.length > 0 ? (
            citasDashboard.map(cita => (
              <div key={cita._id} className="p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-800 dark:text-white truncate">{cita.pacienteNombre || (cita.pacienteId?.nombreCompleto || 'Paciente no especificado')}</p>
                <p className="text-xs">{formatDateTime(cita.fechaHora)} - <span className="font-medium">{cita.tipoCita}</span></p>
              </div>
            ))
          ) : (
            <p className="flex-grow flex justify-center items-center text-gray-500 dark:text-slate-400">No hay citas programadas para hoy.</p>
          )}
        </div>
      )}
      <Link to="/dashboard/citas" className="inline-flex items-center text-sm text-indigo-500 dark:text-indigo-400 hover:underline mt-auto pt-3 font-medium self-start">
        Ver agenda completa <ExternalLink size={14} className="ml-1"/>
      </Link>
    </div>
  );

  // --- Componente Widget: Inventario (Stock Crítico) ---
  const InventarioWidget = () => {
    const itemsCriticos = useMemo(() => {
        if (!itemsStockBajo) return [];
        // CAMBIO DE LÓGICA: Ahora "crítico" es si el stock actual es <= al mínimo de alerta.
        // Asumimos que 'itemsStockBajo' ya viene del backend con el filtro { alertaStock: true },
        // que debería ser stockActual <= stockMinimoAlerta.
        // Si ese es el caso, todos los items en 'itemsStockBajo' ya son "críticos" según esta nueva definición.
        // Si 'itemsStockBajo' pudiera ser más amplio, el filtro aquí es necesario.
        // Para estar seguros y explícitos:
        return itemsStockBajo.filter(item => 
            item.stockActual <= item.stockMinimoAlerta
        );
    }, [itemsStockBajo]);

    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4 flex items-center">
          <AlertIcon size={22} className="mr-2 text-red-500" />
          Stock Crítico
        </h2>
        {isLoadingStockBajo && <div className="flex-grow flex justify-center items-center p-3"><Spinner /></div>}
        {errorStockBajo && <p className="text-sm text-red-500 dark:text-red-400 flex-grow flex justify-center items-center">Error: {errorStockBajo}</p>}
        {!isLoadingStockBajo && !errorStockBajo && (
          <div className="text-gray-600 dark:text-gray-300 space-y-2 text-sm max-h-60 overflow-y-auto flex-grow">
            {itemsCriticos && itemsCriticos.length > 0 ? (
              itemsCriticos.map(item => (
                <div key={item._id} className="p-2 bg-red-50 dark:bg-red-900/30 rounded-md hover:shadow-md transition-shadow">
                  <p className="font-medium text-red-700 dark:text-red-300 truncate">{item.nombreProducto}</p>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    Stock: {item.stockActual} (Mín: {item.stockMinimoAlerta})
                  </p>
                </div>
              ))
            ) : (
              <p className="flex-grow flex justify-center items-center text-gray-500 dark:text-slate-400">No hay ítems con stock crítico.</p>
            )}
          </div>
        )}
        <Link to="/dashboard/inventario" className="inline-flex items-center text-sm text-sky-500 dark:text-sky-400 hover:underline mt-auto pt-3 font-medium self-start">
          Gestionar inventario <ExternalLink size={14} className="ml-1"/>
        </Link>
      </div>
    );
  };

  // --- Componente Widget: Estadísticas ---
  const EstadisticasWidget = () => {
    const itemsCriticosParaConteo = useMemo(() => {
        if (!itemsStockBajo) return [];
        // CAMBIO DE LÓGICA: Coincide con la de InventarioWidget
        return itemsStockBajo.filter(item => 
            item.stockActual <= item.stockMinimoAlerta
        );
    }, [itemsStockBajo]);

    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4 flex items-center">
          <BarChart3 size={22} className="mr-2 text-lime-500" />
          Resumen General
        </h2>
        {(isLoadingTotalPacientes || isLoadingDashboardCitas || isLoadingStockBajo) && <div className="flex-grow flex justify-center items-center p-3"><Spinner /></div>}
        {(!isLoadingTotalPacientes && errorTotalPacientes || !isLoadingDashboardCitas && errorDashboardCitas || !isLoadingStockBajo && errorStockBajo) &&
          <p className="text-sm text-red-500 dark:text-red-400 flex-grow flex justify-center items-center">
              Error al cargar resumen.
          </p>
        }
        {!isLoadingTotalPacientes && !isLoadingDashboardCitas && !isLoadingStockBajo && !errorTotalPacientes && !errorDashboardCitas && !errorStockBajo && (
          <div className="space-y-3 text-sm flex-grow">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm">
              <div className="flex items-center text-gray-600 dark:text-slate-300">
                <Users size={20} className="mr-3 text-blue-500"/>
                <span className="font-medium">Total Pacientes:</span>
              </div>
              <span className="font-bold text-2xl text-gray-800 dark:text-white">{totalPacientes || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm">
               <div className="flex items-center text-gray-600 dark:text-slate-300">
                  <CalendarDays size={20} className="mr-3 text-teal-500"/>
                  <span className="font-medium">Citas para Hoy:</span>
               </div>
              <span className="font-bold text-2xl text-gray-800 dark:text-white">{citasDashboard?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg shadow-sm">
               <div className="flex items-center text-gray-600 dark:text-slate-300">
                  <AlertIcon size={20} className="mr-3 text-red-500"/>
                  <span className="font-medium">Stock Crítico:</span>
               </div>
              <span className="font-bold text-2xl text-gray-800 dark:text-white">{itemsCriticosParaConteo?.length || 0}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            ¡Hola{user?.name ? `, ${user.name}` : ''}! 
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Bienvenido de nuevo a LUMINA. Aquí tienes un resumen rápido:
          </p>
        </div>
        <button 
            onClick={cargarDatosDashboard}
            disabled={isLoadingDashboardCitas || isLoadingStockBajo || isLoadingTotalPacientes}
            className="mt-4 sm:mt-0 p-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
            title="Refrescar datos del dashboard"
        >
            <RefreshCw size={18} className={`${(isLoadingDashboardCitas || isLoadingStockBajo || isLoadingTotalPacientes) ? 'animate-spin' : ''}`}/>
        </button>
      </div>

      {/* Ajuste de la cuadrícula para mejor responsividad */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Acciones Rápidas y Estadísticas pueden ocupar menos espacio en pantallas grandes */}
        <div className="md:col-span-1 xl:col-span-1"> <AccionesRapidasWidget /> </div>
        <div className="md:col-span-1 xl:col-span-1"> <EstadisticasWidget /> </div>
        {/* Citas e Inventario pueden ocupar más o el espacio restante */}
        <div className="md:col-span-2 xl:col-span-2"> <CitasWidget /> </div>
        <div className="md:col-span-2 xl:col-span-2"> <InventarioWidget /> </div> {/* Ajustado para que ocupe más si es necesario, o puedes mantenerlo en 1 */}
      </div>
       
    </div>
  );
}