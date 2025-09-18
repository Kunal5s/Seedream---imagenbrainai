import React, { useState } from 'react';
import { useCasesData } from '../data/useCasesData';

const ExploreUseCases: React.FC = () => {
  const [activeTab, setActiveTab] = useState(useCasesData[0].name);

  const getTabClass = (tabName: string) => {
    return `px-4 py-2 text-sm md:text-base font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 ${
      activeTab === tabName
        ? 'bg-green-400/20 text-green-200'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
    }`;
  };

  const activeCategory = useCasesData.find(cat => cat.name === activeTab);

  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          Unlock Your Creative Universe
        </span>
      </h2>
      
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
        {useCasesData.map(category => (
          <button key={category.name} onClick={() => setActiveTab(category.name)} className={getTabClass(category.name)}>
            {category.name}
          </button>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-green-400/10 rounded-lg p-4 md:p-8">
        {activeCategory && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCategory.items.map(item => (
               <div key={item.title} className="bg-gray-900 p-6 rounded-lg border border-transparent hover:border-green-400/30 transition-colors duration-300">
                <h4 className="text-lg font-bold text-green-300 mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreUseCases;