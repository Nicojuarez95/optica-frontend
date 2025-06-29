// src/Components/Prescripciones/PrescripcionParaImprimir.jsx
import React from 'react';
import { formatDisplayDateFromString } from '../../Utils/dateUtils';

const SeccionPrescripcionImprimible = ({ prescripcion, paciente, infoEncabezadoPDF, opticoFirmantePDF, tipoCopia }) => {
  const fechaFormateada = formatDisplayDateFromString(prescripcion.fecha);
  const fechaPrometida = formatDisplayDateFromString(prescripcion.fechaPrometida);
  const subtotal = parseFloat(prescripcion.subtotal) || 0;
  const descuentoPorcentaje = parseFloat(prescripcion.descuentoPorcentaje) || 0;
  const montoDescuento = parseFloat(prescripcion.montoDescuento) ?? ((subtotal * descuentoPorcentaje) / 100);
  const totalNeto = parseFloat(prescripcion.totalNeto) ?? (subtotal - montoDescuento);
  const montoEntregado = parseFloat(prescripcion.montoEntregado) || 0;
  const saldoPendiente = parseFloat(prescripcion.saldoPendiente) ?? (totalNeto - montoEntregado);
console.log("Renderizando PrescripcionParaImprimir", { paciente, prescripcion });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10mm', backgroundColor: '#fff', color: '#000' }}>
      <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '10pt' }}>{tipoCopia}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px', paddingBottom: '2px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '16pt', fontWeight: 'bold', color: '#333' }}>{paciente?.nombreCompleto}</h2>
        </div>
        <div style={{ textAlign: 'right', fontSize: '9pt', flexShrink: 0, paddingLeft: '10px' }}>
          <p style={{ margin: 0, marginBottom: '2px' }}><strong>RECETA N°:</strong> {prescripcion.numeroComprobante || 'S/N'}</p>
          <p style={{ margin: 0 }}><strong>Fecha:</strong> {fechaFormateada}</p>
          <p style={{ margin: 0 }}><strong>Fecha Prometida:</strong> {prescripcion.observaciones}</p>
          <p style={{ margin: 0 }}><strong>Optico:</strong> {opticoFirmantePDF?.nombreCompleto || 'SIN NOMBRE'}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11pt', color: '#111', marginBottom: '5px' }}>
        {tipoCopia === 'DUPLICADO ÓPTICA' ? 'PRESCRIPCIÓN ÓPTICA' : 'COMPROBANTE PACIENTE'}
      </div>

      {tipoCopia === 'DUPLICADO ÓPTICA' && (
        <>
          {prescripcion.diagnostico && <p style={{ fontSize: '10pt', margin: '5px 0' }}><strong>Diagnóstico:</strong> {prescripcion.diagnostico}</p>}

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '10px' }}>
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
                <td rowSpan={2} style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>{prescripcion.adicion || '-'}</td>
                <td rowSpan={2} style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>{prescripcion.dp || '-'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #aaa', padding: '4px', fontWeight: 'bold', textAlign: 'center' }}>OI</td>
                <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>{prescripcion.graduacionOI_Esfera || '-'}</td>
                <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>{prescripcion.graduacionOI_Cilindro || '-'}</td>
                <td style={{ border: '1px solid #aaa', padding: '4px', textAlign: 'center' }}>{prescripcion.graduacionOI_Eje || '-'}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {(subtotal > 0) && (
        <div style={{ marginTop: 'auto', fontSize: '9pt' }}>
          <table style={{ width: '100%', fontSize: '9pt' }}>
            <tbody>
              <tr><td style={{ padding: '2px 0' }}>Subtotal:</td><td style={{ textAlign: 'right', padding: '2px 0' }}>$ {subtotal.toFixed(2)}</td></tr>
              <tr><td style={{ padding: '2px 0' }}>Descuento ({descuentoPorcentaje}%):</td><td style={{ textAlign: 'right', padding: '2px 0' }}>$ -{montoDescuento.toFixed(2)}</td></tr>
              <tr style={{ fontWeight: 'bold', fontSize: '10pt' }}><td style={{ padding: '4px 0' }}>TOTAL NETO:</td><td style={{ textAlign: 'right', padding: '4px 0' }}>$ {totalNeto.toFixed(2)}</td></tr>
              <tr><td style={{ padding: '2px 0' }}>Entregado ({prescripcion.metodoPagoEntregado || 'N/A'}):</td><td style={{ textAlign: 'right', padding: '2px 0' }}>$ {montoEntregado.toFixed(2)}</td></tr>
              <tr style={{ fontWeight: 'bold', fontSize: '10pt' }}><td style={{ padding: '2px 0' }}>SALDO PENDIENTE:</td><td style={{ textAlign: 'right', padding: '2px 0' }}>$ {saldoPendiente.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


const PrescripcionParaImprimir = React.forwardRef(({ prescripcion, paciente, opticaInfo, optico }, ref) => {
  if (!prescripcion || !paciente || !opticaInfo || !optico) {
    return <p ref={ref} style={{ color: 'red' }}>Faltan datos esenciales para la prescripción.</p>;
  }

  const contenedorEstiloBase = {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const estiloCopiaPaciente = {
    ...contenedorEstiloBase,
    height: '8cm'
  };

  const estiloCopiaOptica = {
    ...contenedorEstiloBase,
    height: '20cm'
  };

  return (
    <div ref={ref} className="print-content-wrapper-for-pdf" style={{ fontFamily: 'Arial, sans-serif', color: 'black', background: 'white' }}>
      <div style={estiloCopiaPaciente}>
        <SeccionPrescripcionImprimible
          prescripcion={prescripcion}
          paciente={paciente}
          infoEncabezadoPDF={opticaInfo}
          opticoFirmantePDF={optico}
          tipoCopia="ORIGINAL PACIENTE"
        />
      </div>

      <div className="tear-off-line-printable" style={{ textAlign: 'center', padding: '1mm 0', fontSize: '8pt', color: '#555', pageBreakAfter: 'always' }}>
        - - - - - - - - - - - - - - - - - CORTAR AQUÍ - - - - - - - - - - - - - - - - -
      </div>

      <div style={estiloCopiaOptica}>
        <SeccionPrescripcionImprimible
          prescripcion={prescripcion}
          paciente={paciente}
          infoEncabezadoPDF={opticaInfo}
          opticoFirmantePDF={optico}
          tipoCopia="DUPLICADO ÓPTICA"
        />
      </div>
    </div>
  );
});

export default PrescripcionParaImprimir;
