import React from 'react';
import { motion } from 'framer-motion';

const MoonLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-green-300">
      <motion.svg
        width="64"
        height="64"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '50%', originY: '50%' }}
      >
        <path
          d="M 50,5 A 45,45 0 1 1 50,95 A 35,35 0 1 0 50,5 Z"
          fill="currentColor"
        />
      </motion.svg>
      <p className="font-semibold text-sm">Summoning Pixels...</p>
    </div>
  );
};
export default MoonLoader;
