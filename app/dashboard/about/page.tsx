import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            About MockBuilder AI
          </h1>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
        </div>

        {/* Content Section */}
        <div className="space-y-6 text-lg leading-relaxed">
          <div className="rounded-xl bg-card p-6 shadow-sm border">
            <p className="text-card-foreground">
              MockBuilder AI is an innovative tool designed to streamline the
              process of generating mock JSON data using AI-powered prompts.
              Whether you&apos;re a developer, designer, or tester, MockBuilder
              AI allows you to effortlessly create realistic and customizable
              JSON data in seconds, saving you time and enhancing your workflow.
            </p>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-sm border">
            <p className="text-card-foreground">
              Simply input a prompt describing the data you need, and
              MockBuilder AI will generate structured JSON data that you can
              edit, save, and use in your projects. With features like resource
              management, live data hosting, and easy data fetching, MockBuilder
              AI ensures you have everything you need to bring your ideas to
              life quickly and efficiently.
            </p>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-sm border">
            <p className="text-card-foreground">
              Perfect for prototyping, testing APIs, or populating applications
              with mock data, MockBuilder AI provides a seamless experience,
              allowing you to focus on what matters most.
            </p>
          </div>

          {/* Creator Section */}
          <div className="mt-12 rounded-xl bg-primary/5 p-8 border">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Created by</h2>
              <p className="text-lg">
                Developed by Zaid Bhati. For more information or to contribute
                to the project, visit the GitHub repository.
              </p>
              <a
                href="https://github.com/Zaidbhati10114"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="mt-4 gap-2">
                  <GithubIcon className="h-5 w-5" />
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
