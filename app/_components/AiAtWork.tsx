import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight } from "react-syntax-highlighter/dist/cjs/styles/prism";

const generateRandomJson = () => {
  const names = ["John Doe", "Jane Smith", "Alex Johnson", "Emily Davis"];
  const roles = ["Engineer", "Designer", "Manager", "Developer"];
  const companies = [
    "Tech Corp",
    "Design Studio",
    "Business Inc.",
    "Web Solutions",
  ];
  const emails = [
    "john.doe@example.com",
    "jane.smith@example.com",
    "alex.johnson@example.com",
    "emily.davis@example.com",
  ];
  const phoneNumbers = [
    "+1-202-555-0173",
    "+1-202-555-0154",
    "+1-202-555-0127",
    "+1-202-555-0148",
  ];

  return {
    id: Math.floor(Math.random() * 1000),
    name: names[Math.floor(Math.random() * names.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    company: companies[Math.floor(Math.random() * companies.length)],
    email: emails[Math.floor(Math.random() * emails.length)],
    phone: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
    activities: [
      { activity: "Logged in", timestamp: new Date().toISOString() },
      { activity: "Viewed dashboard", timestamp: new Date().toISOString() },
      { activity: "Updated profile", timestamp: new Date().toISOString() },
    ],
  };
};

export default function AIAtWork() {
  const [jsonData, setJsonData] = useState(generateRandomJson());

  useEffect(() => {
    const interval = setInterval(() => {
      setJsonData(generateRandomJson());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">See AI in Action</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="p-8 bg-gray-800 rounded-lg shadow-lg inline-block max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-semibold mb-4">Generated JSON Data:</h3>
          <SyntaxHighlighter language="json" style={solarizedlight}>
            {JSON.stringify(jsonData, null, 2)}
          </SyntaxHighlighter>
        </motion.div>
      </div>
    </div>
  );
}
