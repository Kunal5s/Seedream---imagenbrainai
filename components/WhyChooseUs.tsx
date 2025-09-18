import React from 'react';

const QualityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M4 11a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1z" />
    </svg>
);
const CreativityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);
const SpeedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const reasons = [
  {
    icon: <QualityIcon />,
    title: "Unmatched Quality & Realism",
    description: "Generate breathtaking images in stunning 4K, 8K, and beyond. Our AI is trained to produce hyper-realistic textures, lighting, and details that bring your concepts to life with unparalleled clarity."
  },
  {
    icon: <CreativityIcon />,
    title: "Limitless Creative Control",
    description: "Don't just generate, create. With over 20 options for styles, moods, lighting, and colors, plus advanced features like negative prompts and seed control, you have the ultimate creative toolkit at your fingertips."
  },
  {
    icon: <SpeedIcon />,
    title: "Intuitive & Blazing Fast",
    description: "Our streamlined interface makes image generation effortless for both beginners and pros. Get from idea to finished masterpiece in seconds, not hours, thanks to our optimized, high-speed generation engine."
  }
];

const WhyChooseUs: React.FC = () => {
  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          Why Choose ImagenBrainAi 4.0?
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reasons.map((reason, index) => (
          <div key={index} className="bg-gray-900 border border-green-400/20 rounded-lg p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-green-400/10 flex flex-col items-center">
            <div className="flex justify-center mb-5 text-green-300">
              {reason.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3">{reason.title}</h3>
            <p className="text-gray-400 leading-relaxed">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;