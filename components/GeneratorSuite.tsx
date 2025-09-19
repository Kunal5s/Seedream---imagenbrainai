import React from 'react';
import ImageGenerator from './ImageGenerator';

const GeneratorSuite: React.FC = () => {
  return (
    <div id="generator-suite" className="bg-black/30 border border-green-400/20 rounded-lg shadow-2xl shadow-green-500/20">
      <div className="px-6 border-b border-green-400/20 flex items-center">
        {/* Static Tab for Generate Image */}
        <div className="py-3 px-4 font-semibold text-lg text-green-300 border-b-2 border-green-300">
          Generate Image
        </div>
      </div>
      <div className="p-4 md:p-8">
        <ImageGenerator />
      </div>
    </div>
  );
};

export default GeneratorSuite;