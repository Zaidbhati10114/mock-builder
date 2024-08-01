"use client";
import Link from "next/link";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { redirect, usePathname } from "next/navigation";
import { RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { primaryNavItems } from "@/lib";
import { Loader } from "./Loader";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ProgressBar from "./ProgressBar";
import JsonProgressBar from "./JsonProgressBar";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Sidebar() {
  const user = useUser();
  if (!user) redirect("/sign-in");
  const user_info = user?.user;
  const getUser = useQuery(api.users.getUserById, { clerkId: user_info?.id! });
  const [navItems, setNavItems] = useState([...primaryNavItems]);
  const pathname = usePathname();

  const isActive = (link: string) => {
    if (link === "/dashboard") {
      return pathname === link;
    }
    return pathname.startsWith(link);
  };

  const shouldShowUpgradeCard =
    getUser?.jsonGenerationCount! > 1000 && getUser?.projectCount === 2;

  return (
    <div className="hidden h-screen border-r bg-muted/40 md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          {!UserButton && <Loader />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                <EllipsisVertical className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuLabel className="cursor-pointer">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        {shouldShowUpgradeCard ? (
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="p-4">
              <ProgressBar />
            </div>
            <div className="p-4">
              <JsonProgressBar />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
