import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInventario,
  addNewItemInventario,
  updateExistingItemInventario,
  deleteExistingItemInventario,
  clearInventarioError,
} from '../../store/slices/inventarioSlice'; // Asegúrate que este slice esté correcto
import FormularioItemInventarioControlado from './FormularioInventario';
import Spinner from '../Common/Spinner';
import ModalControlado from '../Common/ModalControlado'; // Para confirmación de eliminación
import { PlusCircle, Edit3, Trash2, PackagePlus, PackageSearch, PackageX, AlertTriangle, Package, ListFilter, Tag, ShoppingBag, Settings2, Eye, CheckSquare, ListChecks, XCircle } from 'lucide-react';

const getTipoProductoIcon = (tipo) => {
    switch (tipo) {
        case 'Armazón': return <Settings2 size={16} className="mr-2 text-blue-500 dark:text-blue-400"/>;
        case 'Lente de Contacto': return <Eye size={16} className="mr-2 text-teal-500 dark:text-teal-400"/>;
        case 'Lente Oftálmico': return <CheckSquare size={16} className="mr-2 text-green-500 dark:text-green-400"/>;
        case 'Solución Limpiadora': return <ListChecks size={16} className="mr-2 text-purple-500 dark:text-purple-400"/>;
        case 'Accesorio': return <Tag size={16} className="mr-2 text-orange-500 dark:text-orange-400"/>;
        case 'Gafas de Sol': return <ShoppingBag size={16} className="mr-2 text-pink-500 dark:text-pink-400"/>;
        default: return <Package size={16} className="mr-2 text-gray-500 dark:text-gray-400"/>;
    }
};

