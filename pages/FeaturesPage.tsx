import React from 'react';
import MetaTags from '../components/MetaTags';
import { featuresData } from '../data/featuresData';

const FeaturesPage: React.FC = () => {
  return (
    <>
      <MetaTags
        title="Features Deep Dive | Seedream ImagenBrainAi 4.0"
        description="Explore the complete suite of powerful features in Seedream ImagenBrainAi 4.0. From 4K cinematic scenes and realistic portraits to advanced AI editing tools for professionals."
        canonicalPath="/features"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                A Universe of Creative Tools
                </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
                Discover the advanced capabilities that make Seedream ImagenBrainAi 4.0 the ultimate platform for digital artists, designers, and creators.
            </p>
        </div>

        <div className="space-y-10">
          {featuresData.map((feature, index) => (
            <div key={index} className="bg-gray-900/50 border border-green-400/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-300 mb-3">{feature.title}</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FeaturesPage;