// src/utils/pdfUtils.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import PrescripcionParaImprimir from '../Components/Prescripciones/PrescripcionParaImprimir';

export const generarPdfPrescripcion = async (prescripcion, paciente, opticaInfo, optico) => {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const printElement = document.getElementById('elemento-para-imprimir-prescripcion');

  if (!printElement) {
    alert("No se encontró el contenedor de impresión en el DOM.");
    return;
  }

  printElement.innerHTML = ''; // limpiamos el contenido anterior
  printElement.style.visibility = 'visible'; // nos aseguramos que sea visible para html2canvas
  printElement.style.position = 'fixed'; // y se posicione correctamente para el render

  const root = createRoot(printElement);

  await new Promise((resolve) => {
    root.render(
      <React.StrictMode>
        <PrescripcionParaImprimir
          prescripcion={prescripcion}
          paciente={paciente}
          opticaInfo={opticaInfo}
          optico={optico}
        />
      </React.StrictMode>
    );
    setTimeout(() => {
      console.log("✔ Render terminado");
      resolve();
    }, 1200); // suficiente para renderizar
  });

  try {
    const canvas = await html2canvas(printElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: true,
      windowWidth: printElement.scrollWidth,
      windowHeight: printElement.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);

    const ratio = imgProps.width / imgProps.height;
    let imgRenderWidth = pdfWidth - 20;
    let imgRenderHeight = imgRenderWidth / ratio;

    if (imgRenderHeight > pdfHeight - 20) {
      imgRenderHeight = pdfHeight - 20;
      imgRenderWidth = imgRenderHeight * ratio;
    }

    const xOffset = (pdfWidth - imgRenderWidth) / 2;
    const yOffset = 10;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgRenderWidth, imgRenderHeight);

    pdf.autoPrint();
    window.open(pdf.output('bloburl'), '_blank');

  } catch (error) {
    console.error("❌ Error al generar PDF:", error);
    alert("Error al generar el PDF. Revisa consola.");
  } finally {
    root.unmount();
    printElement.innerHTML = '';
    printElement.style.visibility = 'hidden';
  }
};
