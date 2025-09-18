import React, { useState } from 'react';
import ImageGenerator from './ImageGenerator';
import ImageEditor from './ImageEditor';

const GeneratorSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');

  const tabs = [
    { id: 'generate', label: 'Generate Image' },
    { id: 'edit', label: 'Edit Image' },
  ];

  return (
    <div id="generator-suite" className="bg-black/30 border border-green-400/20 rounded-lg shadow-2xl shadow-green-500/20">
      <div className="px-6 border-b border-green-400/20 flex items-center">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'generate' | 'edit')}
            className={`py-3 px-4 font-semibold text-lg transition-colors duration-200 focus:outline-none ${
              activeTab === tab.id
                ? 'text-green-300 border-b-2 border-green-300'
                : 'text-gray-500 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 md:p-8">
        {activeTab === 'generate' && <ImageGenerator />}
        {activeTab === 'edit' && <ImageEditor />}
      </div>
    </div>
  );
};

export default GeneratorSuite;
