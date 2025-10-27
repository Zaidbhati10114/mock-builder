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
    const timer = setTimeout(() => setLoading(false), 2000);
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
      <div className="h-screen bg-slate-50 flex overflow-hidden">
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
        <div className="flex-1 md:ml-64 h-screen flex flex-col">
          {/* Desktop Header (visible at md+) */}
          <header className="hidden md:flex items-center justify-between w-full h-16 px-6 bg-white border-b flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block">
                <Breadcrumbs />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <UserNav />
            </div>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white shadow flex-shrink-0">
            <button onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-lg font-bold">AI Data Hub</h1>
            <div>
              <UserNav />
            </div>
          </div>

          {/* Page Content - Now with overflow control */}
          <main className="flex-1 overflow-y-auto">
            {/* Breadcrumbs for mobile */}
            <div className="block md:hidden p-4 pb-0">
              <Breadcrumbs />
            </div>

            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
