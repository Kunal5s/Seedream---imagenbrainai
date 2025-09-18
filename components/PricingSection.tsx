import React from 'react';
import CheckIcon from './ui/CheckIcon';

const plans = [
  {
    name: 'Booster',
    price: '$20',
    for: 'For Power Users',
    link: 'https://polar.sh/checkout/polar_c_2a7mUKYAxfjjElQ52UTMYEZD1rW2n555dBLQ94fi3i1',
    features: [
      'Everything in Free',
      'Commercial License',
      'Priority Support',
    ],
  },
  {
    name: 'Premium',
    price: '$50',
    for: 'For Professionals',
    link: 'https://polar.sh/checkout/polar_c_18nlfCMhcd2LBH8tZhXQZdp0uyp5c8md5qbjY1SImkc',
    features: [
      'Everything in Booster',
      'Advanced API Access (Coming Soon)',
      'Custom Style Training (Coming Soon)',
    ],
  },
  {
    name: 'Professional',
    price: '$100',
    for: 'For Enterprises',
    link: 'https://polar.sh/checkout/polar_c_NWLVrrHiwA62Q4TpsYlZRS81V9Ghqu5aysrYm3Kjt7o',
    features: [
      'Everything in Premium',
      'Dedicated Account Manager',
      'Custom AI Models',
    ],
  },
];

const PricingSection: React.FC = () => {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                Flexible Plans for Every Creator
            </span>
        </h2>
        <p className="text-gray-400 mt-2">Choose the plan that's right for you.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div key={index} className="bg-gray-900 border border-gray-700/50 rounded-lg p-8 flex flex-col shadow-lg">
            <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
            <p className="text-5xl font-bold my-4 text-white">{plan.price}<span className="text-lg font-normal text-gray-400">/mo</span></p>
            <p className="text-gray-300">{plan.for}</p>
            <a href="/#/contact" className="text-green-300 hover:text-green-200 text-sm mt-1 mb-6">Contact for details</a>
            
            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-300 mt-1 flex-shrink-0" />
                  <span className="ml-3 text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href={plan.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-green-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/50 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
            >
              Purchase Plan
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;