import BreadcrumbPageWrapper from "@/app/_components/BreaccrumbPageWrapper";
import Settings from "@/app/_components/Settings";
import React from "react";

const page = () => {
  const settingsBreadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/settings", label: "Settings" },
  ];
  return (
    <BreadcrumbPageWrapper breadcrumbs={settingsBreadcrumbs}>
      <Settings />
    </BreadcrumbPageWrapper>
  );
};

export default page;
