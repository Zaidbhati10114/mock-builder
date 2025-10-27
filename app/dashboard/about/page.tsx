import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GithubIcon, Sparkles, Zap, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 max-w-5xl">
      {/* Header Section */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            About MockBuilder AI
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Streamline your development workflow with AI-powered mock data
          generation.
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* What is MockBuilder AI Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                What is MockBuilder AI?
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              MockBuilder AI is an innovative tool designed to streamline the
              process of generating mock JSON data using AI-powered prompts.
              Whether you&apos;re a developer, designer, or tester, MockBuilder
              AI allows you to effortlessly create realistic and customizable
              JSON data in seconds, saving you time and enhancing your workflow.
            </p>
          </div>
        </div>

        {/* How It Works Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                How It Works
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Simply input a prompt describing the data you need, and
              MockBuilder AI will generate structured JSON data that you can
              edit, save, and use in your projects. With features like resource
              management, live data hosting, and easy data fetching, MockBuilder
              AI ensures you have everything you need to bring your ideas to
              life quickly and efficiently.
            </p>
          </div>
        </div>

        {/* Perfect For Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Perfect For
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Ideal for prototyping, testing APIs, or populating applications
              with mock data. MockBuilder AI provides a seamless experience,
              allowing you to focus on what matters most – building great
              products.
            </p>
          </div>
        </div>

        {/* Creator Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg">
                <GithubIcon className="h-5 w-5 text-gray-700" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Created By
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                Developed by{" "}
                <span className="font-semibold text-gray-900">Zaid Bhati</span>.
                For more information or to contribute to the project, visit the
                GitHub repository.
              </p>
              <a
                href="https://github.com/Zaidbhati10114"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="gap-2 bg-gray-900 hover:bg-gray-800">
                  <GithubIcon className="h-4 w-4" />
                  Visit GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
