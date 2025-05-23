export const formatDisplayDateFromString = (dateStringValue) => {
    if (!dateStringValue) return 'N/A';

    // Si ya es un string en formato yyyy-mm-dd (del input type="date")
    if (typeof dateStringValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStringValue)) {
        const [year, month, day] = dateStringValue.split('-');
        return `${day}/${month}/${year}`;
    }

    // Si es un string ISO completo (ej. "2025-05-23T00:00:00.000Z")
    // o un objeto Date, intentar extraer la fecha UTC para evitar desfase por timezone local al mostrar.
    try {
        const dateObj = new Date(dateStringValue); // Funciona para string ISO y objetos Date
        if (isNaN(dateObj.getTime())) {
            return 'Fecha Inválida';
        }
        // Usar getUTC... para mostrar la fecha tal como está en UTC (medianoche usualmente)
        const year = dateObj.getUTCFullYear();
        const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0'); // Meses son 0-indexados
        const day = dateObj.getUTCDate().toString().padStart(2, '0');
        return `${day}/${month}/${year}`;
    } catch (e) {
        console.warn("Error formateando fecha:", dateStringValue, e);
        return 'N/A'; 
    }
};
