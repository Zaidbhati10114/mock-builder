import { useEffect } from "react";
import { gsap } from "gsap";

export default function DataFetchAnimation() {
  useEffect(() => {
    gsap.to(".fetching-data", {
      duration: 2,
      width: "100%",
      backgroundColor: "#4F46E5",
      ease: "power2.inOut",
    });
  }, []);

  return (
    <div className="bg-gray-900 text-white py-16">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">Fetching Data...</h2>
        <div className="fetching-data bg-gray-700 h-2 w-0 mx-auto"></div>
        <div className="mock-data bg-gray-800 p-6 mt-8 rounded-lg shadow-lg">
          <p>{`{ "status": "success", "data": [ { "id": 1, "value": "Sample Data" } ] }`}</p>
        </div>
      </div>
    </div>
  );
}
