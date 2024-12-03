"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Terminal, Save, Rocket, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const OnboardingGuide = () => {
  const [activeStep, setActiveStep] = useState(0);
  const stepsContainerRef = useRef(null);

  const steps = [
    {
      title: "Create a Project",
      description:
        "Start by creating a new project to organize your AI-generated mock data resources",
      icon: <Plus className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />,
      preview: (
        <div className="bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 p-4 border-b">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              <Link href="/dashboard/projects">New Project</Link>
            </Button>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-2">Project Name</p>
            <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
          </div>
        </div>
      ),
    },
    {
      title: "Add a Resource",
      description:
        "Create a new resource within your project and write a prompt to generate mock data",
      icon: <Terminal className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />,
      preview: (
        <div className="bg-slate-50 rounded-lg">
          <div className="p-4">
            <div className="h-24 bg-white rounded-lg border p-2">
              <p className="text-sm text-gray-600">Write your prompt here...</p>
            </div>
            <div className="flex justify-end mt-3">
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                Generate
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Save Generated Data",
      description:
        "Review the AI-generated mock data and save it to your resource",
      icon: <Save className="w-6 h-6 md:w-8 md:h-8 text-green-500" />,
      preview: (
        <div className="bg-slate-50 rounded-lg">
          <div className="p-4">
            <div className="bg-black rounded-lg p-3 font-mono text-sm text-green-400">
              {`{ "users": [ { "id": 1, "name": "..." } ] }`}
            </div>
            <div className="flex justify-end mt-3">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                Save Resource
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Make it Live",
      description: "Deploy your resource to get a live API endpoint",
      icon: <Rocket className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />,
      preview: (
        <div className="bg-slate-50 rounded-lg">
          <div className="p-4">
            <div className="flex items-center justify-between bg-white rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-mono text-gray-600">
                  api/v1/mock/users
                </span>
              </div>
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                Go Live
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const options = {
      root: stepsContainerRef.current,
      threshold: 0.5,
      rootMargin: "-20% 0px -60% 0px",
    };

    const callback = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-step"));
          setActiveStep(index);
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    const elements = document.querySelectorAll(".step-section");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-white rounded-lg border">
      <div className="p-6 md:h-[calc(100vh-200px)] md:flex md:flex-col">
        {/* Fixed Header */}
        <div className="md:flex-none">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p className="text-gray-600">
              Generate and serve AI-powered mock data in 4 simple steps
            </p>
          </div>

          {/* Progress Indicators */}
          {/* <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{ width: "20%" }}
              >
                <div
                  className={`rounded-full p-3 transition-all duration-300 transform ${
                    index === activeStep
                      ? "bg-blue-50 scale-125"
                      : "bg-gray-50 scale-100"
                  }`}
                >
                  {step.icon}
                </div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Scrollable Content */}
        <div
          ref={stepsContainerRef}
          className="steps-container md:flex-1 md:overflow-y-auto space-y-8 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {steps.map((step, index) => (
            <div
              key={index}
              data-step={index}
              className="step-section scroll-mt-4"
            >
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600 mb-4">{step.description}</p>
              {step.preview}
            </div>
          ))}
        </div>

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .steps-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default OnboardingGuide;
