import React from 'react';
import { formatDisplayDateFromString } from '../../Utils/dateUtils';

// Componente interno para una sección de la prescripción (Copia Paciente / Copia Óptica)
const SeccionPrescripcionImprimible = ({ prescripcion, paciente, infoEncabezadoPDF, opticoFirmantePDF, tipoCopia }) => {
    const fechaFormateada = formatDisplayDateFromString(prescripcion.fecha);
    // Asegurarse de que los datos financieros se muestren correctamente
    const subtotal = parseFloat(prescripcion.subtotal) || 0;
    const descuentoPorcentaje = parseFloat(prescripcion.descuentoPorcentaje) || 0;
    const montoDescuento = parseFloat(prescripcion.montoDescuento) ?? ((subtotal * descuentoPorcentaje) / 100);
    const totalNeto = parseFloat(prescripcion.totalNeto) ?? (subtotal - montoDescuento);
    const montoEntregado = parseFloat(prescripcion.montoEntregado) || 0;
    const saldoPendiente = parseFloat(prescripcion.saldoPendiente) ?? (totalNeto - montoEntregado);

    return (
        <div className="prescription-section-printable" style={{ pageBreakInside: 'avoid', border: '1px solid #888', padding: '15mm 10mm', marginBottom: '10px', backgroundColor: '#fff', color: '#000' }}>
            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '10pt', marginBottom: '15px' }}>{tipoCopia}</div>
            
            {/* Encabezado MODIFICADO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <div>
                    {/* Nombre completo del óptico como encabezado principal */}
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '18pt', fontWeight: 'bold', color: '#333' }}>
                        {infoEncabezadoPDF.nombreCompleto}
                    </h2>
                    {/* Si tienes la matrícula y quieres mostrarla aquí */}
                    {infoEncabezadoPDF.matricula && <p style={{ margin: '0', fontSize: '9pt', color: '#555' }}>Mat. {infoEncabezadoPDF.matricula}</p>}
                </div>
                <div style={{ textAlign: 'right', fontSize: '9pt' }}>
                    <p style={{ margin: '0 0 2px 0' }}><strong>RECETA N°:</strong> {prescripcion.numeroComprobante || 'S/N'}</p>
                    <p style={{ margin: '0' }}><strong>Fecha:</strong> {fechaFormateada}</p>
                </div>
            </div>

            {/* Información del Paciente */}
            <div style={{ marginBottom: '12px', fontSize: '10pt' }}>
                <p style={{ margin: '2px 0' }}><strong>Paciente:</strong> {paciente.nombreCompleto || 'N/A'}</p>
                {paciente.dni && <p style={{ margin: '2px 0' }}><strong>DNI/ID:</strong> {paciente.dni}</p>}
                {/* No mostramos el teléfono del paciente aquí según tu imagen de ejemplo */}
            </div>

            <div style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '6px 0', margin: '12px 0', textAlign: 'center', fontWeight: 'bold', fontSize: '12pt', color: '#111' }}>
                PRESCRIPCIÓN ÓPTICA
            </div>

            {/* Tabla de Graduación */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '12px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', color: '#333' }}>
                        <th style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>OJO</th>
                        <th style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>ESFÉRICO</th>
                        <th style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>CILÍNDRICO</th>
                        <th style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>EJE</th>
                        <th style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>ADICIÓN</th>
                        <th style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>DP</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #aaa', padding: '4px', fontWeight: 'bold', textAlign: 'center' }}>OD</td>
                        <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>{prescripcion.graduacionOD_Esfera || '-'}</td>
                        <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>{prescripcion.graduacionOD_Cilindro || '-'}</td>
                        <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>{prescripcion.graduacionOD_Eje || '-'}</td>
                        <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }} rowSpan={prescripcion.adicion ? 2 : 1}>{prescripcion.adicion || '-'}</td>
                        <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }} rowSpan={prescripcion.dp ? 2 : 1}>{prescripcion.dp || '-'}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #aaa', padding: '4px', fontWeight: 'bold', textAlign: 'center' }}>OI</td>
                        <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>{prescripcion.graduacionOI_Esfera || '-'}</td>
                        <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>{prescripcion.graduacionOI_Cilindro || '-'}</td>
                        <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>{prescripcion.graduacionOI_Eje || '-'}</td>
                    </tr>
                </tbody>
            </table>
            
            {prescripcion.diagnostico && <p style={{ fontSize: '10pt', margin: '5px 0 8px 0' }}><strong>Diagnóstico:</strong> {prescripcion.diagnostico}</p>}
            {prescripcion.descripcionConceptos && <p style={{ fontSize: '10pt', margin: '5px 0 8px 0' }}><strong>Conceptos:</strong> {prescripcion.descripcionConceptos}</p>}

            {/* Detalles Financieros */}
            {(prescripcion.subtotal !== undefined && prescripcion.subtotal > 0) && (
                <div style={{ marginTop: '15px', borderTop: '1px solid #ddd', paddingTop: '10px', fontSize: '9pt' }}>
                    <table style={{ width: '100%', fontSize: '9pt' }}>
                        <tbody>
                            <tr><td style={{padding: '2px 0'}}>Subtotal:</td><td style={{textAlign: 'right', padding: '2px 0'}}>$ {subtotal.toFixed(2)}</td></tr>
                            <tr><td style={{padding: '2px 0'}}>Descuento ({descuentoPorcentaje}%):</td><td style={{textAlign: 'right', padding: '2px 0'}}>$ -{montoDescuento.toFixed(2)}</td></tr>
                            <tr style={{fontWeight: 'bold', fontSize: '10pt', borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc'}}><td style={{padding: '4px 0'}}>TOTAL NETO:</td><td style={{textAlign: 'right', padding: '4px 0'}}>$ {totalNeto.toFixed(2)}</td></tr>
                            <tr><td style={{padding: '2px 0'}}>Entregado ({prescripcion.metodoPagoEntregado || 'N/A'}):</td><td style={{textAlign: 'right', padding: '2px 0'}}>$ {montoEntregado.toFixed(2)}</td></tr>
                            <tr style={{fontWeight: 'bold', fontSize: '10pt'}}><td style={{padding: '2px 0'}}>SALDO PENDIENTE:</td><td style={{textAlign: 'right', padding: '2px 0'}}>$ {saldoPendiente.toFixed(2)}</td></tr>
                        </tbody>
                    </table>
                </div>
            )}

            {prescripcion.observaciones && <p style={{ fontSize: '9pt', margin: '10px 0 15px 0', fontStyle: 'italic' }}><strong>Observaciones:</strong> {prescripcion.observaciones}</p>}
            
            {/* Pie con Firma MODIFICADO */}
            <div style={{ marginTop: '25mm', paddingTop: '5px', fontSize: '9pt', textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #000', width: '200px', margin: '0 auto 5px auto', paddingTop: '3px' }}>Firma y Sello del Profesional</div>
                <div>{prescripcion.optometristaResponsable || opticoFirmantePDF.nombreCompleto}</div> {/* Nombre completo */}
                {opticoFirmantePDF.matricula && <div>Mat. {opticoFirmantePDF.matricula}</div>}
            </div>
        </div>
    );
};

const PrescripcionParaImprimir = React.forwardRef(({ prescripcion, paciente, opticaInfo, optico }, ref) => {
    // 'opticaInfo' y 'optico' aquí serán el mismo objeto 'opticoParaImpresion' de DetallePaciente.jsx
    if (!prescripcion || !paciente || !opticaInfo || !optico) {
        return <p ref={ref} style={{color: 'red'}}>Faltan datos esenciales para la prescripción.</p>;
    }

    return (
        <div ref={ref} className="print-content-wrapper-for-pdf" style={{ fontFamily: 'Arial, sans-serif', color: 'black', background: 'white' }}>
            <SeccionPrescripcionImprimible prescripcion={prescripcion} paciente={paciente} infoEncabezadoPDF={opticaInfo} opticoFirmantePDF={optico} tipoCopia="ORIGINAL PACIENTE" />
            <div className="tear-off-line-printable" style={{ textAlign: 'center', padding: '5mm 0', borderTop: '1px dashed #999', margin: '0', fontSize:'8pt', color: '#555', pageBreakAfter: 'always' }}>
                - - - - - - - - - - - - - - - - - - - - - - - - CORTAR AQUÍ - - - - - - - - - - - - - - - - - - - - - - - -
            </div>
            <SeccionPrescripcionImprimible prescripcion={prescripcion} paciente={paciente} infoEncabezadoPDF={opticaInfo} opticoFirmantePDF={optico} tipoCopia="DUPLICADO ÓPTICA" />
        </div>
    );
});

export default PrescripcionParaImprimir;