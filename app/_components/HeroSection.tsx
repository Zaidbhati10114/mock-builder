import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold mb-6 text-center">
        AI-Powered Mock Data Generation
      </h1>
      <p className="text-2xl mb-8 text-center">
        Create, Edit, Save, and Fetch Your Data with Ease
      </p>
      <motion.button
        whileHover={{ scale: 1.1 }}
        className="bg-blue-500 px-8 py-4 rounded-lg font-semibold"
      >
        Start Generating
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        className="bg-blue-500 px-8 py-4 rounded-lg font-semibold"
      >
        Login
      </motion.button>
    </div>
  );
}
