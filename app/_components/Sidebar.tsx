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
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-full shadow-2xl flex flex-col">
      {/* Logo + Title - Fixed at top */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Mock Builder</h1>
            <p className="text-slate-400 text-xs">Smart Data Generation</p>
          </div>
        </div>
        <div className="w-full px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600 text-center">
          <span className="text-xs font-medium text-white">
            {userdetails?.isPro ? "✨ Pro Plan" : "🆓 Free Plan"}
          </span>
        </div>
      </div>

      {/* Navigation - Scrollable area */}
      <nav className="flex-1 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="space-y-2 py-2">
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
                  <span className="w-5 h-5 flex-shrink-0">{icon}</span>
                  <span className="font-medium text-sm">{name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Progress Bars - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 pt-2 space-y-3 border-t border-slate-700/50">
        <ProgressBar max_projects={MAX_PROJECTS || 2} />
        <JsonProgressBar />
      </div>
    </div>
  );
}
