import React, { useState } from 'react';
import MetaTags from '../components/MetaTags';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronDownIcon from '../components/ui/ChevronDownIcon';
import { Link } from 'react-router-dom';

const helpData = [
    {
        category: 'Getting Started',
        items: [
            {
                question: 'How do I generate my first image?',
                answer: 'Simply type a description of the image you want to create in the main text box on the homepage, select your desired style and aspect ratio, and click the "Generate" button. Your AI-generated images will appear in a few seconds!'
            },
            {
                question: 'What is a "prompt" and how do I write a good one?',
                answer: 'A prompt is the text description you provide to the AI. A good prompt is specific and descriptive. Instead of "a dog," try "a photorealistic portrait of a happy golden retriever puppy sitting in a sunny field of flowers." The more detail you provide about the subject, action, style, and mood, the better your results will be.'
            },
            {
                question: 'What are Styles, Moods, and Lighting options?',
                answer: 'These are powerful controls to fine-tune your creation. "Styles" change the artistic look (e.g., Anime, 3D Render). "Moods" affect the emotional tone (e.g., Dreamy, Ominous). "Lighting" controls how the scene is lit (e.g., Cinematic, Golden Hour). Experiment with them to see how they transform your images!'
            },
             {
                question: 'Can I use the images for commercial projects?',
                answer: 'Yes! Users on any of our paid plans (Booster, Premium, or Professional) receive a full commercial license for the images they generate. This means you can use them for marketing, merchandise, book covers, and any other business purposes. Users on the Free Trial plan can use images for personal, non-commercial projects.'
            }
        ]
    },
    {
        category: 'Account & Billing',
        items: [
            {
                question: 'How do credits work?',
                answer: 'Credits are used to generate images. Each image generation consumes a certain number of credits, as indicated on the generation button (typically 5 credits per image). You receive an initial amount of credits with our Free Trial, and you can purchase more by activating a license for one of our plans.'
            },
            {
                question: 'How can I upgrade my plan or buy more credits?',
                answer: 'You can upgrade your plan at any time by clicking the "Activate License" button in the generator suite on the homepage. This will open a modal where you can enter your email and an activation key purchased from our pricing section to add more credits to your account.'
            },
            {
                question: 'What payment methods do you accept?',
                answer: 'We partner with Polar.sh for secure payment processing. They accept all major credit and debit cards, including Visa, Mastercard, and American Express.'
            },
             {
                question: 'How do I cancel my plan?',
                answer: 'Our plans are based on credit packs and are not recurring subscriptions. When you purchase a plan, you get a set amount of credits. There is nothing to cancel; simply purchase another credit pack when you run low.'
            }
        ]
    },
    {
        category: 'Troubleshooting',
        items: [
            {
                question: 'My images are not generating. What should I do?',
                answer: 'First, check if you have enough credits for the generation. If you do, try simplifying your prompt as very complex prompts can sometimes fail. If the issue persists, please try refreshing the page or clearing your browser cache. If you are still having trouble, contact our support team.'
            },
            {
                question: 'Why do my images look distorted or have artifacts?',
                answer: 'AI generation is a complex process. Occasionally, the AI may misinterpret a prompt or produce an image with imperfections. Try rephrasing your prompt, being more specific, or using a negative prompt to exclude unwanted elements (e.g., "--no extra limbs, blurry"). Regenerating the image often produces a better result.'
            },
            {
                question: 'I have not received enough credits after purchasing.',
                answer: 'Credit activation should be instant. If your credit balance has not updated after a successful purchase, please contact us with your purchase email and activation key, and we will resolve the issue immediately.'
            }
        ]
    }
];

const HelpCenterPage: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(helpData[0].items[0].question);

  const toggleAccordion = (question: string) => {
    setOpenAccordion(openAccordion === question ? null : question);
  };

  return (
    <>
      <MetaTags
        title="Help Center | Seedream ImagenBrainAi"
        description="Find answers to common questions about using Seedream ImagenBrainAi, managing your account, and troubleshooting issues."
        canonicalPath="/help"
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
              Help Center
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Welcome to the Seedream ImagenBrainAi Help Center. We're here to help you get the most out of our platform.
          </p>
        </div>

        <div className="space-y-12">
          {helpData.map((category) => (
            <section key={category.category}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-green-300 border-b border-green-400/20 pb-3">{category.category}</h2>
              <div className="space-y-4">
                {category.items.map((item, index) => (
                  <div key={item.question} className="bg-gray-900/50 border border-green-400/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(item.question)}
                      className="w-full flex justify-between items-center text-left p-6 cursor-pointer focus:outline-none focus:bg-green-500/10 transition-colors"
                      aria-expanded={openAccordion === item.question}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <h3 className="text-lg font-semibold text-gray-200">{item.question}</h3>
                      <motion.div
                        animate={{ rotate: openAccordion === item.question ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDownIcon className="w-6 h-6 text-green-300 transition-transform flex-shrink-0" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openAccordion === item.question && (
                        <motion.div
                          id={`faq-answer-${index}`}
                          key="content"
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                          variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 }
                          }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden"
                          role="region"
                        >
                          <div className="p-6 pt-0 text-gray-300 leading-relaxed prose prose-invert max-w-none">
                            <p>{item.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          ))}
          
           <section className="text-center bg-gray-900 border border-green-400/20 rounded-lg p-8 mt-16">
                <h2 className="text-2xl font-bold text-green-300 mb-3">Still Can't Find an Answer?</h2>
                <p className="text-gray-400 mb-6">Our support team is ready to assist you with any questions or issues you may have.</p>
                <Link 
                    to="/contact"
                    className="inline-block bg-green-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/50 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                >
                    Contact Support
                </Link>
            </section>
        </div>
      </div>
    </>
  );
};

export default HelpCenterPage;
