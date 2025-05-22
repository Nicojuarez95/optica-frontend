// src/Components/Inventario/GestionInventario.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInventario,
  deleteExistingItemInventario,
  // clearInventarioError, // Si la usas
} from '../../store/slices/inventarioSlice';
import FormularioInventario from './FormularioInventario';
import Spinner from '../Common/Spinner';
import ModalControlado from '../Common/ModalControlado';
import { PlusCircle, Edit3, Trash2, ListFilter, AlertTriangle, PackageSearch, PackageX, ShoppingCart, RotateCcw } from 'lucide-react'; // Añadido RotateCcw

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

const COLUMNAS_TABLA = [
  { header: 'Producto', accessor: 'nombreProducto' },
  { header: 'Tipo', accessor: 'tipoProducto' },
  { header: 'Marca', accessor: 'marca' },
  { header: 'Stock', accessor: 'stockActual', align: 'center' },
  { header: 'Precio Venta', accessor: 'precioVenta', format: formatCurrency, align: 'right' },
];

// Para el desplegable de filtro de tipo de producto
const TIPOS_PRODUCTO_OPCIONES_FILTRO = ['Armazón', 'Lente de Contacto', 'Lente Oftálmico', 'Solución Limpiadora', 'Accesorio', 'Gafas de Sol', 'Otro'];


export default function GestionInventario() {
  const dispatch = useDispatch();
  const itemsInventario = useSelector((state) => state.inventario.items);
  const isLoading = useSelector((state) => state.inventario.isLoading); // Usando el isLoading general
  const error = useSelector((state) => state.inventario.error);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formKey, setFormKey] = useState(Date.now());

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);
  
  // --- Estados para Filtros ---
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroTipo, setFiltroTipo] = useState(''); // Vacío significa "Todos"
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroStockMenorA, setFiltroStockMenorA] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false); // Para controlar la visibilidad del panel de filtros

  const cargarInventario = useCallback(() => {
    const filtrosActivos = {};
    if (filtroNombre.trim()) filtrosActivos.nombreProducto = filtroNombre.trim(); // Asumiendo que el backend puede manejar 'nombreProducto'
    if (filtroTipo) filtrosActivos.tipoProducto = filtroTipo;
    if (filtroMarca.trim()) filtrosActivos.marca = filtroMarca.trim();
    if (filtroStockMenorA.trim() && !isNaN(parseInt(filtroStockMenorA))) {
      filtrosActivos.stockMenorA = parseInt(filtroStockMenorA);
    }
    dispatch(fetchInventario(filtrosActivos));
  }, [dispatch, filtroNombre, filtroTipo, filtroMarca, filtroStockMenorA]);

  useEffect(() => {
    cargarInventario();
    // return () => {
    //   if (dispatch && clearInventarioError) {
    //      dispatch(clearInventarioError());
    //   }
    // }
  }, [cargarInventario]); // `cargarInventario` ya tiene sus propias dependencias de filtros

  const handleAbrirFormulario = useCallback((item = null) => {
    setEditingItem(item);
    setFormKey(Date.now());
    setMostrarFormulario(true);
  }, []);

  const handleCerrarFormulario = useCallback(() => {
    setMostrarFormulario(false);
    setEditingItem(null);
  }, []);

  const handleGuardadoExitoso = useCallback(() => {
    handleCerrarFormulario();
  }, [handleCerrarFormulario]);

  const abrirModalEliminar = useCallback((item) => {
    setItemAEliminar(item);
    setShowDeleteModal(true);
  }, []);

  const confirmarEliminarItem = useCallback(async () => {
    if (itemAEliminar) {
      const resultado = await dispatch(deleteExistingItemInventario(itemAEliminar._id));
      if (resultado.meta && resultado.meta.requestStatus === 'fulfilled') {
        setShowDeleteModal(false);
        setItemAEliminar(null);
      }
    }
  }, [dispatch, itemAEliminar]);

  const handleResetFiltros = useCallback(() => {
    setFiltroNombre('');
    setFiltroTipo('');
    setFiltroMarca('');
    setFiltroStockMenorA('');
    // No es necesario llamar a cargarInventario() aquí directamente, 
    // porque el useEffect se disparará cuando estos estados cambien y `cargarInventario` sea una nueva referencia.
    // Si `cargarInventario` no cambia de referencia (lo cual no debería con useCallback y sus dependencias),
    // necesitarías una llamada explícita o que `useEffect` dependa también de los filtros.
    // Para asegurar, podemos forzar la carga:
    // dispatch(fetchInventario({})); // O simplemente dejar que el useEffect principal lo haga.
  }, []);
  
  // Clases comunes para inputs de filtro (puedes ajustarlas)
  const inputFilterClass = "w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500";
  const labelFilterClass = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1";

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white flex items-center">
            <ShoppingCart size={28} className="mr-3 text-indigo-600"/>
            Gestión de Inventario
        </h2>
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
              <span>Nuevo Ítem</span>
            </button>
          )}
        </div>
      </div>

      {/* --- Sección de Filtros --- */}
      {mostrarFiltros && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow mb-6 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="filtroNombre" className={labelFilterClass}>Nombre Producto</label>
              <input 
                type="text" 
                id="filtroNombre" 
                value={filtroNombre} 
                onChange={(e) => setFiltroNombre(e.target.value)} 
                className={inputFilterClass}
                placeholder="Buscar por nombre..."
              />
            </div>
            <div>
              <label htmlFor="filtroTipo" className={labelFilterClass}>Tipo Producto</label>
              <select 
                id="filtroTipo" 
                value={filtroTipo} 
                onChange={(e) => setFiltroTipo(e.target.value)} 
                className={inputFilterClass}
              >
                <option value="">Todos</option>
                {TIPOS_PRODUCTO_OPCIONES_FILTRO.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filtroMarca" className={labelFilterClass}>Marca</label>
              <input 
                type="text" 
                id="filtroMarca" 
                value={filtroMarca} 
                onChange={(e) => setFiltroMarca(e.target.value)} 
                className={inputFilterClass}
                placeholder="Buscar por marca..."
              />
            </div>
            <div>
              <label htmlFor="filtroStockMenorA" className={labelFilterClass}>Stock Menor A</label>
              <input 
                type="number" 
                id="filtroStockMenorA" 
                value={filtroStockMenorA} 
                onChange={(e) => setFiltroStockMenorA(e.target.value)} 
                className={inputFilterClass}
                placeholder="Ej: 5"
                min="0"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleResetFiltros} 
              className="text-sm text-gray-600 dark:text-slate-300 hover:underline hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center"
            >
              <RotateCcw size={14} className="mr-1"/> Limpiar filtros
            </button>
          </div>
        </div>
      )}

       {error && !isLoading && ( // Mostrar error solo si no está cargando para evitar superposición
        <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300 flex justify-between items-center" role="alert">
          <div><span className="font-medium">Error:</span> {typeof error === 'string' ? error : JSON.stringify(error)}</div>
          {/* Puedes añadir un botón para limpiar el error si tienes la acción clearInventarioError */}
          {/* <button onClick={() => dispatch(clearInventarioError())} className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-700/50"><XCircle size={18}/></button> */}
        </div>
      )}
       {mostrarFormulario && (
        <div className="my-4 p-4 border rounded-lg dark:border-slate-700 bg-gray-50 dark:bg-slate-800 shadow-lg animate-fadeIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            {editingItem ? <Edit3 size={22} className="text-amber-500 mr-2"/> : <PlusCircle size={22} className="text-indigo-500 mr-2"/>}
            {editingItem ? 'Editar Ítem de Inventario' : 'Añadir Nuevo Ítem'}
          </h3>
          <FormularioInventario
            key={formKey}
            itemInicial={editingItem}
            onGuardadoExitoso={handleGuardadoExitoso}
            onCancelar={handleCerrarFormulario}
            isLoadingExterno={isLoading}
          />
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-0 sm:p-2 rounded-xl shadow-lg overflow-x-auto">
        {isLoading && (!itemsInventario || itemsInventario.length === 0) && (
          <div className="flex justify-center p-6">
            <Spinner /><p className="ml-2 dark:text-slate-300">Cargando ítems...</p>
          </div>
        )}
        {!isLoading && (!itemsInventario || itemsInventario.length === 0) && !mostrarFormulario && (
          <div className="text-center py-8 text-gray-500 dark:text-slate-400">
            <PackageSearch size={48} className="mx-auto mb-2 text-gray-400 dark:text-slate-500" />
            <p className="text-lg font-semibold">No se encontraron ítems.</p>
            <p className="text-sm">Intenta ajustar los filtros o añade un nuevo ítem.</p>
          </div>
        )}
        
        {itemsInventario && itemsInventario.length > 0 && (
          <table className="w-full min-w-[768px] text-sm text-left text-gray-500 dark:text-slate-300">
            {/* ... Thead y Tbody como lo tenías ... */}
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                {COLUMNAS_TABLA.map(col => (
                    <th key={col.accessor} scope="col" className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : 'text-left')}`}>
                        {col.header}
                    </th>
                ))}
                <th scope="col" className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {itemsInventario.map(item => (
                <tr key={item._id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                  {COLUMNAS_TABLA.map(col => (
                    <td key={col.accessor} className={`px-4 py-3 ${col.accessor === 'nombreProducto' ? 'font-medium text-gray-900 dark:text-white' : ''} ${col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : '')}`}>
                      {col.format ? col.format(item[col.accessor]) : item[col.accessor] || 'N/A'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button 
                      onClick={() => handleAbrirFormulario(item)} 
                      title="Editar Ítem" 
                      className="p-1.5 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 rounded-full mr-1 transition-colors duration-150"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => abrirModalEliminar(item)} 
                      title="Eliminar Ítem" 
                      className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-full transition-colors duration-150"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* ... Modal de eliminación ... */}
      <ModalControlado
        isOpen={showDeleteModal && !!itemAEliminar}
        onClose={() => { setShowDeleteModal(false); setItemAEliminar(null);}}
        title="Confirmar Eliminación"
        titleIcon={<AlertTriangle size={20} className="text-red-500"/>}
      >
        {itemAEliminar && (
          <>
            <p className="text-gray-700 dark:text-slate-300 mb-4">
              ¿Seguro deseas eliminar el ítem <strong className="font-semibold">{itemAEliminar.nombreProducto}</strong>? Esta acción no se puede deshacer.
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