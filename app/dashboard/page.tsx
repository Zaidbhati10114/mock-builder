"use client";

import { useUser } from "@clerk/nextjs";

import BreadcrumbPageWrapper from "../_components/BreaccrumbPageWrapper";

import { Banner } from "../_components/Banner";
import OnboardingGuide from "../_components/OnBoardingGuide";

const DashboardPage = () => {
  const { user } = useUser();

  const dashboardBreadcrumbs = [{ href: "/dashboard", label: "Dashboard" }];

  return (
    <>
      <BreadcrumbPageWrapper breadcrumbs={dashboardBreadcrumbs}>
        {user && (
          <main className="flex flex-1 flex-col gap-4 p-4 lg:px-8">
            <OnboardingGuide />
          </main>
        )}
      </BreadcrumbPageWrapper>
    </>
  );
};

export default DashboardPage;
