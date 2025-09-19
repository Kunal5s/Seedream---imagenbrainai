import React from 'react';
import { CREATIVE_STYLES, MOODS, LIGHTING_STYLES, COLORS } from '../constants';

const controls = [
  {
    name: 'Artistic Styles',
    count: `${CREATIVE_STYLES.length}+`,
    examples: CREATIVE_STYLES.slice(0, 4).join(', ') + ', and more...',
  },
  {
    name: 'Emotional Moods',
    count: `${MOODS.length - 1}+`, // Exclude 'Neutral'
    examples: MOODS.slice(1, 5).join(', ') + ', and more...',
  },
  {
    name: 'Lighting Scenarios',
    count: `${LIGHTING_STYLES.length - 1}+`, // Exclude 'Neutral'
    examples: LIGHTING_STYLES.slice(1, 5).join(', ') + ', and more...',
  },
  {
    name: 'Color Palettes',
    count: `${COLORS.length - 1}+`, // Exclude 'Default'
    examples: COLORS.slice(1, 5).join(', ') + ', and more...',
  },
];

const ComparisonTable: React.FC = () => {
  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          The 4.0 Evolution
        </span>
      </h2>
       <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">A universe of creative control at your fingertips. See the massive expansion of options available in our latest update.</p>

      <div className="max-w-5xl mx-auto bg-gray-900 border border-gray-700/50 rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 text-center font-bold text-lg">
          <div className="p-4">Control Category</div>
          <div className="p-4 bg-gray-800/50">Options Available</div>
          <div className="p-4 bg-green-500/20 hidden md:block">Includes Styles Like...</div>
        </div>
        {controls.map((control, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 text-center border-t border-gray-700/50 items-center">
            <div className="p-4 text-left font-semibold text-base">{control.name}</div>
            <div className="p-4 bg-gray-800/50 text-3xl font-bold text-green-300">
              {control.count}
            </div>
            <div className="p-4 bg-green-500/20 text-sm text-gray-300 text-left">
              {control.examples}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ComparisonTable;
