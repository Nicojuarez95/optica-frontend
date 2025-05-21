import React from 'react';

const Spinner = ({ size = 'h-12 w-12', color = 'border-indigo-500' }) => {
    return (
        <div className="flex justify-center items-center">
            <div 
                className={`animate-spin rounded-full border-t-2 border-b-2 ${color} ${size}`}
            ></div>
        </div>
    );
};

export default Spinner;
