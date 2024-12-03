"use client";
import Link from "next/link";
import { FileJson } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { redirect, usePathname } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { primaryNavItems } from "@/lib";

import ProgressBar from "./ProgressBar";
import JsonProgressBar from "./JsonProgressBar";
import { Badge } from "@/components/ui/badge";
import { useIsSubscribed } from "@/lib/useUserLimitstore";
import { Separator } from "@/components/ui/separator";

export default function Sidebar() {
  const { user: userdetails, MAX_PROJECTS } = useIsSubscribed();
  //console.log(isPro);
  const user = useUser();
  if (!user) redirect("/sign-in");
  const [navItems, setNavItems] = useState([...primaryNavItems]);
  const pathname = usePathname();

  const isActive = (link: string) => {
    if (link === "/dashboard") {
      return pathname === link;
    }
    return pathname.startsWith(link);
  };

  return (
    <div className="hidden h-screen border-r bg-muted/40 md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileJson className="h-6 w-6" />
            <span className="">Mock Builder</span>
          </Link>

          {/* {!(<UserButton />) && <Loader />} */}
          {userdetails?.isPro ? (
            <div className="rounded-full">
              <Badge className="mt-5 ml-1" variant={"outline"}>
                Pro
              </Badge>
            </div>
          ) : (
            <div className="rounded-full">
              <Badge className="mt-5 ml-1" variant={"outline"}>
                Free
              </Badge>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-1 text-sm font-medium lg:px-4">
          {navItems.map(({ name, icon, link }, idx) => (
            <div key={idx}>
              <div className={cn("flex items-center lg:w-full")}>
                <div
                  className={cn(
                    "flex items-center text-left lg:gap-3 rounded-lg py-2 transition-all hover:text-primary justify-between w-full",
                    isActive(link)
                      ? "active rounded-lg bg-primary/10 text-primary transition-all hover:text-primary"
                      : "text-foreground"
                  )}
                >
                  <Link
                    key={idx}
                    href={link}
                    className={cn(
                      "flex items-center text-left gap-5 px-2 rounded-xl transition-all hover:text-primary w-full"
                    )}
                  >
                    <div className="flex gap-4 items-center w-full">
                      <div className="flex gap-2 items-center">
                        <p className="flex text-base text-left">{icon}</p>
                        <p className="text-lg">{name}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4">
          <ProgressBar max_projects={MAX_PROJECTS || 2} />
        </div>
        <div className="p-4">
          <JsonProgressBar />
        </div>
      </div>
    </div>
  );
}