export default function GestionInventarioControlado() {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.inventario);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formKey, setFormKey] = useState(Date.now());

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);
  
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroStockBajo, setFiltroStockBajo] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const tiposDeProductoUnicos = ['Armazón', 'Lente de Contacto', 'Lente Oftálmico', 'Solución Limpiadora', 'Accesorio', 'Gafas de Sol', 'Otro'];
  const marcasUnicas = [...new Set(items.map(item => item.marca).filter(Boolean))].sort();

  const cargarInventarioConFiltros = useCallback(() => {
    const filtrosActivos = {};
    if (filtroNombre) filtrosActivos.nombreProducto = filtroNombre;
    if (filtroTipo) filtrosActivos.tipoProducto = filtroTipo;
    if (filtroMarca) filtrosActivos.marca = filtroMarca;
    // Filtro de stock bajo se aplica en el frontend
    dispatch(fetchInventario(filtrosActivos));
  }, [dispatch, filtroNombre, filtroTipo, filtroMarca]);

  useEffect(() => {
    cargarInventarioConFiltros();
    return () => {
        dispatch(clearInventarioError());
    }
  }, [cargarInventarioConFiltros, dispatch]);

  const handleAbrirFormulario = useCallback((item = null) => {
    dispatch(clearInventarioError());
    setEditingItem(item);
    setFormKey(Date.now());
    setMostrarFormulario(true);
  }, [dispatch]);

  const handleCerrarFormulario = useCallback(() => {
    setMostrarFormulario(false);
    setEditingItem(null);
    dispatch(clearInventarioError());
  }, [dispatch]);

  const handleGuardarItem = useCallback(async (datosFormulario) => {
    let resultadoAccion;
    if (editingItem && editingItem._id) {
      resultadoAccion = await dispatch(updateExistingItemInventario({ id: editingItem._id, itemData: datosFormulario }));
    } else {
      resultadoAccion = await dispatch(addNewItemInventario(datosFormulario));
    }
    if (resultadoAccion.meta.requestStatus === 'fulfilled') {
      handleCerrarFormulario();
    }
  }, [dispatch, editingItem, handleCerrarFormulario]);
  
  const abrirModalEliminar = useCallback((item) => {
    setItemAEliminar(item);
    setShowDeleteModal(true);
  }, []);

  const confirmarEliminarItem = useCallback(async () => {
    if (itemAEliminar) {
      const resultado = await dispatch(deleteExistingItemInventario(itemAEliminar._id));
      if (resultado.meta.requestStatus === 'fulfilled') {
        setShowDeleteModal(false);
        setItemAEliminar(null);
      }
    }
  }, [dispatch, itemAEliminar]);

  const handleResetFiltros = useCallback(() => {
    setFiltroNombre('');
    setFiltroTipo('');
    setFiltroMarca('');
    setFiltroStockBajo(false);
  }, []);

  const itemsFiltrados = items.filter(item => {
    let pasaFiltros = true;
    if (filtroNombre && !item.nombreProducto.toLowerCase().includes(filtroNombre.toLowerCase()) && !(item.modelo && item.modelo.toLowerCase().includes(filtroNombre.toLowerCase()))) pasaFiltros = false;
    if (filtroTipo && item.tipoProducto !== filtroTipo) pasaFiltros = false;
    if (filtroMarca && item.marca !== filtroMarca) pasaFiltros = false;
    if (filtroStockBajo && item.stockActual > (item.stockMinimoAlerta || 0)) pasaFiltros = false;
    return pasaFiltros;
  }); // La ordenación se hace en el slice

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white">Gestión de Inventario</h2>
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
                <span>Nuevo Item</span>
                </button>
            )}
        </div>
      </div>

      {mostrarFiltros && (
         <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow mb-6 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="filtroNombre-inv" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nombre/Modelo</label>
                    <input type="text" id="filtroNombre-inv" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} placeholder="Buscar..." className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="filtroTipo-inv" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tipo Producto</label>
                    <select id="filtroTipo-inv" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Todos los tipos</option>
                        {tiposDeProductoUnicos.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="filtroMarca-inv" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Marca</label>
                    <select id="filtroMarca-inv" value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Todas las marcas</option>
                        {marcasUnicas.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                    <input type="checkbox" id="filtroStockBajo-inv" checked={filtroStockBajo} onChange={(e) => setFiltroStockBajo(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                    <label htmlFor="filtroStockBajo-inv" className="ml-2 block text-sm text-gray-900 dark:text-slate-300">Mostrar solo stock bajo</label>
                </div>
                <button onClick={handleResetFiltros} className="text-sm text-gray-600 dark:text-slate-300 hover:underline hover:text-indigo-500 dark:hover:text-indigo-400">Limpiar filtros</button>
            </div>
        </div>
      )}

      {error && (
        <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300 flex justify-between items-center" role="alert">
          <div><span className="font-medium">Error:</span> {error}</div>
          <button onClick={() => dispatch(clearInventarioError())} className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-700/50"><XCircle size={18}/></button>
        </div>
      )}

      {mostrarFormulario && (
        <div className="my-4 p-4 border rounded-lg dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
              {editingItem ? <Edit3 size={22} className="text-amber-500 mr-2"/> : <PackagePlus size={22} className="text-indigo-500 mr-2"/>}
              {editingItem ? 'Editar Item de Inventario' : 'Agregar Nuevo Item'}
            </h3>
            <FormularioItemInventarioControlado
                key={formKey}
                itemInicial={editingItem}
                onGuardar={handleGuardarItem}
                onCancelar={handleCerrarFormulario}
                isLoading={isLoading}
            />
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-0 sm:p-2 rounded-xl shadow-lg overflow-x-auto">
        {isLoading && items.length === 0 && <div className="flex justify-center p-6"><Spinner /><p className="ml-2 dark:text-slate-300">Cargando...</p></div>}
        {!isLoading && itemsFiltrados.length === 0 && ( <div className="text-center py-6 text-gray-500 dark:text-slate-400"><PackageSearch size={40} className="mx-auto mb-1" /><p>No hay items en el inventario.</p></div>)}
        
        {itemsFiltrados.length > 0 && (
            <table className="w-full min-w-[900px] text-sm text-left text-gray-500 dark:text-slate-300">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-slate-400">
                    <tr>
                        <th scope="col" className="px-4 py-3">Producto</th>
                        <th scope="col" className="px-4 py-3">Tipo</th>
                        <th scope="col" className="px-4 py-3">Marca</th>
                        <th scope="col" className="px-4 py-3 text-right">Stock</th>
                        <th scope="col" className="px-4 py-3 text-right">Precio V.</th>
                        <th scope="col" className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsFiltrados.map(item => (
                        <tr key={item._id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                <div className="flex items-center">
                                    {getTipoProductoIcon(item.tipoProducto)}
                                    {item.nombreProducto}
                                </div>
                            </td>
                            <td className="px-4 py-3">{item.tipoProducto}</td>
                            <td className="px-4 py-3">{item.marca || '-'}</td>
                            <td className={`px-4 py-3 text-right font-semibold ${item.stockActual <= (item.stockMinimoAlerta || 0) ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {item.stockActual}
                                {item.stockActual <= (item.stockMinimoAlerta || 0) && <AlertTriangle size={14} className="inline ml-1 mb-0.5"/>}
                            </td>
                            <td className="px-4 py-3 text-right">${item.precioVenta.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                <button onClick={() => handleAbrirFormulario(item)} title="Editar Item" className="p-1.5 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 rounded-full mr-1">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => abrirModalEliminar(item)} title="Eliminar Item" className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-full">
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
          isOpen={showDeleteModal && !!itemAEliminar}
          onClose={() => { setShowDeleteModal(false); setItemAEliminar(null);}}
          title="Confirmar Eliminación de Item"
          titleIcon={<AlertTriangle size={20} className="text-red-500"/>}
      >
        {itemAEliminar && (
            <>
                <p className="text-gray-700 dark:text-slate-300 mb-4">
                    ¿Seguro deseas eliminar el item <strong className="font-semibold">{itemAEliminar.nombreProducto}</strong>?
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                    onClick={() => { setShowDeleteModal(false); setItemAEliminar(null);}}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 rounded-md"
                    >
                    Cancelar
                    </button>
                    <button
                    onClick={confirmarEliminarItem}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-70"
                    >
                    {isLoading && itemAEliminar ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </>
        )}
      </ModalControlado>
    </div>
  );
}
