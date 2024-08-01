"use client";

import { useUser, useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import BreadcrumbPageWrapper from "../_components/BreaccrumbPageWrapper";
import { AppLoader } from "../_components/AppLoader";

const DashboardPage = () => {
  const { user } = useUser();
  if (!user) {
    redirect("/sign-in");
  }

  const dashboardBreadcrumbs = [{ href: "/dashboard", label: "Dashboard" }];

  return (
    <>
      <BreadcrumbPageWrapper breadcrumbs={dashboardBreadcrumbs}>
        {user && (
          <main className="flex flex-1 flex-col gap-4 p-4 lg:px-8">
            <h1>Dashboard</h1>
          </main>
        )}
      </BreadcrumbPageWrapper>
    </>
  );
};

export default DashboardPage;
