import React from 'react';
import Button from './ui/Button';

const CallToAction: React.FC = () => {
  const handleClick = () => {
    const generator = document.querySelector('#generator-suite');
    if (generator) {
      generator.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="text-center bg-gray-900 border border-green-400/20 rounded-lg p-8 md:p-12 shadow-2xl shadow-green-500/20">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          Ready to Create Your Masterpiece?
        </span>
      </h2>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
        Start creating with Seedream ImagenBrainAi 4.0 today! Unleash your creativity and bring your wildest ideas to life with the power of AI.
      </p>
      <div className="max-w-xs mx-auto">
        <Button onClick={handleClick}>
          Start Generating Now
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;