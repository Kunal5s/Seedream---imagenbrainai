import React, { useState } from 'react';
import MetaTags from '../components/MetaTags';
import { faqData } from '../data/faqData';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronDownIcon from '../components/ui/ChevronDownIcon';

const FaqPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0); // Start with the first item open

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <MetaTags
        title="FAQ | Seedream ImagenBrainAi 4.0"
        description="Find answers to frequently asked questions about Seedream ImagenBrainAi 4.0, including usage rights, plans, features, and how to get started."
        canonicalPath="/faq"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                Frequently Asked Questions
                </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us directly.
            </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="bg-gray-900/50 border border-green-400/10 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex justify-between items-center text-left p-6 cursor-pointer focus:outline-none focus:bg-green-500/10 transition-colors"
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h2 className="text-lg font-semibold text-green-300">{item.question}</h2>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="w-6 h-6 text-green-300 transition-transform" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: 'auto' },
                      collapsed: { opacity: 0, height: 0 }
                    }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                    role="region"
                  >
                    <div className="p-6 pt-0 text-gray-300 leading-relaxed">
                      <p>{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FaqPage;
