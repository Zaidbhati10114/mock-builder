import Link from "next/link";

import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { ArrowRight, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileNavLanding from "./mobile-nav-landing";

const Navbar = () => {
  const user = useUser();
  console.log(user.isLoaded);

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/dashboard" className="flex z-40 font-semibold">
            <FileJson className="mr-2 size-6" />
            <span>MockBuilder</span>
          </Link>
          <MobileNavLanding isAuth={!!user} />
          <div className="hidden items-center space-x-4 sm:flex">
            {user.isSignedIn ? (
              <>
                <Link
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                  href={"/dashboard"}
                >
                  <button>Dashboard</button>
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                  href={"/sign-in"}
                >
                  <button>Sign in</button>
                  <ArrowRight className="ml-1.5 h-5 w-5" />
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
