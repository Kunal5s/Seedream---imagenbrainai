import React from 'react';
import { motion } from 'framer-motion';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDom from 'react-router-dom';
import GeneratorSuite from '../components/GeneratorSuite';
import WhyChooseUs from '../components/WhyChooseUs';
import MetaTags from '../components/MetaTags';
import PricingSection from '../components/PricingSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';

// --- SVG Icons for components ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const PortraitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const WorldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.586-.586a2 2 0 012.828 0l2.172 2.172a2 2 0 002.828 0l.586-.586a2 2 0 012.828 0l.586.586M3 21h18" /></svg>
);
const CubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
);
const MegaphoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.332 1.688 18.658 1 19 1s.668.688.832 1.486c1.543 3.278 5.168 5.514 9.168 5.514H31c.342 0 .668.312.832.688 .164.376.164.824 0 1.2-.164.376-.49.688-.832.688H28.168c-4 0-7.625 2.236-9.168 5.514-.164.376-.49.812-.832.812s-.668-.436-.832-.812C16.59 13.936 12.965 11.7 8.965 11.7H7a4.001 4.001 0 01-1.564-.317z" /></svg>
);
const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);
const CodeBracketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
);
const LayersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);
const BrainCircuitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.604 18.924A2.992 2.992 0 018.03 16.06V8.94a4.982 4.982 0 013.97-4.882 4.983 4.983 0 016.03 4.882v7.12a2.992 2.992 0 01-1.574 2.864M9 12h6" /><path d="M12 21a9 9 0 100-18 9 9 0 000 18z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>
);
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);


const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8
    }
  }
};

// --- "Capabilities Grid" Component ---
const capabilities = [
  {
    icon: <PortraitIcon />,
    title: "Photorealistic Portraits & Headshots",
    description: "Elevate your creative workflow with the Seedream ImagenBrainAi AI portrait generator. Achieve hyper-realistic human portraits and studio-quality headshots with advanced prompt engineering. Our AI portrait optimization ensures professional digital art, perfect for creative projects or corporate branding."
  },
  {
    icon: <WorldIcon />,
    title: "Cinematic & Fantasy Worlds",
    description: "Bring your imagination to life. Our text-to-image generator creates stunning AI artwork, from mystical landscapes to AI-generated movie posters. The Seedream ImagenBrainAi cinematic poster creator is the ultimate tool for fantasy character creation and immersive digital art experiences."
  },
  {
    icon: <CubeIcon />,
    title: "Interactive Product Mockups",
    description: "Transform e-commerce with Seedream ImagenBrainAi for product mockups. Generate ultra-realistic 360 product views and photorealistic fashion product images. Create AI-driven luxury brand visuals and advertising graphics that captivate and convert."
  },
  {
    icon: <MegaphoneIcon />,
    title: "Marketing & Social Media Visuals",
    description: "Supercharge your digital advertising campaigns. Create AI art for social media branding, influencer marketing, and engaging content. Seedream ImagenBrainAi generates photorealistic marketing visuals that stop the scroll and drive results."
  },
  {
    icon: <BuildingIcon />,
    title: "Corporate Branding Solutions",
    description: "Define your brand's visual identity with AI. Use the Seedream ImagenBrainAi corporate office wallpaper generator for unique branding. Create AI-generated billboards and visuals that are perfectly aligned with your corporate identity."
  },
  {
    icon: <CodeBracketIcon />,
    title: "Architectural & Environment Design",
    description: "Visualize the impossible with our AI concept art generator. Create photorealistic environment designs and AI-generated mystical landscapes. Perfect for architectural visualization, game design, and surreal image creation, Seedream ImagenBrainAi composes scenes with incredible detail."
  }
];

const CapabilitiesGrid: React.FC = () => (
  <section>
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
            Our Next-Level AI Visual Solutions
          </span>
      </h2>
      <p className="text-gray-400 mt-2 max-w-3xl mx-auto">Explore the core capabilities of Seedream ImagenBrainAi, designed for professionals and creatives who demand quality, speed, and control.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {capabilities.map((item, index) => (
        <motion.div
          key={index}
          className="bg-gray-900 border border-green-400/20 rounded-lg p-8 transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-green-400/10 flex flex-col items-start"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.5 }}
          variants={cardVariants}
        >
          <div className="text-green-300 mb-5 p-3 bg-gray-800 rounded-lg">
            {item.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-100 mb-3">{item.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
        </motion.div>
      ))}
    </div>
  </section>
);


