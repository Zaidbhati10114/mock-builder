import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Pricing = () => {
  const user = true;

  const pricingItems = [
    {
      plan: "Free",
      tagline: "For small side projects.",
      quota: 2, // 2 projects
      features: [
        {
          text: "2 projects",
          footnote: "Create up to 2 projects.",
        },
        {
          text: "4 resources",
          footnote: "Store and manage up to 4 resources within your projects.",
        },
        {
          text: "1000 JSON generation credits",
          footnote: "Generate up to 1000 JSON objects using AI prompts.",
        },
        {
          text: "Make resources live",
          footnote: "You can make your resources live to share them publicly.",
        },
        {
          text: "Basic support",
          negative: true,
        },
      ],
    },
    {
      plan: "Pro",
      tagline: "For larger projects with higher needs.",
      quota: 20, // 20 projects
      features: [
        {
          text: "20 projects",
          footnote: "Create up to 20 projects.",
        },
        {
          text: "20 resources",
          footnote: "Store and manage up to 20 resources within your projects.",
        },
        {
          text: "10,000 JSON generation credits",
          footnote: "Generate up to 10,000 JSON objects using AI prompts.",
        },
        {
          text: "Make resources live",
          footnote: "You can make your resources live to share them publicly.",
        },
        {
          text: "Higher-quality AI responses",
          footnote: "Enhanced algorithmic responses for better data quality.",
        },
        {
          text: "Priority support",
        },
        {
          text: "Larger file handling",
          footnote: "Handle larger datasets and more complex resources.",
        },
      ],
    },
  ];

  return (
    <>
      <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            Whether you&apos;re just trying out our service or need more,
            we&apos;ve got you covered.
          </p>
        </div>

        <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const price = plan === "Pro" ? 20 : 0;
              return (
                <div
                  key={plan}
                  className={cn("relative rounded-2xl bg-white shadow-lg", {
                    "border-2 border-blue-600 shadow-blue-200": plan === "Pro",
                    "border border-gray-200": plan !== "Pro",
                  })}
                >
                  {plan === "Pro" && (
                    <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                      Upgrade now
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="my-3 text-center font-display text-3xl font-bold">
                      {plan}
                    </h3>
                    <p className="text-gray-500">{tagline}</p>
                    <p className="my-5 font-display text-6xl font-semibold">
                      ${price}
                    </p>
                    <p className="text-gray-500">per month</p>
                  </div>

                  <ul className="my-10 space-y-5 px-8">
                    {/* @ts-ignore */}
                    {features.map(({ text, footnote, negative }) => (
                      <li key={text} className="flex space-x-5">
                        <div className="flex-shrink-0">
                          {negative ? (
                            <Minus className="h-6 w-6 text-gray-300" />
                          ) : (
                            <Check className="h-6 w-6 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <p
                              className={cn("text-gray-600", {
                                "text-gray-400": negative,
                              })}
                            >
                              {text}
                            </p>
                            {footnote && (
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger className="cursor-default ml-1.5">
                                  <HelpCircle className="h-4 w-4 text-zinc-500" />
                                </TooltipTrigger>
                                <TooltipContent className="w-80 p-2">
                                  {footnote}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200" />
                  <div className="p-5">
                    {plan === "Free" ? (
                      <Link
                        href={user ? "/dashboard" : "/sign-in"}
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    ) : user ? (
                      // <UpgradeButton />
                      <Button>Upgrade</Button>
                    ) : (
                      <Link
                        href="/sign-in"
                        className={buttonVariants({
                          className: "w-full",
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
};

export default Pricing;
