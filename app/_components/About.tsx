import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

export default function AboutModal() {
  return (
    <Dialog>
      <DialogTrigger className=" hover:underline me-4 md:me-6">
        About
      </DialogTrigger>
      <DialogContent className="max-w-lg mx-auto p-6 sm:max-w-xl sm:rounded-lg sm:border sm:shadow-lg">
        <DialogHeader>
          <DialogTitle>About MockBuilder AI</DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4 max-h-[50vh] overflow-hidden pr-[2px] -mr-[17px]">
          <p>
            MockBuilder AI is an innovative tool designed to streamline the
            process of generating mock JSON data using AI-powered prompts.
            Whether youre a developer, designer, or tester, MockBuilder AI
            allows you to effortlessly create realistic and customizable JSON
            data in seconds, saving you time and enhancing your workflow.
          </p>
          <p>
            Simply input a prompt describing the data you need, and MockBuilder
            AI will generate structured JSON data that you can edit, save, and
            use in your projects. With features like resource management, live
            data hosting, and easy data fetching, MockBuilder AI ensures you
            have everything you need to bring your ideas to life quickly and
            efficiently.
          </p>
          <p>
            Perfect for prototyping, testing APIs, or populating applications
            with mock data, MockBuilder AI provides a seamless experience,
            allowing you to focus on what matters most.
          </p>
          <p>
            Developed by Zaid Bhati. For more information or to contribute to
            the project, visit the GitHub repository.
          </p>
          <a
            href="https://github.com/Zaidbhati10114"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="mt-2 bg-blue-600 text-white hover:bg-blue-700">
              Visit GitHub
            </Button>
          </a>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
