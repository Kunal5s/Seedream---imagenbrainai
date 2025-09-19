import React from 'react';

interface ImageErrorPlaceholderProps {
  message: string;
  aspectRatioClass?: string;
}

const ErrorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);


const ImageErrorPlaceholder: React.FC<ImageErrorPlaceholderProps> = ({ message, aspectRatioClass = 'aspect-square' }) => {
  return (
    <div className={`${aspectRatioClass} w-full bg-red-900/20 rounded-lg border-2 border-dashed border-red-500/50 flex flex-col items-center justify-center text-center p-4 col-span-full`}>
      <ErrorIcon className="h-12 w-12 text-red-400 mb-2" />
      <p className="text-sm font-semibold text-red-300">Image Generation Failed</p>
      <p className="text-xs text-red-400 mt-1 max-w-xs">{message}</p>
    </div>
  );
};

export default ImageErrorPlaceholder;