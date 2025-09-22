import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SuccessAnimation from './SuccessAnimation';

interface SuccessWrapperProps {
  src: string;
  alt: string;
}

const SuccessWrapper: React.FC<SuccessWrapperProps> = ({ src, alt }) => {
  const [showSuccessAnim, setShowSuccessAnim] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // When src changes (for regeneration), reset and rerun the animation
  useEffect(() => {
    setShowSuccessAnim(true);
    setIsImageLoaded(false); // Reset load status for the new image
    const timer = setTimeout(() => {
      setShowSuccessAnim(false);
    }, 1200); // Duration of the success animation
    return () => clearTimeout(timer);
  }, [src]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
      <AnimatePresence>
        {showSuccessAnim && (
          <motion.div
            key="animation"
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1}}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="absolute z-10"
          >
            <SuccessAnimation />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.img
        key={src}
        src={src}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: (isImageLoaded && !showSuccessAnim) ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        onLoad={() => setIsImageLoaded(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default SuccessWrapper;
