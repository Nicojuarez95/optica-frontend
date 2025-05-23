// src/utils/pdfUtils.js
import React from 'react'; // Necesario si PrescripcionParaImprimir usa JSX directamente aquí
import { createRoot } from 'react-dom/client';
import PrescripcionParaImprimir from '../Components/Prescripciones/PrescripcionParaImprimir'; // Ajusta la ruta

export const generarPdfPrescripcion = async (prescripcion, paciente, opticaInfo, optico) => {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    const printNodeId = 'elemento-para-imprimir-prescripcion';
    let printElement = document.getElementById(printNodeId);

    if (!printElement) {
        console.error(`Elemento con ID '${printNodeId}' no encontrado en el DOM.`);
        alert("Error de configuración de impresión. Contacte al soporte.");
        return;
    }

    const originalContent = printElement.innerHTML;
    printElement.innerHTML = ''; 

    const root = createRoot(printElement);
    await new Promise(resolve => {
        root.render(
            <React.StrictMode>
                <PrescripcionParaImprimir
                    prescripcion={prescripcion}
                    paciente={paciente}
                    opticaInfo={optico} // Pasas el objeto del óptico aquí
                    optico={optico}     // Y aquí también para la firma
                />
            </React.StrictMode>
        );
        setTimeout(resolve, 300); // Dar tiempo a React para renderizar
    });

    try {
        const canvas = await html2canvas(printElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false, // Puedes ponerlo en true para depurar html2canvas
            windowWidth: printElement.scrollWidth,
            windowHeight: printElement.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

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
        const yOffset = 10; // Margen superior

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgRenderWidth, imgRenderHeight);

        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');

    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert("Hubo un error al generar el PDF. Revise la consola para más detalles.");
    } finally {
        root.unmount();
        printElement.innerHTML = originalContent; 
    }
};

// Puedes añadir más funciones de utilidad relacionadas con PDF aquí si es necesario