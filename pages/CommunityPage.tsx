
import React from 'react';
import MetaTags from '../components/MetaTags';
import { motion, Variants } from 'framer-motion';

// SVG Icons for social platforms
const DiscordIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 92 71" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M80.25 0H11.75C5.25 0 0 4.9 0 11.2V54.4C0 60.7 5.25 65.6 11.75 65.6H66L77.75 70.8V65.6H80.25C86.75 65.6 92 60.7 92 54.4V11.2C92 4.9 86.75 0 80.25 0ZM30.5 45.4C26.5 45.4 23.25 42.4 23.25 38.8C23.25 35.2 26.5 32.2 30.5 32.2C34.5 32.2 37.75 35.2 37.75 38.8C37.75 42.4 34.5 45.4 30.5 45.4ZM61.5 45.4C57.5 45.4 54.25 42.4 54.25 38.8C54.25 35.2 57.5 32.2 61.5 32.2C65.5 32.2 68.75 35.2 68.75 38.8C68.75 42.4 65.5 45.4 61.5 45.4Z" fill="currentColor"/></svg>
);
const TwitterIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"/></svg>
);
const InstagramIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const YouTubeIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.267,4,12,4,12,4S5.733,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.733,2,12,2,12s0,4.267,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.733,20,12,20,12,20s6.267,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.267,22,12,22,12S22,7.733,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/></svg>
);

const communityLinks = [
  {
    icon: <DiscordIcon />,
    name: "Discord",
    description: "Join our active Discord server to share your creations, get real-time support, and participate in exclusive community challenges and events.",
    link: "#", // Placeholder
  },
  {
    icon: <TwitterIcon />,
    name: "Twitter",
    description: "Follow us on Twitter for the latest news, feature updates, and to see stunning artwork from our community featured daily.",
    link: "#",
  },
  {
    icon: <InstagramIcon />,
    name: "Instagram",
    description: "Connect with us on Instagram to see the most visually stunning creations from our community. Tag us to get your artwork featured!",
    link: "#",
  },
  {
    icon: <YouTubeIcon />,
    name: "YouTube",
    description: "Subscribe to our YouTube channel for in-depth tutorials, feature showcases, and inspiring creator spotlights.",
    link: "#",
  },
];

const cardVariants: Variants = {
  offscreen: { y: 50, opacity: 0 },
  onscreen: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};

const CommunityPage: React.FC = () => {
  return (
    <>
      <MetaTags
        title="Community | Seedream ImagenBrainAi"
        description="Join the Seedream ImagenBrainAi community! Connect with fellow creators on Discord, Twitter, Instagram, and YouTube to share, learn, and get inspired."
        canonicalPath="/community"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
              Join Our Creative Community
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Connect with thousands of fellow artists, designers, and innovators. Share your work, get feedback, and be a part of the future of AI-driven creativity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {communityLinks.map((item, index) => (
            <motion.div
              key={index}
              className="bg-gray-900 border border-green-400/20 rounded-lg p-8 transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-green-400/10 flex flex-col text-center items-center"
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.5 }}
              variants={cardVariants}
            >
              <div className="text-green-300 mb-5">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-3">{item.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{item.description}</p>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-green-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/50 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
              >
                Join Now
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CommunityPage;