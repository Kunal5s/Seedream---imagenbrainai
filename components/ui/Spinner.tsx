
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-t-green-300 border-r-green-300/50 border-b-green-300/50 border-l-green-300/50 rounded-full animate-spin"></div>
        <p className="text-green-300 font-semibold">Creating Magic...</p>
    </div>
  );
};

export default Spinner;