// --- "Advanced Comparison" Component ---
const comparisonData = [
    { feature: 'Image Quality', standard: 'HD / 4K with Artifacts', seedream: 'Ultra-HD 12K+ Photorealistic' },
    { feature: 'Product Visualization', standard: 'Static 2D Images', seedream: 'Interactive 360° Product Mockups' },
    { feature: 'Prompt Understanding', standard: 'Basic Keyword Matching', seedream: 'Advanced Prompt Engineering' },
    { feature: 'Commercial Use', standard: 'Generic Results', seedream: 'AI for Marketing & Corporate Branding' },
    { feature: 'Creative Workflow', standard: 'Single Generations', seedream: 'Batch Processing & API Integration' },
    { feature: 'Content Specialization', standard: 'General Purpose', seedream: 'Optimized for Portraits & Cinematic Art' },
];

const comparisonContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const comparisonItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const AdvancedComparison: React.FC = () => (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                The Seedream Advantage
            </span>
        </h2>
        <p className="text-gray-400 mt-2 max-w-3xl mx-auto">See how Seedream ImagenBrainAi provides a professional-grade experience that goes beyond standard AI generators.</p>
      </div>
      <motion.div 
        className="max-w-4xl mx-auto bg-gray-900 border border-gray-700/50 rounded-lg shadow-lg overflow-hidden"
        variants={comparisonContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="grid grid-cols-3 text-center font-bold text-lg bg-gray-800/50">
          <div className="p-4 hidden md:block">Feature</div>
          <div className="p-4 col-span-2 md:col-span-1">Standard Generators</div>
          <div className="p-4 bg-green-900/30">Seedream ImagenBrainAi</div>
        </div>
        {comparisonData.map((item, index) => (
          <motion.div key={index} className="grid grid-cols-3 items-center text-center border-t border-gray-700/50" variants={comparisonItemVariants}>
            <div className="p-4 font-semibold text-base text-left hidden md:block">{item.feature}</div>
            <div className="p-4 text-sm text-gray-400 col-span-2 md:col-span-1">
                <div className="md:hidden font-bold text-gray-200 mb-2">{item.feature}</div>
                <div className="flex items-center justify-center gap-2"><XCircleIcon /><span>{item.standard}</span></div>
            </div>
            <div className="p-4 text-sm bg-green-900/30 h-full flex items-center justify-center font-semibold text-green-300">
                <div className="flex items-center justify-center gap-2"><CheckCircleIcon /><span>{item.seedream}</span></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
);

// --- New "Ethical AI" Section ---
const ShieldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-4.944c3.956 0 7.424 2.112 9.448 5.252" /></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M4 11a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1z" /></svg>);

const ethicalPoints = [
  { icon: <ShieldIcon />, title: "Safe Content Generation", description: "Our platform has built-in safeguards to prevent the creation of harmful or explicit content, fostering a positive creative environment." },
  { icon: <LockIcon />, title: "Your Data is Private", description: "We respect your privacy. Your prompts and creations are your own. We do not use your personal data to train our models." },
  { icon: <SparklesIcon />, title: "Empowering Creativity", description: "Our mission is to build tools that augment human creativity, not replace it. We are committed to the responsible and positive use of AI." },
];

const EthicalAISection: React.FC = () => (
    <section>
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
                    Our Commitment to Ethical AI
                </span>
            </h2>
            <p className="text-gray-400 mt-2 max-w-3xl mx-auto">We are dedicated to building a creative and responsible AI ecosystem that you can trust.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {ethicalPoints.map((point, index) => (
                <div key={index} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-8 text-center flex flex-col items-center">
                    <div className="text-green-300 mb-5">{point.icon}</div>
                    <h3 className="text-xl font-bold text-gray-100 mb-3">{point.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{point.description}</p>
                </div>
            ))}
        </div>
    </section>
);

// --- New "Creative Universe" Grid Section ---
const universeItems = [
  {
    icon: <LayersIcon />,
    title: "Advanced AI Editing Suite",
    description: "Go beyond generation. Our integrated editor uses AI to perform complex tasks like inpainting (obj-remove), outpainting to expand your canvas, and smart background removal. It's a full post-production powerhouse."
  },
  {
    icon: <CodeBracketIcon />,
    title: "Developer API Access",
    description: "Integrate the power of ImagenBrainAi into your own applications, websites, and workflows. Our robust and well-documented API is built for developers to innovate and create new experiences."
  },
  {
    icon: <UsersIcon />,
    title: "Thriving Creator Community",
    description: "Join a vibrant community of artists and innovators. Share your creations, participate in weekly challenges, get featured in our gallery, and learn from the best. Your next collaboration starts here."
  },
  {
    icon: <BrainCircuitIcon />,
    title: "Custom Style Training (Pro)",
    description: "For professionals, we offer the ability to train a custom AI model on your unique art style. Ensure perfect brand consistency or create a signature aesthetic that is exclusively yours across all generations."
  }
];

const CreativeUniverseGrid: React.FC = () => (
  <section>
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
            Beyond Generation: Your Creative Universe
          </span>
      </h2>
      <p className="text-gray-400 mt-2 max-w-3xl mx-auto">Seedream ImagenBrainAi is more than a generator; it's an entire ecosystem of tools and resources designed to empower your creativity.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {universeItems.map((item, index) => (
        <motion.div
          key={index}
          className="bg-gray-900 border border-green-400/20 rounded-lg p-8 transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-green-400/10 flex items-start gap-6"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.5 }}
          variants={cardVariants}
        >
          <div className="text-green-300 p-3 bg-gray-800 rounded-lg mt-1 flex-shrink-0">
            {item.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

// --- New SVG Icons for Models Section ---
const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const PaletteIconV2 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
);
const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);


// --- New "Official Models" Section ---
const models = [
  {
    icon: <CameraIcon />,
    name: "Chimera 4.0",
    description: "Our flagship model for unparalleled photorealism. Chimera understands complex details, textures, and lighting to produce stunning, lifelike images that are indistinguishable from professional photography.",
    bestFor: ["Studio Portraits", "Product Mockups", "Architectural Renders", "Hyper-realism"]
  },
  {
    icon: <PaletteIconV2 />,
    name: "Spectra-Artisan",
    description: "The ultimate tool for artistic expression. Spectra-Artisan is trained on a vast library of art history, allowing it to masterfully replicate any style, from classic watercolor to futuristic cyberpunk.",
    bestFor: ["Digital Painting", "Concept Art", "Fantasy & Sci-Fi", "Unique Styles"]
  },
  {
    icon: <BoltIcon />,
    name: "Velocity-Flash",
    description: "Built for speed and rapid iteration. Velocity-Flash generates high-quality images in a fraction of the time, making it perfect for brainstorming, storyboarding, and creating multiple concepts quickly.",
    bestFor: ["Rapid Prototyping", "Social Media Content", "Quick Drafts", "Batch Generation"]
  }
];

const OfficialModelsSection: React.FC = () => (
  <section>
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
            Our Official AI Generator Models
          </span>
      </h2>
      <p className="text-gray-400 mt-2 max-w-3xl mx-auto">Discover the specialized AI engines that power Seedream ImagenBrainAi. Each model is fine-tuned to deliver the best results for your specific creative needs.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {models.map((model, index) => (
        <motion.div
          key={index}
          className="bg-gray-900 border border-green-400/20 rounded-lg p-8 transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-green-400/10 flex flex-col"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.5 }}
          variants={cardVariants}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="text-green-300 p-3 bg-gray-800 rounded-lg flex-shrink-0">
              {model.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-100">{model.name}</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-5 flex-grow">{model.description}</p>
          <div>
            <h4 className="text-sm font-semibold text-green-300 mb-2">Best For:</h4>
            <div className="flex flex-wrap gap-2">
              {model.bestFor.map(item => (
                <span key={item} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">{item}</span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);


// --- Main HomePage Component ---
const HomePage: React.FC = () => {
  return (
    <>
      <MetaTags 
        title="Seedream ImagenBrainAi - AI Image Generator"
        description="Generate and edit breathtaking, ultra-realistic 4K images with Seedream ImagenBrainAi. Explore limitless creativity with advanced AI, diverse styles, and an intuitive interface."
        canonicalPath="/"
      />
      <div className="space-y-24 md:space-y-32">
        <section className="text-center pt-8">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
              Transform Ideas Into Masterpieces
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Welcome to Seedream ImagenBrainAi – your next-generation AI image generator. Create stunning, ultra-realistic visuals and photorealistic portraits with our advanced text-to-image technology.
          </p>
        </section>

        <GeneratorSuite />
        
        <CapabilitiesGrid />

        <HowItWorks />
        
        <AdvancedComparison />
        
        <EthicalAISection />

        <WhyChooseUs />

        <Testimonials />
        
        <CreativeUniverseGrid />

        <OfficialModelsSection />
        
        <PricingSection />
        
        <CallToAction />
      </div>
    </>
  );
};

export default HomePage;