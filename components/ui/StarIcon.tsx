import React from 'react';

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 15.585l-4.243 2.13.81-4.723L2.93 9.47l4.74-.688L10 4.5l2.33 4.282 4.74.688-3.637 3.522.81 4.723L10 15.585z" clipRule="evenodd" />
  </svg>
);

export default StarIcon;