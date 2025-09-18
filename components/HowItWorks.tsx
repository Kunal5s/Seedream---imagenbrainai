import React from 'react';
import PencilIcon from './ui/PencilIcon';
import PaletteIcon from './ui/PaletteIcon';
import DownloadIcon from './ui/DownloadIcon';

const steps = [
  {
    icon: <PencilIcon className="h-12 w-12" />,
    title: "Step 1: Enter Your Prompt",
    description: "Describe your vision in detail. The more specific you are, the better the AI can understand and generate your unique image."
  },
  {
    icon: <PaletteIcon className="h-12 w-12" />,
    title: "Step 2: Customize Your Style",
    description: "Fine-tune your creation by choosing from over 20 styles, moods, lighting effects, and color schemes to match your aesthetic."
  },
  {
    icon: <DownloadIcon className="h-12 w-12" />,
    title: "Step 3: Generate & Download",
    description: "Click 'Generate' to watch your idea come to life in seconds. Once you're happy with the result, download it in high resolution."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          How It Works in 3 Simple Steps
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {steps.map((step, index) => (
          <div key={index} className="bg-gray-900 border border-green-400/10 rounded-lg p-8 flex flex-col items-center transform hover:-translate-y-2 transition-transform duration-300 shadow-lg">
            <div className="text-green-300 mb-5 p-4 bg-gray-800 rounded-full">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3">{step.title}</h3>
            <p className="text-gray-400 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;