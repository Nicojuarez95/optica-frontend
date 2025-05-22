import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function ModalControlado({ isOpen, onClose, title, children, titleIcon, size = 'max-w-2xl' }) {
  const modalOverlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={modalOverlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-200 ease-in-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${title?.replace(/\s+/g, '-').toLowerCase()}`} // Generar un ID único para el título
      aria-hidden={!isOpen}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl ${size} w-full mx-auto transform transition-all duration-200 ease-in-out ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            {titleIcon && <span className="mr-3">{titleIcon}</span>}
            <h3 id={`modal-title-${title?.replace(/\s+/g, '-').toLowerCase()}`} className="text-xl font-semibold text-gray-800 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            aria-label="Cerrar modal"
          >
            <X size={22} />
          </button>
        </div>
        
        {/* El contenido (children) se renderizará aquí. 
            El componente padre (GestionPacientesControlado) decidirá si pasar el formulario o no
            basado en si el modal debe tener contenido visible.
            O, el children (formulario) puede estar siempre presente pero su contenido interno se resetea.
            Para esta estrategia, el children (formulario) se pasará siempre, y su estado interno se manejará con una key.
        */}
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar-modal">
          {children}
        </div>
      </div>
    </div>
  );
}