import React from 'react';
import CheckIcon from './ui/CheckIcon';
import { PLANS } from '../config/plans';

const PricingSection: React.FC = () => {
    const handleStartFree = () => {
        const generator = document.querySelector('#generator-suite');
        if (generator) {
          generator.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };

  return (
    <section id="pricing">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                Flexible Plans for Every Creator
            </span>
        </h2>
        <p className="text-gray-400 mt-2">Choose the plan that's right for you. Start for free.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {PLANS.map((plan, index) => (
          <div key={index} className={`bg-gray-900 border ${plan.isHighlighted ? 'border-green-400 shadow-green-400/20' : 'border-gray-700/50'} rounded-lg p-6 flex flex-col shadow-lg`}>
            <h3 className={`text-2xl font-semibold ${plan.isHighlighted ? 'text-green-300' : 'text-white'}`}>{plan.name}</h3>
            <p className="text-5xl font-bold my-4 text-white">{plan.price}<span className="text-lg font-normal text-gray-400">{plan.price !== '$0' ? '' : ''}</span></p>
            <p className="text-gray-300 mb-6">{plan.for}</p>
            
            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((feature: string, fIndex: number) => (
                <li key={fIndex} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                  <span className="ml-3 text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.link ? (
                 <a
                    href={plan.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-green-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/50 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  >
                    Purchase Plan
                  </a>
            ) : (
                <button
                    onClick={handleStartFree}
                    className="w-full text-center bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-green-500 hover:text-black hover:shadow-lg hover:shadow-green-400/50 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  >
                    Start For Free
                </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
