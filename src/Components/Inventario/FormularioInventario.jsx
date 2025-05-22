// src/Components/Inventario/FormularioInventario.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addNewItemInventario,
  updateExistingItemInventario,
  // clearInventarioError, // Descomenta si lo usas
} from '../../store/slices/inventarioSlice'; // Asegúrate que los nombres sean los de tu slice
import { Save, XCircle, AlertCircle } from 'lucide-react';

const TIPOS_PRODUCTO = ['Armazón', 'Lente de Contacto', 'Lente Oftálmico', 'Solución Limpiadora', 'Accesorio', 'Gafas de Sol', 'Otro'];

const initialStateFormInventario = {
  nombreProducto: '',
  tipoProducto: TIPOS_PRODUCTO[0],
  marca: '',
  modelo: '',
  color: '',
  descripcion: '',
  material: '',
  proveedor: '',
  costoAdquisicion: 0,
  precioVenta: 0,
  stockActual: 0,
  stockMinimoAlerta: 0,
  notasItem: '',
};

export default function FormularioInventario({ itemInicial, onGuardadoExitoso, onCancelar, isLoadingExterno, formKey }) {
  const dispatch = useDispatch();
  const { loading: isSaving, error: saveError } = useSelector(state => ({
    // Ajusta esto si tienes estados de carga/error más específicos en tu slice para add/update
    loading: state.inventario.isLoading, // Usando el isLoading general del slice
    error: state.inventario.error,       // Usando el error general del slice
  }));

  const [formData, setFormData] = useState(initialStateFormInventario);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (itemInicial) {
      setFormData({
        nombreProducto: itemInicial.nombreProducto || '',
        tipoProducto: itemInicial.tipoProducto || TIPOS_PRODUCTO[0],
        marca: itemInicial.marca || '',
        modelo: itemInicial.modelo || '',
        color: itemInicial.color || '',
        descripcion: itemInicial.descripcion || '',
        material: itemInicial.material || '',
        proveedor: itemInicial.proveedor || '',
        costoAdquisicion: itemInicial.costoAdquisicion || 0,
        precioVenta: itemInicial.precioVenta || 0,
        stockActual: itemInicial.stockActual || 0,
        stockMinimoAlerta: itemInicial.stockMinimoAlerta || 0,
        notasItem: itemInicial.notasItem || '',
      });
    } else {
      setFormData(initialStateFormInventario);
    }
    setErrors({});
  }, [itemInicial, formKey]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === 'number') {
        parsedValue = value === '' ? '' : parseFloat(value);
        if (isNaN(parsedValue) && value !== '' && value !== '-') return;
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.nombreProducto.trim()) newErrors.nombreProducto = 'El nombre del producto es obligatorio.';
    if (!formData.tipoProducto) newErrors.tipoProducto = 'Debe seleccionar un tipo de producto.';
    if (formData.precioVenta === '' || parseFloat(formData.precioVenta) < 0) newErrors.precioVenta = 'El precio de venta debe ser un número positivo o cero.';
    if (formData.costoAdquisicion === '' || parseFloat(formData.costoAdquisicion) < 0) newErrors.costoAdquisicion = 'El costo de adquisición debe ser un número positivo o cero.';
    if (formData.stockActual === '' || parseInt(formData.stockActual, 10) < 0) newErrors.stockActual = 'El stock actual debe ser un número positivo o cero.';
    if (formData.stockMinimoAlerta === '' || parseInt(formData.stockMinimoAlerta, 10) < 0) newErrors.stockMinimoAlerta = 'El stock mínimo debe ser un número positivo o cero.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (dispatch && clearInventarioError) dispatch(clearInventarioError());

    if (validateForm()) {
      const datosParaGuardar = {
        ...formData,
        costoAdquisicion: parseFloat(formData.costoAdquisicion) || 0,
        precioVenta: parseFloat(formData.precioVenta) || 0,
        stockActual: parseInt(formData.stockActual, 10) || 0,
        stockMinimoAlerta: parseInt(formData.stockMinimoAlerta, 10) || 0,
      };

      let resultadoAccion;
      if (itemInicial && itemInicial._id) {
        resultadoAccion = await dispatch(
          updateExistingItemInventario({ 
            id: itemInicial._id, // <--- ESTE ES EL CAMBIO IMPORTANTE: 'id' en lugar de 'itemId'
            itemData: datosParaGuardar 
          })
        );
      } else {
        resultadoAccion = await dispatch(addNewItemInventario(datosParaGuardar));
      }

      if (resultadoAccion.meta && resultadoAccion.meta.requestStatus === 'fulfilled') {
        onGuardadoExitoso();
      } else {
        if (resultadoAccion.payload && typeof resultadoAccion.payload === 'object' && resultadoAccion.payload.errors) {
             const backendErrors = {};
             for (const err of resultadoAccion.payload.errors) {
                if (err.path && err.message) backendErrors[err.path] = err.message;
             }
             setErrors(prev => ({...prev, ...backendErrors}));
        } else if (typeof resultadoAccion.payload === 'string' && resultadoAccion.payload.startsWith('Error:')) { // Para manejar el rejectWithValue del thunk si el ID era undefined
            setErrors(prev => ({...prev, form: resultadoAccion.payload}));
        } else if (saveError) { // Usa el error general del slice si está disponible
            setErrors(prev => ({...prev, form: typeof saveError === 'string' ? saveError : 'Error al guardar los datos.'}));
        }
      }
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1";
  const selectClass = `${inputClass} appearance-none`;

  const currentlySaving = isSaving || isLoadingExterno;

  return (
    <div className="p-1">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
            <div className="p-3 text-xs text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300 flex items-center" role="alert">
                <AlertCircle size={16} className="mr-2"/> {errors.form}
            </div>
        )}
        {/* Si 'saveError' del slice es un string y no hay error 'form' específico, muéstralo */}
        {saveError && typeof saveError === 'string' && !errors.form && (
             <div className="p-3 text-xs text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300 flex items-center" role="alert">
                <AlertCircle size={16} className="mr-2"/> {saveError}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`nombreProducto-inv-${formKey}`} className={labelClass}>Nombre del Producto*</label>
            <input type="text" name="nombreProducto" id={`nombreProducto-inv-${formKey}`} value={formData.nombreProducto} onChange={handleChange} className={inputClass} />
            {errors.nombreProducto && <p className="text-xs text-red-500 mt-1">{errors.nombreProducto}</p>}
          </div>
          <div>
            <label htmlFor={`tipoProducto-inv-${formKey}`} className={labelClass}>Tipo de Producto*</label>
            <select name="tipoProducto" id={`tipoProducto-inv-${formKey}`} value={formData.tipoProducto} onChange={handleChange} className={selectClass}>
              {TIPOS_PRODUCTO.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
            </select>
            {errors.tipoProducto && <p className="text-xs text-red-500 mt-1">{errors.tipoProducto}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`marca-inv-${formKey}`} className={labelClass}>Marca</label>
            <input type="text" name="marca" id={`marca-inv-${formKey}`} value={formData.marca} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor={`modelo-inv-${formKey}`} className={labelClass}>Modelo</label>
            <input type="text" name="modelo" id={`modelo-inv-${formKey}`} value={formData.modelo} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor={`color-inv-${formKey}`} className={labelClass}>Color</label>
                <input type="text" name="color" id={`color-inv-${formKey}`} value={formData.color} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label htmlFor={`material-inv-${formKey}`} className={labelClass}>Material</label>
                <input type="text" name="material" id={`material-inv-${formKey}`} value={formData.material} onChange={handleChange} className={inputClass} />
            </div>
        </div>

        <div>
          <label htmlFor={`descripcion-inv-${formKey}`} className={labelClass}>Descripción</label>
          <textarea name="descripcion" id={`descripcion-inv-${formKey}`} rows="2" value={formData.descripcion} onChange={handleChange} className={inputClass}></textarea>
        </div>

        <div>
            <label htmlFor={`proveedor-inv-${formKey}`} className={labelClass}>Proveedor</label>
            <input type="text" name="proveedor" id={`proveedor-inv-${formKey}`} value={formData.proveedor} onChange={handleChange} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor={`costoAdquisicion-inv-${formKey}`} className={labelClass}>Costo Adquisición*</label>
            <input type="number" name="costoAdquisicion" id={`costoAdquisicion-inv-${formKey}`} value={formData.costoAdquisicion} onChange={handleChange} className={inputClass} step="0.01" min="0" placeholder="0.00"/>
            {errors.costoAdquisicion && <p className="text-xs text-red-500 mt-1">{errors.costoAdquisicion}</p>}
          </div>
          <div>
            <label htmlFor={`precioVenta-inv-${formKey}`} className={labelClass}>Precio Venta*</label>
            <input type="number" name="precioVenta" id={`precioVenta-inv-${formKey}`} value={formData.precioVenta} onChange={handleChange} className={inputClass} step="0.01" min="0" placeholder="0.00"/>
            {errors.precioVenta && <p className="text-xs text-red-500 mt-1">{errors.precioVenta}</p>}
          </div>
          <div>
            <label htmlFor={`stockActual-inv-${formKey}`} className={labelClass}>Stock Actual*</label>
            <input type="number" name="stockActual" id={`stockActual-inv-${formKey}`} value={formData.stockActual} onChange={handleChange} className={inputClass} step="1" min="0" placeholder="0"/>
            {errors.stockActual && <p className="text-xs text-red-500 mt-1">{errors.stockActual}</p>}
          </div>
          <div>
            <label htmlFor={`stockMinimoAlerta-inv-${formKey}`} className={labelClass}>Stock Mínimo*</label>
            <input type="number" name="stockMinimoAlerta" id={`stockMinimoAlerta-inv-${formKey}`} value={formData.stockMinimoAlerta} onChange={handleChange} className={inputClass} step="1" min="0" placeholder="0"/>
            {errors.stockMinimoAlerta && <p className="text-xs text-red-500 mt-1">{errors.stockMinimoAlerta}</p>}
          </div>
        </div>
        
        <div>
          <label htmlFor={`notasItem-inv-${formKey}`} className={labelClass}>Notas Adicionales</label>
          <textarea name="notasItem" id={`notasItem-inv-${formKey}`} rows="2" value={formData.notasItem} onChange={handleChange} className={inputClass}></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200 dark:border-slate-700 mt-5">
          <button
            type="button"
            onClick={onCancelar}
            disabled={currentlySaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 rounded-md shadow-sm border border-gray-300 dark:border-slate-500 flex items-center"
          >
            <XCircle size={18} className="mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={currentlySaving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
          >
            <Save size={18} className="mr-2" />
            {currentlySaving ? (itemInicial ? 'Actualizando...' : 'Guardando...') : (itemInicial ? 'Actualizar Ítem' : 'Guardar Ítem')}
          </button>
        </div>
      </form>
    </div>
  );
}