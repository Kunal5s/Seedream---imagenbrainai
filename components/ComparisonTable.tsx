import React from 'react';
import CheckIcon from './ui/CheckIcon';

const features = [
  { name: 'Generation Speed', old: 'Standard', new: 'Up to 2x Faster', highlight: true },
  { name: 'Max Quality', old: 'HD (1080p)', new: '4K, 8K & Beyond', highlight: true },
  { name: 'Artistic Styles', old: '10+ Basic Styles', new: '20+ Advanced Styles & Effects', highlight: true },
  { name: 'Image Editing', old: 'Not Available', new: 'Integrated AI Inpainting & Outpainting', highlight: true },
  { name: 'Multi-Reference Images', old: 'Not Supported', new: 'Up to 5 Reference Images', highlight: true },
  { name: 'Negative Prompts', old: 'Basic Exclusion', new: 'Advanced Control & Weighting', highlight: true },
  { name: 'Knowledge-Based AI', old: 'Standard Model', new: 'Context-Aware Generation', highlight: true },
  { name: 'API Access', old: 'Not Available', new: 'Full Developer API Access', highlight: true },
];

const ComparisonTable: React.FC = () => {
  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          The 4.0 Evolution
        </span>
      </h2>
      <div className="max-w-4xl mx-auto bg-gray-900 border border-gray-700/50 rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-3 text-center font-bold text-lg">
          <div className="p-4">Feature</div>
          <div className="p-4 bg-gray-800/50">Old Version</div>
          <div className="p-4 bg-green-500/20">ImagenBrainAi 4.0</div>
        </div>
        {features.map((feature, index) => (
          <div key={index} className="grid grid-cols-3 text-center border-t border-gray-700/50 items-center">
            <div className="p-4 text-left font-semibold">{feature.name}</div>
            <div className="p-4 bg-gray-800/50 text-gray-400">{feature.old}</div>
            <div className={`p-4 bg-green-500/20 font-semibold ${feature.highlight ? 'text-green-300' : ''}`}>
              <div className="flex items-center justify-center">
                {feature.highlight && <CheckIcon className="h-5 w-5 mr-2 hidden sm:inline" />}
                <span>{feature.new}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ComparisonTable;