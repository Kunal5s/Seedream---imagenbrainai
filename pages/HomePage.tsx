import React from 'react';
import GeneratorSuite from '../components/GeneratorSuite';
import FeatureGrid from '../components/FeatureGrid';
import WhyChooseUs from '../components/WhyChooseUs';
import MetaTags from '../components/MetaTags';
import PricingSection from '../components/PricingSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import ComparisonTable from '../components/ComparisonTable';
import CallToAction from '../components/CallToAction';
import ExploreUseCases from '../components/ExploreUseCases';

const HomePage: React.FC = () => {
  return (
    <>
      <MetaTags 
        title="Seedream ImagenBrainAi 4.0 - AI Image Generator"
        description="Generate and edit breathtaking, ultra-realistic 4K images with Seedream ImagenBrainAi 4.0. Explore limitless creativity with advanced AI, diverse styles, and an intuitive interface."
        canonicalPath="/"
      />
      <div className="space-y-24">
        <section className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
              Transform Imagination into Reality
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Welcome to Seedream ImagenBrainAi 4.0 – your next-generation AI image generator built for limitless creativity. Create and edit ultra-realistic, 4K quality visuals in seconds.
          </p>
        </section>

        <GeneratorSuite />
        
        <WhyChooseUs />

        <HowItWorks />
        
        <FeatureGrid />

        <ExploreUseCases />

        <Testimonials />
        
        <ComparisonTable />

        <PricingSection />
        
        <CallToAction />
      </div>
    </>
  );
};

export default HomePage;