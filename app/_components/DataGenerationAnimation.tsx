import { useEffect } from "react";
import { gsap } from "gsap";

export default function AIProcessAnimation() {
  useEffect(() => {
    gsap
      .timeline()
      .from(".input-data", { opacity: 0, x: -100, duration: 1 })
      .to(".ai-thinking", {
        opacity: 1,
        scale: 1.2,
        duration: 1,
        repeat: -1,
        yoyo: true,
      })
      .from(".output-data", { opacity: 0, x: 100, duration: 1 }, "-=1");
  }, []);

  return (
    <div className="bg-gray-900 text-white py-16">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">How AI Generates Your Data</h2>
        <div className="process-flow flex justify-center items-center">
          <div className="input-data bg-gray-800 p-6 rounded-lg shadow-lg mr-4">
            <p>{`{ "Input": "User Parameters" }`}</p>
          </div>
          <div className="ai-thinking bg-purple-700 p-6 rounded-full shadow-lg mx-4">
            <p>AI</p>
          </div>
          <div className="output-data bg-gray-800 p-6 rounded-lg shadow-lg ml-4">
            <p>{`{ "Output": "Generated Mock Data" }`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
