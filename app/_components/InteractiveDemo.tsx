import { motion } from "framer-motion";

const steps = [
  {
    title: "Input Your Prompt",
    description: "Start by entering the prompt for your desired mock data.",
  },
  {
    title: "Generate and Edit",
    description: "AI generates data based on your prompt, which you can edit.",
  },
  {
    title: "Save as Resource",
    description: "Save your generated data as a resource for future access.",
  },
  {
    title: "Make it Live & Fetch",
    description: "Make your resource live, fetch, and use it as needed.",
  },
];

export default function HowItWorks() {
  return (
    <div className="py-16 bg-white text-gray-900">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.3 }}
              className="p-6 bg-gray-100 rounded-lg shadow-lg text-center"
            >
              <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
