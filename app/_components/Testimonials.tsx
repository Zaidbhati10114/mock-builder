import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Alex J.",
    feedback: "This app revolutionized how I generate mock data!",
  },
  {
    name: "Maria P.",
    feedback: "The Pro plan's resources are a lifesaver for my projects.",
  },
  {
    name: "James K.",
    feedback: "A must-have tool for any developer.",
  },
];

export default function Testimonials() {
  return (
    <div className="py-16 bg-white text-gray-900">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.3 }}
              className="p-6 bg-gray-100 rounded-lg shadow-lg"
            >
              <p className="text-lg mb-4">"{testimonial.feedback}"</p>
              <h4 className="text-xl font-semibold">- {testimonial.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
