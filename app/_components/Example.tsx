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
    prompt: "Generate a simple recipe",
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
    <div className="flex flex-col md:flex-row items-stretch justify-center space-y-4 md:space-y-0 md:space-x-6 p-4 bg-gray-800 rounded-lg shadow-lg">
      {/* Prompt Box */}
      <div className="flex-1 p-4 bg-white text-gray-800 rounded-md shadow-md text-center flex items-center justify-center">
        <div>
          <h2 className="text-xl font-bold mb-4">Prompt</h2>
          <p>{currentPrompt}</p>
        </div>
      </div>

      {/* Output Box */}
      <div className="flex-1 p-4 bg-white text-gray-800 rounded-md shadow-md flex items-center">
        <SyntaxHighlighter
          language="json"
          style={solarizedlight}
          customStyle={{ borderRadius: "0.5rem", width: "100%" }}
        >
          {JSON.stringify(currentOutput, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
