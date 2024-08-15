import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { solarizedlight } from "react-syntax-highlighter/dist/cjs/styles/prism";

export const promptsAndOutputs = [
  {
    prompt: "Generate a user profile",
    output: {
      name: "Jane Smith",
      age: 28,
      job: "UX Designer",
      skills: ["UI/UX", "Figma", "Sketch"],
      email: "jane@design.co",
    },
  },
  {
    prompt: "Create a product listing",
    output: {
      name: "SoundMax Pro",
      price: 129.99,
      color: "Black",
      battery: "8 hours",
      features: ["ANC", "Water-resistant"],
    },
  },
  {
    prompt: "Generate a simple",
    output: {
      name: "Quick Cookies",
      prepTime: "15 mins",
      cookTime: "10 mins",
      ingredients: ["flour", "butter", "sugar", "eggs", "chocolate chips"],
    },
  },
];

export const PromptOutputSwitcher = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex + 1) % promptsAndOutputs.length
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentPrompt = promptsAndOutputs[currentIndex].prompt;
  const currentOutput = promptsAndOutputs[currentIndex].output;

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center space-y-8 lg:space-y-0 lg:space-x-8">
      {/* Prompt Box */}
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg w-[600px] h-[600px] flex flex-col justify-center items-center">
        <h3 className="text-xl font-bold mb-4 text-center">Prompt</h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex-grow flex items-center justify-center overflow-hidden"
          >
            <p className="text-2xl text-center font-extralight text-blue-500">
              {currentPrompt}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Output Box */}
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg w-[800px] h-[600px] flex justify-center items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <SyntaxHighlighter
              language="json"
              style={solarizedlight}
              customStyle={{
                fontSize: "1.5rem",
                height: "100%",
                width: "100%",
                margin: 0,
              }}
            >
              {JSON.stringify(currentOutput, null, 2)}
            </SyntaxHighlighter>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
// className="p-6 bg-gray-800 rounded-lg shadow-lg w-full md:w-1/2 flex justify-center items-center text-center"
//style={{ height: 'auto', minHeight: '400px' }}
