"use client";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  CircleUser,
  Home,
  LineChart,
  Menu,
  Moon,
  Package2,
  Search,
  ShoppingCart,
  Sun,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { primaryNavItems } from "@/lib";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import ProgressBar from "./ProgressBar";
import JsonProgressBar from "./JsonProgressBar";

const MobileNav = () => {
  const { setTheme } = useTheme();
  const [navItems, setNavItems] = useState([...primaryNavItems]);
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isActive = (link: string) => {
    if (link === "/dashboard") {
      return pathname === link;
    }
    return pathname.startsWith(link);
  };

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
                onClick={() => setIsSheetOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
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
                          onClick={handleLinkClick}
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
              <div className="mt-auto">
                <div className="p-4">
                  <ProgressBar />
                </div>
                <div className="p-4">
                  <JsonProgressBar />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search Projects..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
      </div>
    </div>
  );
};

export default MobileNav;
