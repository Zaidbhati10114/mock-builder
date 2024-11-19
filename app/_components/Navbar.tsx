"use client";
import Link from "next/link";

import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { ArrowRight, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileNavLanding from "./mobile-nav-landing";
import { useEffect, useState } from "react";

const Navbar = () => {
  const user = useUser();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/dashboard" className="flex z-40 font-semibold">
            <FileJson className="mr-2 size-6" />
            <span>MockBuilder</span>
          </Link>
          {/* <MobileNavLanding isAuth={!!user} /> */}
          <div className=" items-center space-x-4 sm:flex">
            {user.isSignedIn ? (
              <>
                <Link
                  className={`flex items-center ${buttonVariants({ variant: "ghost", size: "sm" })} group`}
                  href={"/sign-in"}
                >
                  <button className="flex items-center">
                    Dashboard
                    <ArrowRight className="ml-1.5 h-5 w-5 transform transition-transform duration-300 ease-in-out group-hover:translate-x-1.5" />
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  className={`flex items-center ${buttonVariants({ variant: "ghost", size: "sm" })} group`}
                  href={"/sign-in"}
                >
                  <button className="flex items-center">
                    Sign in
                    <ArrowRight className="ml-1.5 h-5 w-5 transform transition-transform duration-300 ease-in-out group-hover:translate-x-1.5" />
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
