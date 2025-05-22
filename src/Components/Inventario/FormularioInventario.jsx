// src/Components/Inventario/FormularioItemInventarioControlado.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Save, XCircle, PackagePlus, Settings2, Eye, ShoppingCart, CheckSquare, ListChecks, Tag, ShoppingBag, PlusCircle } from 'lucide-react'; // Asegúrate que PlusCircle esté aquí

const initialStateForm = {
  nombreProducto: '',
  tipoProducto: 'Armazón',
  marca: '',
  modelo: '',
  descripcion: '',
  color: '',
  material: '',
  curvaBaseLC: '',
  diametroLC: '',
  poderLC: '',
  tipoDuracionLC: '',
  tipoMaterialMica: '',
  tratamientosMica: [],
  volumenSolucion: '',
  codigoBarrasUPC: '',
  skuInterno: '',
  proveedor: '',
  costoAdquisicion: '',
  precioVenta: '',
  stockActual: '0',
  stockMinimoAlerta: '1',
  ubicacionAlmacen: '',
  notasItem: '',
};

export default function FormularioItemInventarioControlado({ itemInicial, onGuardar, onCancelar, isLoading, formKey }) {
  const [formData, setFormData] = useState(initialStateForm);
  const [errors, setErrors] = useState({});
  const [tratamientoActual, setTratamientoActual] = useState('');

  useEffect(() => {
    if (itemInicial) {
      setFormData({
        nombreProducto: itemInicial.nombreProducto || '',
        tipoProducto: itemInicial.tipoProducto || 'Armazón',
        marca: itemInicial.marca || '',
        modelo: itemInicial.modelo || '',
        descripcion: itemInicial.descripcion || '',
        color: itemInicial.color || '',
        material: itemInicial.material || '',
        curvaBaseLC: itemInicial.curvaBaseLC || '',
        diametroLC: itemInicial.diametroLC || '',
        poderLC: itemInicial.poderLC || '',
        tipoDuracionLC: itemInicial.tipoDuracionLC || '',
        tipoMaterialMica: itemInicial.tipoMaterialMica || '',
        tratamientosMica: Array.isArray(itemInicial.tratamientosMica) ? itemInicial.tratamientosMica : [],
        volumenSolucion: itemInicial.volumenSolucion || '',
        codigoBarrasUPC: itemInicial.codigoBarrasUPC || '',
        skuInterno: itemInicial.skuInterno || '',
        proveedor: itemInicial.proveedor || '',
        costoAdquisicion: itemInicial.costoAdquisicion?.toString() || '',
        precioVenta: itemInicial.precioVenta?.toString() || '',
        stockActual: itemInicial.stockActual?.toString() || '0',
        stockMinimoAlerta: itemInicial.stockMinimoAlerta?.toString() || '1',
        ubicacionAlmacen: itemInicial.ubicacionAlmacen || '',
        notasItem: itemInicial.notasItem || '',
      });
    } else {
      setFormData(initialStateForm);
    }
    setErrors({});
  }, [itemInicial, formKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddTratamiento = () => {
    if (tratamientoActual && !formData.tratamientosMica.includes(tratamientoActual.trim())) {
      setFormData(prev => ({
        ...prev,
        tratamientosMica: [...prev.tratamientosMica, tratamientoActual.trim()]
      }));
      setTratamientoActual('');
    }
  };

  const handleRemoveTratamiento = (tratamientoARemover) => {
    setFormData(prev => ({
      ...prev,
      tratamientosMica: prev.tratamientosMica.filter(t => t !== tratamientoARemover)
    }));
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.nombreProducto.trim()) newErrors.nombreProducto = 'El nombre del producto es obligatorio.';
    if (!formData.tipoProducto) newErrors.tipoProducto = 'El tipo de producto es obligatorio.';
    if (!formData.precioVenta || isNaN(parseFloat(formData.precioVenta)) || parseFloat(formData.precioVenta) < 0) {
      newErrors.precioVenta = 'El precio de venta debe ser un número positivo.';
    }
    if (formData.costoAdquisicion && (isNaN(parseFloat(formData.costoAdquisicion)) || parseFloat(formData.costoAdquisicion) < 0)) {
        newErrors.costoAdquisicion = 'El costo de adquisición debe ser un número positivo.';
    }
    if (isNaN(parseInt(formData.stockActual)) || parseInt(formData.stockActual) < 0) {
      newErrors.stockActual = 'El stock actual debe ser un número >= 0.';
    }
    if (formData.stockMinimoAlerta && (isNaN(parseInt(formData.stockMinimoAlerta)) || parseInt(formData.stockMinimoAlerta) < 0)) {
        newErrors.stockMinimoAlerta = 'El stock mínimo debe ser un número >= 0.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      const datosParaGuardar = {
        ...formData,
        costoAdquisicion: formData.costoAdquisicion !== '' ? parseFloat(formData.costoAdquisicion) : undefined,
        precioVenta: parseFloat(formData.precioVenta),
        stockActual: parseInt(formData.stockActual),
        stockMinimoAlerta: formData.stockMinimoAlerta !== '' ? parseInt(formData.stockMinimoAlerta) : undefined,
      };
      onGuardar(datosParaGuardar);
    }
  }, [validateForm, formData, onGuardar]);

  const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1";
  const selectClass = `${inputClass} appearance-none`;

  const tiposDeProducto = ['Armazón', 'Lente de Contacto', 'Lente Oftálmico', 'Solución Limpiadora', 'Accesorio', 'Gafas de Sol', 'Otro'];
  const tiposDuracionLC = ['Diario', 'Quincenal', 'Mensual', 'Anual', 'Otro'];
  const tiposMaterialMica = ['CR-39', 'Policarbonato', 'Trivex', 'Alto Índice', 'Otro'];

  return (
    <div className="p-1">
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div className="p-4 border dark:border-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400 flex items-center"><PackagePlus size={20} className="mr-2"/>Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`nombreProducto-inv-${formKey}`} className={labelClass}>Nombre del Producto*</label>
              <input type="text" name="nombreProducto" id={`nombreProducto-inv-${formKey}`} value={formData.nombreProducto} onChange={handleChange} className={inputClass} />
              {errors.nombreProducto && <p className="text-xs text-red-500 mt-1">{errors.nombreProducto}</p>}
            </div>
            <div>
              <label htmlFor={`tipoProducto-inv-${formKey}`} className={labelClass}>Tipo de Producto*</label>
              <select name="tipoProducto" id={`tipoProducto-inv-${formKey}`} value={formData.tipoProducto} onChange={handleChange} className={selectClass}>
                {tiposDeProducto.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
              {errors.tipoProducto && <p className="text-xs text-red-500 mt-1">{errors.tipoProducto}</p>}
            </div>
          </div>
          <div className="mt-4">
              <label htmlFor={`descripcion-inv-${formKey}`} className={labelClass}>Descripción</label>
              <textarea name="descripcion" id={`descripcion-inv-${formKey}`} rows="2" value={formData.descripcion} onChange={handleChange} className={inputClass}></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                  <label htmlFor={`marca-inv-${formKey}`} className={labelClass}>Marca</label>
                  <input type="text" name="marca" id={`marca-inv-${formKey}`} value={formData.marca} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                  <label htmlFor={`modelo-inv-${formKey}`} className={labelClass}>Modelo</label>
                  <input type="text" name="modelo" id={`modelo-inv-${formKey}`} value={formData.modelo} onChange={handleChange} className={inputClass} />
              </div>
          </div>
        </div>

        {formData.tipoProducto === 'Armazón' && (
          <div className="p-4 border dark:border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400 flex items-center"><Settings2 size={20} className="mr-2"/>Detalles del Armazón</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor={`color-inv-${formKey}`} className={labelClass}>Color</label><input type="text" name="color" id={`color-inv-${formKey}`} value={formData.color} onChange={handleChange} className={inputClass} /></div>
              <div><label htmlFor={`material-inv-${formKey}`} className={labelClass}>Material</label><input type="text" name="material" id={`material-inv-${formKey}`} value={formData.material} onChange={handleChange} className={inputClass} /></div>
            </div>
          </div>
        )}

        {formData.tipoProducto === 'Lente de Contacto' && (
          <div className="p-4 border dark:border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400 flex items-center"><Eye size={20} className="mr-2"/>Detalles Lentes de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label htmlFor={`poderLC-inv-${formKey}`} className={labelClass}>Poder (Dioptrías)</label><input type="text" name="poderLC" id={`poderLC-inv-${formKey}`} value={formData.poderLC} onChange={handleChange} className={inputClass} placeholder="-2.75 / +1.50 CIL -0.75"/></div>
              <div><label htmlFor={`curvaBaseLC-inv-${formKey}`} className={labelClass}>Curva Base (BC)</label><input type="text" name="curvaBaseLC" id={`curvaBaseLC-inv-${formKey}`} value={formData.curvaBaseLC} onChange={handleChange} className={inputClass} placeholder="8.6"/></div>
              <div><label htmlFor={`diametroLC-inv-${formKey}`} className={labelClass}>Diámetro (DIA)</label><input type="text" name="diametroLC" id={`diametroLC-inv-${formKey}`} value={formData.diametroLC} onChange={handleChange} className={inputClass} placeholder="14.2"/></div>
              <div>
                  <label htmlFor={`tipoDuracionLC-inv-${formKey}`} className={labelClass}>Tipo Duración</label>
                  <select name="tipoDuracionLC" id={`tipoDuracionLC-inv-${formKey}`} value={formData.tipoDuracionLC} onChange={handleChange} className={selectClass}>
                      <option value="">Seleccionar...</option>
                      {tiposDuracionLC.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                  </select>
              </div>
            </div>
          </div>
        )}
        
        {formData.tipoProducto === 'Lente Oftálmico' && (
          <div className="p-4 border dark:border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400 flex items-center"><CheckSquare size={20} className="mr-2"/>Detalles Lente Oftálmico (Mica)</h3>
            <div>
              <label htmlFor={`tipoMaterialMica-inv-${formKey}`} className={labelClass}>Material de la Mica</label>
              <select name="tipoMaterialMica" id={`tipoMaterialMica-inv-${formKey}`} value={formData.tipoMaterialMica} onChange={handleChange} className={selectClass}>
                  <option value="">Seleccionar material...</option>
                  {tiposMaterialMica.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>
            <div className="mt-4">
              <label className={labelClass}>Tratamientos</label>
              <div className="flex items-center gap-2 mb-2">
                  <input 
                      type="text" 
                      value={tratamientoActual} 
                      onChange={(e) => setTratamientoActual(e.target.value)} 
                      placeholder="Ej: Antirreflejo"
                      className={`${inputClass} flex-grow`}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTratamiento();}}}
                  />
                  {/* Corregido: Usar PlusCircle directamente */}
                  <button type="button" onClick={handleAddTratamiento} className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm"><PlusCircle size={18}/></button>
              </div>
              <div className="flex flex-wrap gap-2">
                  {formData.tratamientosMica.map(t => (
                      <span key={t} className="flex items-center bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {t}
                          <button type="button" onClick={() => handleRemoveTratamiento(t)} className="ml-1.5 text-indigo-500 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-100">
                              <XCircle size={14}/>
                          </button>
                      </span>
                  ))}
              </div>
            </div>
          </div>
        )}

        {formData.tipoProducto === 'Solución Limpiadora' && (
          <div className="p-4 border dark:border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400 flex items-center"><ListChecks size={20} className="mr-2"/>Detalles Solución Limpiadora</h3>
            <div>
              <label htmlFor={`volumenSolucion-inv-${formKey}`} className={labelClass}>Volumen (ej: 300ml)</label>
              <input type="text" name="volumenSolucion" id={`volumenSolucion-inv-${formKey}`} value={formData.volumenSolucion} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        )}

        <div className="p-4 border dark:border-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400 flex items-center"><ShoppingCart size={20} className="mr-2"/>Stock y Precios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                  <label htmlFor={`stockActual-inv-${formKey}`} className={labelClass}>Stock Actual*</label>
                  <input type="number" name="stockActual" id={`stockActual-inv-${formKey}`} value={formData.stockActual} onChange={handleChange} className={inputClass} min="0"/>
                  {errors.stockActual && <p className="text-xs text-red-500 mt-1">{errors.stockActual}</p>}
              </div>
              <div>
                  <label htmlFor={`stockMinimoAlerta-inv-${formKey}`} className={labelClass}>Stock Mínimo (Alerta)</label>
                  <input type="number" name="stockMinimoAlerta" id={`stockMinimoAlerta-inv-${formKey}`} value={formData.stockMinimoAlerta} onChange={handleChange} className={inputClass} min="0"/>
                  {errors.stockMinimoAlerta && <p className="text-xs text-red-500 mt-1">{errors.stockMinimoAlerta}</p>}
              </div>
              <div>
                  <label htmlFor={`costoAdquisicion-inv-${formKey}`} className={labelClass}>Costo Adquisición</label>
                  <div className="relative"><span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-slate-400 text-sm">$</span><input type="number" name="costoAdquisicion" id={`costoAdquisicion-inv-${formKey}`} value={formData.costoAdquisicion} onChange={handleChange} className={`${inputClass} pl-7`} min="0" step="0.01"/></div>
                  {errors.costoAdquisicion && <p className="text-xs text-red-500 mt-1">{errors.costoAdquisicion}</p>}
              </div>
              <div>
                  <label htmlFor={`precioVenta-inv-${formKey}`} className={labelClass}>Precio Venta*</label>
                  <div className="relative"><span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-slate-400 text-sm">$</span><input type="number" name="precioVenta" id={`precioVenta-inv-${formKey}`} value={formData.precioVenta} onChange={handleChange} className={`${inputClass} pl-7`} min="0" step="0.01"/></div>
                  {errors.precioVenta && <p className="text-xs text-red-500 mt-1">{errors.precioVenta}</p>}
              </div>
          </div>
        </div>
        
        <div className="p-4 border dark:border-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400 flex items-center"><Tag size={20} className="mr-2"/>Información Adicional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label htmlFor={`codigoBarrasUPC-inv-${formKey}`} className={labelClass}>Código Barras (UPC/EAN)</label><input type="text" name="codigoBarrasUPC" id={`codigoBarrasUPC-inv-${formKey}`} value={formData.codigoBarrasUPC} onChange={handleChange} className={inputClass} /></div>
              <div><label htmlFor={`skuInterno-inv-${formKey}`} className={labelClass}>SKU Interno</label><input type="text" name="skuInterno" id={`skuInterno-inv-${formKey}`} value={formData.skuInterno} onChange={handleChange} className={inputClass} /></div>
              <div><label htmlFor={`proveedor-inv-${formKey}`} className={labelClass}>Proveedor</label><input type="text" name="proveedor" id={`proveedor-inv-${formKey}`} value={formData.proveedor} onChange={handleChange} className={inputClass} /></div>
              <div><label htmlFor={`ubicacionAlmacen-inv-${formKey}`} className={labelClass}>Ubicación Almacén</label><input type="text" name="ubicacionAlmacen" id={`ubicacionAlmacen-inv-${formKey}`} value={formData.ubicacionAlmacen} onChange={handleChange} className={inputClass} /></div>
          </div>
           <div className="mt-4">
              <label htmlFor={`notasItem-inv-${formKey}`} className={labelClass}>Notas del Item</label>
              <textarea name="notasItem" id={`notasItem-inv-${formKey}`} rows="2" value={formData.notasItem} onChange={handleChange} className={inputClass}></textarea>
          </div>
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
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center disabled:opacity-70 min-w-[110px]"
          >
            {isLoading ? (
              <span className="animate-pulse">Guardando...</span>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {itemInicial ? 'Actualizar' : 'Crear'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}