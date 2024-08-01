"use client";

import { useUser, useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BreadcrumbPageWrapper from "../_components/BreaccrumbPageWrapper";

const DashboardPage = () => {
  // const { user } = useUser();
  // const { signOut } = useClerk();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!user) {
  //     router.push("/sign-in");
  //   }
  // }, [user, router]);

  // const handleSignOut = () => {
  //   signOut().then(() => {
  //     router.push("/sign-in");
  //   });
  // };

  const dashboardBreadcrumbs = [{ href: "/dashboard", label: "Dashboard" }];

  return (
    <BreadcrumbPageWrapper breadcrumbs={dashboardBreadcrumbs}>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:px-8">
        <h1>Dashboard</h1>
        {/* <Button size="sm" variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button> */}
      </main>
    </BreadcrumbPageWrapper>
  );
};

export default DashboardPage;
