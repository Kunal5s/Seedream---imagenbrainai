import React from 'react';

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 13.5v-2.25A4.5 4.5 0 017.5 6.75h9a4.5 4.5 0 014.5 4.5v2.25m-16.5 0a4.5 4.5 0 00-1.5 3.75v2.25a1.5 1.5 0 001.5 1.5h16.5a1.5 1.5 0 001.5-1.5v-2.25a4.5 4.5 0 00-1.5-3.75m-16.5 0h16.5" />
  </svg>
);

export default UploadIcon;