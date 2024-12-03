"use client";
import { buttonVariants } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import Navbar from "./_components/Navbar";
import MaxWidthWrapper from "./_components/MaxWidthWrapper";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PromptOutputSwitcher } from "./_components/Example";
import { useUser } from "@clerk/clerk-react";
import Pricing from "./_components/Pricing";
import Footer from "./_components/Footer";

export default function Home() {
  const user = useUser();
  const router = useRouter();

  return (
    <>
      <Navbar />
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
          <p className="text-sm font-semibold text-gray-700">
            MockBuilder is now public!
          </p>
        </div>
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          AI Powered <br />
          <span className="text-blue-600">Mock JSON Data</span> Generation in
          seconds.
        </h1>
        <p className="mt-5 text-xl max-w-prose text-zinc-700 ">
          Create, Edit, Save,and Fetch Your Data with Ease
        </p>

        <Link
          className={`flex items-center ${buttonVariants({
            size: "lg",
            className: "mt-5",
          })} group`}
          href="/sign-up"
        >
          {user.isSignedIn ? "Dashboard" : "Get started"}{" "}
          <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 ease-in-out group-hover:translate-x-1.5" />
        </Link>
      </MaxWidthWrapper>

      {/* value proposition section */}

      {/* Feature section */}
      <div className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 font-bold text-4xl text-gray-900 sm:text-5xl">
              Start Generating in minutes
            </h2>
          </div>
        </div>

        {/* steps */}
        <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-blue-600">Step 1</span>
              <span className="text-xl font-semibold">Input Your Prompt</span>
              <span className="mt-2 text-zinc-700">
                Start by entering the prompt for your desired mock data.
                {/* <Link
                  href="/pricing"
                  className="text-blue-700 underline underline-offset-2"
                >
                  pro plan
                </Link> */}
                .
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-blue-600">Step 2</span>
              <span className="text-xl font-semibold">Generate and Edit</span>
              <span className="mt-2 text-zinc-700">
                AI generates data based on your prompt, which you can edit.
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-blue-600">Step 3</span>
              <span className="text-xl font-semibold">Save as Resource</span>
              <span className="mt-2 text-zinc-700">
                Save your generated data as a resource for future access.
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-blue-600">Step 4</span>
              <span className="text-xl font-semibold">
                Make it Live & Fetch
              </span>
              <span className="mt-2 text-zinc-700">
                Make your resource live, fetch, and use it as needed.
              </span>
            </div>
          </li>
        </ol>

        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            {/* <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4"> */}
            <PromptOutputSwitcher />
            {/* </div> */}
          </div>
        </div>
      </div>
      <div>
        <Pricing />
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
}
