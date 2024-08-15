"use client";
import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import Breadcrumbs from "../_components/Breadcrumbs";
import AppWrapper from "../AppWrapper";
import { useRouter } from "next/navigation";
import { AppLoader } from "../_components/AppLoader";
import { ThemeProvider } from "@/components/theme-providers";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();
  //const { signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2-second delay

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
      <AppWrapper>
        <div>
          <Breadcrumbs />
          {children}
        </div>
      </AppWrapper>
    </ThemeProvider>
  );
}
