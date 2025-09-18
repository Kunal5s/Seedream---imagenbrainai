import React from 'react';
import { Author } from '../data/blogData';
import LocationPinIcon from './ui/LocationPinIcon';

interface AuthorBioProps {
  author: Author;
}

const AuthorBio: React.FC<AuthorBioProps> = ({ author }) => {
  return (
    <div className="bg-gray-900 border border-green-400/20 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
      <img 
        src={author.avatarUrl} 
        alt={`Avatar of ${author.name}`} 
        className="w-24 h-24 rounded-full border-2 border-green-300 object-cover flex-shrink-0"
      />
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold text-green-300">About the Author: {author.name}</h3>
        <p className="text-gray-400 my-2 text-sm leading-relaxed">{author.bio}</p>
        <div className="flex items-center justify-center sm:justify-start text-gray-500 text-xs mt-3">
          <LocationPinIcon className="w-4 h-4 mr-1.5" />
          <span>{author.location}</span>
        </div>
      </div>
    </div>
  );
};

export default AuthorBio;