import React from 'react';
import MetaTags from '../components/MetaTags';

const tutorials = [
  {
    title: "Mastering Prompts: From Basic to Advanced",
    description: "Learn how to craft the perfect prompt to get exactly the image you want. We cover keyword weighting, style modifiers, and negative prompts.",
    difficulty: "Beginner",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder
  },
  {
    title: "Creating Consistent Characters Across Scenes",
    description: "Discover how to use the 'Seed' feature to maintain character consistency in different images and scenarios, a crucial skill for storytellers and game developers.",
    difficulty: "Intermediate",
    videoUrl: null
  },
  {
    title: "Advanced Techniques: Inpainting & Outpainting",
    description: "Take your creations to the next level with our AI editor. This tutorial covers how to seamlessly remove objects (inpainting) and expand your canvas (outpainting).",
    difficulty: "Advanced",
    videoUrl: null
  },
  {
    title: "Designing for Print: A Guide to High-Resolution Outputs",
    description: "Learn the best practices for generating images in 4K, 8K, and beyond, ensuring your artwork is ready for high-quality physical prints.",
    difficulty: "Intermediate",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder
  },
  {
    title: "Exploring Cinematic Lighting for Dramatic Scenes",
    description: "A deep dive into our cinematic lighting presets. Understand how to use options like 'Golden Hour', 'Neon Noir', and 'Rim Lighting' to add mood and drama to your art.",
    difficulty: "Beginner",
    videoUrl: null
  },
  {
    title: "From Concept to Reality: A Full Project Workflow",
    description: "Follow along as we take a project from an initial idea to a finished, polished masterpiece, showcasing a professional workflow using multiple features of Seedream ImagenBrainAi.",
    difficulty: "Advanced",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder
  }
];

const TutorialsPage: React.FC = () => {
  return (
    <>
      <MetaTags
        title="Tutorials | Seedream ImagenBrainAi"
        description="Master Seedream ImagenBrainAi with our in-depth tutorials. Learn everything from basic prompting to advanced AI editing techniques."
        canonicalPath="/tutorials"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
              ImagenBrainAi Tutorials
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Level up your skills with our expert guides. Whether you're a beginner or a pro, these tutorials will help you master the art of AI image generation.
          </p>
        </div>

        <div className="space-y-8">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="bg-gray-900/50 border border-green-400/10 rounded-lg p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                        tutorial.difficulty === 'Beginner' ? 'bg-blue-500/20 text-blue-300' :
                        tutorial.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                    }`}>
                        {tutorial.difficulty}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-green-300 mb-3">{tutorial.title}</h2>
                <p className="text-gray-300 leading-relaxed">{tutorial.description}</p>
              </div>
              {tutorial.videoUrl && (
                <div className="w-full md:w-64 flex-shrink-0">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={tutorial.videoUrl} 
                      title={tutorial.title} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TutorialsPage;