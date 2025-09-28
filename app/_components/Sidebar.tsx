"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { redirect, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { primaryNavItems } from "@/lib";

import ProgressBar from "./ProgressBar";
import JsonProgressBar from "./JsonProgressBar";
import { Badge } from "@/components/ui/badge";
import { useIsSubscribed } from "@/lib/useUserLimitstore";

export default function Sidebar() {
  const { user: userdetails, MAX_PROJECTS } = useIsSubscribed();
  const { user } = useUser();
  if (!user) redirect("/sign-in");

  const [navItems] = useState([...primaryNavItems]);
  const pathname = usePathname();

  const isActive = (link: string) => {
    if (link === "/dashboard") return pathname === link;
    return pathname.startsWith(link);
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 h-full shadow-2xl relative hidden md:block">
      {/* Logo + Title */}
      <div className="flex items-center space-x-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Mock Builder</h1>
          <p className="text-slate-400 text-sm">Smart Data Generation</p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline">{userdetails?.isPro ? "Pro" : "Free"}</Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map(({ name, icon, link }, idx) => (
          <Link key={idx} href={link}>
            <div
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive(link)
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                  : "hover:bg-slate-700/50"
              )}
            >
              <div className="flex items-center space-x-3">
                <span className="w-5 h-5">{icon}</span>
                <span className="font-medium">{name}</span>
              </div>
            </div>
          </Link>
        ))}
      </nav>

      {/* Progress Bars */}
      <div className="absolute bottom-4 left-0 right-0 px-4 space-y-4">
        <ProgressBar max_projects={MAX_PROJECTS || 2} />
        <JsonProgressBar />
      </div>
    </div>
  );
}
