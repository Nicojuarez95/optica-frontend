import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Login from "../../Components/Login/login";

Modal.setAppElement("#root");

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [recibo, setRecibo] = useState({ reciboDe: "", suma: "", concepto: "" });
  const [remito, setRemito] = useState([{ articulo: "", cantidad: "", descripcion: "" }]);
  const [presupuesto, setPresupuesto] = useState([{ descripcion: "", unidades: 0, precio: 0, total: 0 }]);

  const [presupuestoNumero, setPresupuestoNumero] = useState(1);
  const empresa = {
    nombre: "Faustina Algarrobos",
    cuit: "20-00000000-0",
    direccion: "Hipólito Yrigoyen 491, La Carlota",
  };
  const fechaActual = new Date().toLocaleDateString();

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  const handleReciboChange = (e) => setRecibo({ ...recibo, [e.target.name]: e.target.value });

  const handleRemitoChange = (index, e) => {
    const { name, value } = e.target;
    setRemito((prevRemito) =>
      prevRemito.map((item, i) => (i === index ? { ...item, [name]: value } : item))
    );
  };
  useEffect(() => {
    const savedNumero = localStorage.getItem("presupuestoNumero");
    if (savedNumero) {
      setPresupuestoNumero(parseInt(savedNumero, 10));
    }
  }, [isAuthenticated]); // Se ejecuta cuando el usuario inicia sesión

  // ✅ Guardar cada vez que cambia
  useEffect(() => {
    localStorage.setItem("presupuestoNumero", presupuestoNumero);
  }, [presupuestoNumero]);
  
  useEffect(() => {
    localStorage.setItem("presupuestoNumero", presupuestoNumero);
  }, [presupuestoNumero]);

  const handlePresupuestoChange = (index, e) => {
    const { name, value } = e.target;
    setPresupuesto((prevPresupuesto) => {
      const updatedPresupuesto = [...prevPresupuesto];
      
      // Convertimos a número para evitar errores de concatenación de strings
      const newValue = name === "precio" || name === "unidades" ? Number(value) : value;
      
      updatedPresupuesto[index] = {
        ...updatedPresupuesto[index],
        [name]: newValue,
      };
  
      // Recalcular el total con los valores más recientes
      updatedPresupuesto[index].total = updatedPresupuesto[index].unidades * updatedPresupuesto[index].precio;
  
      return updatedPresupuesto;
    });
  };
  
  const addRemitoRow = () => setRemito([...remito, { articulo: "", cantidad: "", descripcion: "" }]);
  const addPresupuestoRow = () => setPresupuesto([...presupuesto, { descripcion: "", unidades: 0, precio: 0, total: 0 }]);

  const subtotal = presupuesto.reduce((sum, item) => sum + item.total, 0);
  const iva = subtotal * 0.21;
  const totalPresupuesto = subtotal + iva;

  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Estilos generales
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(empresa.nombre, 10, 15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`CUIT: ${empresa.cuit}`, 10, 25);
    doc.text(`Dirección: ${empresa.direccion}`, 10, 30);
    doc.text(`Fecha: ${fechaActual}`, 150, 30);
  
    if (modalType === "recibo") {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RECIBO", 10, 45);
  
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Recibo de: ${recibo.reciboDe}`, 10, 55);
      doc.text(`La suma de: $${recibo.suma}`, 10, 65);
      doc.text(`Por concepto de: ${recibo.concepto}`, 10, 75);
  
    } else if (modalType === "remito") {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("REMITO", 10, 45);
  
      autoTable(doc, {
        startY: 55,
        theme: "striped",
        headStyles: { fillColor: [0, 112, 192] }, // Azul profesional
        styles: { fontSize: 10, cellPadding: 3 },
        head: [["Artículo", "Cantidad", "Descripción"]],
        body: remito.map((row) => [row.articulo, row.cantidad, row.descripcion]),
      });
  
    } else if (modalType === "presupuesto") {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Presupuesto Nº: ${presupuestoNumero}`, 10, 45);
  
      autoTable(doc, {
        startY: 55,
        theme: "grid",
        headStyles: { fillColor: [46, 204, 113], textColor: 255 }, // Verde elegante
        styles: { fontSize: 10, cellPadding: 3 },
        head: [["Descripción", "Unidades", "Precio ($)", "Total ($)"]],
        body: presupuesto.map((row) => [row.descripcion, row.unidades, `$${row.precio}`, `$${row.total}`]),
        foot: [
          ["", "", "Subtotal ($)", `$${subtotal.toFixed(2)}`],
          ["", "", "IVA (21%) ($)", `$${iva.toFixed(2)}`],
          ["", "", "Total General ($)", `$${totalPresupuesto.toFixed(2)}`],
        ],
        footStyles: { fillColor: [190, 190, 190], fontStyle: "bold" },
      });
  
      setPresupuestoNumero(presupuestoNumero + 1);
    }
  
    // Pie de página
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Documento generado por FAUSTINA ALGARROBOS", 10, 290);
  
    doc.save(`${modalType}.pdf`);
  };
  const removeRemitoRow = (index) => {
    setRemito((prevRemito) => prevRemito.filter((_, i) => i !== index));
  };
  
  const removePresupuestoRow = (index) => {
    setPresupuesto((prevPresupuesto) => prevPresupuesto.filter((_, i) => i !== index));
  };
  return (
    <div className="home flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      
  <h1 className="text-3xl font-bold mb-6 text-gray-800">Generar Documentos</h1>

  <div className="flex gap-4">
    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" onClick={() => openModal("recibo")}>RECIBO</button>
    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition" onClick={() => openModal("presupuesto")}>PRESUPUESTO</button>
    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition" onClick={() => openModal("remito")}>REMITO</button>
  </div>

  <Modal 
    isOpen={modalType !== null} 
    onRequestClose={closeModal} 
    className="fixed inset-0 flex items-center justify-center p-4"
  >
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">{modalType?.toUpperCase() || ""}</h2>

      {modalType === "recibo" && (
        <div className="flex flex-col gap-4">
          <input className="p-2 border rounded-md" name="reciboDe" placeholder="Recibí de" onChange={handleReciboChange} />
          <input className="p-2 border rounded-md" name="suma" placeholder="La suma de" onChange={handleReciboChange} />
          <input className="p-2 border rounded-md" name="concepto" placeholder="Por concepto de" onChange={handleReciboChange} />
        </div>
      )}

      {modalType === "remito" && (
        <div className="flex flex-col gap-4">
          {remito.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 p-2 border rounded-md">
            <input className="p-2 border rounded-md" name="articulo" placeholder="Ingrese el artículo" value={item.articulo} onChange={(e) => handleRemitoChange(index, e)} />
            <input className="p-2 border rounded-md" name="cantidad" type="number" placeholder="Ingrese la cantidad" value={item.cantidad} onChange={(e) => handleRemitoChange(index, e)} />
            <input className="p-2 border rounded-md" name="descripcion" placeholder="Ingrese la descripción" value={item.descripcion} onChange={(e) => handleRemitoChange(index, e)} />
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition" onClick={() => removeRemitoRow(index)}>Eliminar</button>
          </div>
        ))}
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" onClick={addRemitoRow}>Agregar Fila</button>
        </div>
      )}

      {modalType === "presupuesto" && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-gray-800">Presupuesto Nº {presupuestoNumero}</h3>
          <p className="text-gray-600">{empresa.nombre}</p>
          <p className="text-gray-600">CUIT: {empresa.cuit}</p>
          <p className="text-gray-600">Dirección: {empresa.direccion}</p>
          <p className="text-gray-600">Fecha: {fechaActual}</p>

          {presupuesto.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 p-2 border rounded-md">
            <input 
              className="p-2 border rounded-md" 
              name="descripcion" 
              placeholder="Ingrese la descripción del producto/servicio" 
              value={item.descripcion || ""} 
              onChange={(e) => handlePresupuestoChange(index, e)} 
            />
            
            <input 
              className="p-2 border rounded-md" 
              name="unidades" 
              type="number" 
              placeholder="Ingrese la cantidad" 
              value={item.unidades || ""} 
              onChange={(e) => handlePresupuestoChange(index, e)} 
            />
            
            <input 
              className="p-2 border rounded-md" 
              name="precio" 
              type="number" 
              placeholder="Ingrese el precio unitario" 
              value={item.precio || ""} 
              onChange={(e) => handlePresupuestoChange(index, e)} 
            />
            
            <span className="text-gray-800">Total: ${item.total ? item.total.toFixed(2) : "0.00"}</span>
            
            <button 
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition" 
              onClick={() => removePresupuestoRow(index)}
            >
              Eliminar
            </button>
          </div>
        ))}
          <h3 className="text-lg font-semibold text-gray-800">Subtotal: ${subtotal.toFixed(2)}</h3>
          <h3 className="text-lg font-semibold text-gray-800">IVA (21%): ${iva.toFixed(2)}</h3>
          <h3 className="text-lg font-bold text-gray-800">Total General: ${totalPresupuesto.toFixed(2)}</h3>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" onClick={addPresupuestoRow}>Agregar Fila</button>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition" onClick={closeModal}>Cerrar</button>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition" onClick={generatePDF}>Generar PDF</button>
      </div>
    </div>
  </Modal>
</div>

  );
}
