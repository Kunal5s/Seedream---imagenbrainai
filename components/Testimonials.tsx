import React from 'react';
import StarIcon from './ui/StarIcon';

const testimonials = [
  {
    quote: "Seedream ImagenBrainAi 4.0 has transformed my creative process! The quality is insane and it's so incredibly fast. I can now visualize concepts for my clients in minutes instead of hours.",
    name: "Alex Johnson",
    title: "Freelance Concept Artist",
    rating: 5
  },
  {
    quote: "As a writer, I often struggle to find the right cover art. This tool has been a game-changer. I can generate countless high-quality, unique options for my book covers. Absolutely brilliant!",
    name: "Samantha Lee",
    title: "Indie Author",
    rating: 5
  },
  {
    quote: "The level of control with all the style and mood options is amazing. I feel like I'm collaborating with the AI, not just telling it what to do. The results are always surprising and inspiring.",
    name: "Michael Chen",
    title: "Graphic Designer",
    rating: 4
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
          <div key={index} className="bg-gray-900 border border-green-400/20 rounded-lg p-8 flex flex-col justify-between shadow-lg">
            <div>
              <StarRating rating={testimonial.rating} />
              <p className="text-gray-300 italic my-4">"{testimonial.quote}"</p>
            </div>
            <div>
              <p className="font-bold text-green-300">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;