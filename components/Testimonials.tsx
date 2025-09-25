import React from 'react';
import StarIcon from './ui/StarIcon';

const testimonials = [
  {
    quote: "Seedream ImagenBrainAi has completely transformed my creative process! The quality of the 4K renders is insane and it's so incredibly fast. I can now visualize complex concepts for my clients in minutes instead of hours. The level of detail in the photorealistic outputs is unmatched, making it an indispensable tool for any professional concept artist. It’s not just a generator; it’s a creative partner that consistently exceeds my expectations and pushes my own creative boundaries. I genuinely could not imagine my workflow without it now.",
    name: "Alex Johnson",
    title: "Freelance Concept Artist",
    rating: 5
  },
  {
    quote: "As an indie author, finding the perfect, unique cover art that doesn't break the bank has always been a struggle. This tool is an absolute game-changer. I can generate countless high-quality, emotionally resonant options for my book covers, each one perfectly tailored to the story's mood and genre. The ability to control the lighting and color schemes ensures every cover is unique and professional. It’s given me the creative freedom to visually brand my entire series with a consistent, stunning aesthetic. It is truly brilliant!",
    name: "Samantha Lee",
    title: "Indie Author",
    rating: 5
  },
  {
    quote: "The sheer level of control with all the style and mood options is simply amazing. I feel like I'm collaborating with the AI, not just telling it what to do. The results are always surprising and inspiring, often taking my initial ideas in exciting new directions. For my graphic design work, the ability to rapidly iterate on different visual themes for a client's brand is invaluable. The negative prompt feature is also incredibly powerful for fine-tuning the final output and removing any unwanted elements, ensuring a perfect result every time.",
    name: "Michael Chen",
    title: "Graphic Designer",
    rating: 5
  },
  {
    quote: "For our indie game studio, Seedream has been a revolution. We use it for everything from initial character concept art to generating seamless, tileable textures for our 3D models. The speed is incredible; we can iterate on dozens of environmental designs in a single afternoon. The 'Fantasy Art' and 'Sci-Fi' styles are particularly powerful, providing a high-quality baseline that our artists can then refine. It has drastically cut down our pre-production time and allowed our small team to create a world that looks like it was made by a AAA studio.",
    name: "Kenji Tanaka",
    title: "Lead Game Developer",
    rating: 5
  },
  {
    quote: "My job is all about creating a constant stream of engaging, unique content. Seedream is my secret weapon. I've stopped using generic, soulless stock photos entirely. Now, I can generate on-brand images for every single post, story, and ad campaign. The AI's ability to create vibrant, eye-catching visuals that align with our brand’s color palette is a huge time-saver. Our engagement rates have noticeably increased since we started using these custom graphics. It’s an essential tool for any marketer looking to stand out in a crowded social media landscape.",
    name: "David Chen",
    title: "Social Media Manager",
    rating: 5
  },
  {
    quote: "Architectural visualization has always been a time-consuming bottleneck in my workflow. Seedream ImagenBrainAi changes that completely. I can now generate photorealistic renderings of my concepts in various lighting conditions and material finishes in mere minutes. This is invaluable for client meetings, allowing me to present multiple options and make real-time adjustments based on their feedback. The 'Cinematic Lighting' preset adds a level of drama and realism that truly helps sell a vision. It's an incredible tool for rapid prototyping in architecture.",
    name: "Fatima Al-Jamil",
    title: "Architectural Designer",
    rating: 5
  },
  {
    quote: "This AI has become an essential part of my toolkit. I can generate high-quality, custom icons and hero images in seconds, which used to take hours of searching or manual creation. The ability to specify exact aspect ratios and styles means the assets fit my wireframes perfectly from the get-go. Seedream helps me overcome creative blocks and produce visually rich mockups for client presentations much faster. The consistency it offers for creating user avatars and placeholder content is just phenomenal. It’s a productivity multiplier for any digital designer.",
    name: "Maria Rodriguez",
    title: "Senior UI/UX Designer",
    rating: 5
  },
  {
    quote: "I'm a blogger, and finding compelling featured images for my articles was a constant challenge. Seedream has made it effortless. I can now create high-concept, editorial-style art that perfectly matches the theme of my posts. The AI is brilliant at interpreting abstract ideas and turning them into stunning, symbolic visuals. It has elevated the entire look and feel of my blog, making my content more professional and shareable. My readers have even commented on the incredible new artwork! A fantastic resource for content creators.",
    name: "Ben Carter",
    title: "Blogger & Content Creator",
    rating: 4
  },
  {
    quote: "The inpainting and outpainting features are what really sold me on this platform. They are incredibly powerful. I can easily remove distracting elements from a generated image or expand its canvas in a way that feels completely natural. This AI editor is more intuitive and often more effective than traditional software for these specific tasks. It allows for a level of post-generation refinement that gives me complete creative control over the final composition. It’s not just a generator; it’s a full creative suite. Highly recommended for digital artists.",
    name: "Chloe Dubois",
    title: "Digital Artist",
    rating: 5
  },
  {
    quote: "As a fashion designer, I use Seedream for rapid ideation of new clothing concepts and, most importantly, for generating unique, seamless textile patterns. The AI can create intricate, beautiful designs that would take days to illustrate by hand. I can test out different colorways and styles instantly, dramatically accelerating my design process. Visualizing these patterns on mockups before sampling saves an incredible amount of time and money. It's a visionary tool that is pushing the boundaries of creativity in the fashion industry. A must-have for modern designers.",
    name: "Isabella Rossi",
    title: "Fashion & Textile Designer",
    rating: 5
  },
  {
    quote: "Our marketing agency switched to ImagenBrainAi for creating ad creatives, and the results have been phenomenal. We can A/B test dozens of visual concepts for our clients' campaigns in the time it used to take to produce just one. The ability to generate hyper-realistic lifestyle images tailored to specific target demographics has significantly boosted our campaign performance and client satisfaction. The ROI is undeniable. It has given us a powerful competitive edge and has become central to our creative strategy. It's the future of advertising.",
    name: "Tom Sterling",
    title: "Ad Agency Director",
    rating: 5
  },
  {
    quote: "I teach a digital arts course, and I've integrated Seedream into my curriculum. It's an amazing educational tool. It helps students understand composition, color theory, and lighting in a very tangible and immediate way. They can experiment with styles from Art Deco to Cyberpunk and see the results instantly. It lowers the technical barrier to creation, allowing them to focus on developing their creative ideas. The platform has sparked so much enthusiasm and creativity in my classroom. It’s an incredible resource for the next generation of artists.",
    name: "Dr. Evelyn Reed",
    title: "University Arts Professor",
    rating: 5
  },
  {
    quote: "The character design engine is phenomenal. As a tabletop RPG creator, I need a constant supply of unique characters and creatures. With Seedream, I can bring my non-player characters to life with detailed portraits that perfectly match my descriptions. The consistency I can achieve using the seed control feature is critical for creating character sheets and reference art. It has made my world feel so much more alive and has been a huge hit with my players. It saves me hundreds of hours of searching for stock art.",
    name: "Marcus Thorne",
    title: "TTRPG Game Master & Creator",
    rating: 5
  },
  {
    quote: "I run a small e-commerce store, and professional product photography is expensive. This AI has been a lifesaver. I can generate high-quality lifestyle shots of my products in any setting I can imagine, without a physical photoshoot. The realism is incredible and it has made my online store look so much more professional. My conversion rates have actually improved since I updated my product listings with these AI-generated images. For a small business owner, this tool provides immense value and levels the playing field.",
    name: "Priya Sharma",
    title: "E-commerce Store Owner",
    rating: 4
  },
  {
    quote: "The API access is what sets Seedream apart for our development team. We have integrated its image generation capabilities directly into our custom content management system. This allows our clients to generate their own blog post images right within our platform. The API is robust, well-documented, and was surprisingly easy to implement. It has added a huge amount of value to our product offering and has become a major selling point for our customers. A powerful and reliable tool for any developer.",
    name: "Leo Martinez",
    title: "Lead Software Engineer",
    rating: 5
  },
  {
    quote: "Creating storyboards for film pre-production is a meticulous and time-consuming process. Seedream's cinematic scene generator has accelerated our workflow immensely. We can quickly visualize key shots, test different camera angles, and establish the mood and lighting for a sequence before a single frame is shot. It facilitates much clearer communication between the director, cinematographer, and art department. It's not about replacing storyboard artists, but about giving them a powerful tool to bring their ideas to life faster and more effectively.",
    name: "Javier Castillo",
    title: "Film Director",
    rating: 5
  },
  {
    quote: "The sheer variety of styles is what keeps me coming back. One moment I'm creating a delicate Ukiyo-e print, the next a gritty, neon-soaked cyberpunk cityscape. The AI's ability to understand and authentically replicate these diverse aesthetics is truly impressive. It’s an endless well of inspiration. Whenever I feel a creative block, I just start experimenting with different style combinations and it always sparks new ideas for my personal art projects. This tool has made me a more versatile and experimental artist. I love it.",
    name: "Sophie N'guyen",
    title: "Hobbyist Digital Painter",
    rating: 5
  },
  {
    quote: "As a professional food blogger, my content relies heavily on stunning visuals. Hiring a photographer for every recipe is not feasible. Seedream has been a revelation. I can generate incredibly realistic, mouth-watering images of my dishes with perfect lighting and plating. It understands culinary terms and can create anything from a rustic-looking pie to a Michelin-star-worthy dessert. It has elevated the quality of my blog and social media presence significantly, and my audience loves the beautiful images. It's an indispensable tool for my brand.",
    name: "Oliver Finch",
    title: "Professional Food Blogger",
    rating: 4
  },
  {
    quote: "The background removal and object removal tools are still in development, but the inpainting already works like magic. For my photography work, I often need to clean up images by removing small distractions. This AI makes that process almost instantaneous. It's far more intuitive than the complex tools in traditional photo editing software. The potential for these AI editing features is enormous, and they are already saving me a significant amount of post-production time. I'm excited to see how they evolve. The platform is constantly improving.",
    name: "Hannah Weiss",
    title: "Portrait Photographer",
    rating: 5
  },
  {
    quote: "I use Seedream to create therapeutic and calming art. The 'Dreamy' and 'Serene' mood options combined with the watercolor style produce such beautiful and peaceful imagery. It has become a part of my daily mindfulness routine. The process of describing a tranquil scene and seeing it come to life is incredibly relaxing. It's a testament to how technology can be used for more than just productivity; it can be a tool for well-being and personal expression. I've recommended it to many friends who are looking for a creative outlet.",
    name: "Aisha Khan",
    title: "Art Therapy Advocate",
    rating: 5
  }
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-gray-600'}`}
      />
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  return (
    <section>
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-green-400">
          Loved by Creators Worldwide
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-gray-900 border border-green-400/20 rounded-lg p-8 flex flex-col justify-between shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
            <div>
              <StarRating rating={testimonial.rating} />
              <p className="text-gray-300 italic my-4 text-sm leading-relaxed">"{testimonial.quote}"</p>
            </div>
            <div className="mt-4">
              <p className="font-bold text-green-300">{testimonial.name}</p>
              <p className="text-xs text-gray-500">{testimonial.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;