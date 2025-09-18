import React from 'react';
import { Link } from 'react-router-dom';

const features: { title: string; keywords: string }[] = [
  { title: "Ultra-Realistic 4K Output", keywords: "4k,resolution,hd,realistic" },
  { title: "Multi-Reference Image Support", keywords: "multiple,images,reference,composition" },
  { title: "Anime & Manga Style", keywords: "anime,manga,japan,cartoon" },
  { title: "Fantasy & Sci-Fi Art", keywords: "fantasy,sci-fi,dragon,space" },
  { title: "Photorealistic Imaging", keywords: "photograph,realistic,portrait,face" },
  { title: "3D Rendered Models", keywords: "3d,render,cgi,blender" },
  { title: "Advanced Inpainting & Outpainting", keywords: "inpainting,outpainting,edit,expand" },
  { title: "Style Transfer", keywords: "style,transfer,art,filter" },
  { title: "Custom Aspect Ratios", keywords: "aspect,ratio,size,crop" },
  { title: "Negative Prompts", keywords: "negative,prompt,remove,exclude" },
  { title: "Seed Control for Reproducibility", keywords: "seed,control,random,repeat" },
  { title: "API Access for Developers", keywords: "api,code,developer,integration" },
  { title: "Upscaling to 8K & Beyond", keywords: "upscale,resolution,enhance,8k" },
  { title: "Artistic Filters & Effects", keywords: "filter,effects,artistic,glitch" },
  { title: "Logo & Graphic Design", keywords: "logo,graphic,design,brand" },
  { title: "Architectural Visualization", keywords: "architecture,building,render,modern" },
  { title: "Character Design Engine", keywords: "character,design,avatar,oc" },
  { title: "Fashion & Textile Design", keywords: "fashion,textile,clothing,pattern" },
  { title: "Background Removal", keywords: "background,remove,transparent,edit" },
  { title: "Seamless Tiling Patterns", keywords: "seamless,tile,pattern,texture" }
];

const FeatureGrid: React.FC = () => {
  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          Explore Our Powerful Features
        </span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-green-400/20 rounded-lg overflow-hidden transform hover:scale-105 hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-green-400/20 flex flex-col group"
          >
            <div className="relative aspect-square">
              <img
                src={`https://picsum.photos/seed/${feature.keywords.split(',')[0]}${index}/200/200`}
                alt={feature.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>
            </div>
            <div className="p-3 flex-grow flex items-center justify-center">
              <p className="text-sm font-medium text-gray-300 text-center">{feature.title}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link 
          to="/features"
          className="bg-gray-800 text-green-300 font-bold py-3 px-8 rounded-lg border border-green-400/30 transition-all duration-300 ease-in-out transform hover:bg-green-400/10 hover:shadow-lg hover:shadow-green-400/20 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
        >
          Explore All Features
        </Link>
      </div>
    </section>
  );
};

export default FeatureGrid;