"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/components/theme-providers";
import Sidebar from "../_components/Sidebar";
import Breadcrumbs from "../_components/Breadcrumbs";
import { AppLoader } from "../_components/AppLoader";
import { Menu } from "lucide-react";
import { UserNav } from "../_components/UserNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // 2-second delay
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <AppLoader />;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-slate-50 flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block fixed h-full">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-0 z-50 flex md:hidden transition-transform duration-300 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-64 h-full bg-gradient-to-b from-slate-900 to-slate-800">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
          {/* Desktop Header (visible at md+) */}
          <header className="hidden md:flex items-center justify-between w-full h-16 px-6 bg-white border-b">
            {/* Left side: you can put breadcrumbs, search, or page title */}
            <div className="flex items-center space-x-4">
              {/* optionally show breadcrumbs or small search */}
              <div className="hidden lg:block">
                <Breadcrumbs />
              </div>
            </div>

            {/* Right side: user nav */}
            <div className="flex items-center space-x-3">
              <UserNav />
            </div>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white shadow">
            <button onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-lg font-bold">AI Data Hub</h1>
            {/* Place UserNav (or a compact avatar) on the right */}
            <div>
              <UserNav />
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-8">
            {/* On desktop we already show breadcrumbs in the header; on small screens keep them here */}
            <div className="block md:hidden mb-4">
              <Breadcrumbs />
            </div>

            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
