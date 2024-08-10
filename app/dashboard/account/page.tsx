import BreadcrumbPageWrapper from "@/app/_components/BreaccrumbPageWrapper";
import UserAccount from "@/app/_components/UserAccount";
import React from "react";

const page = () => {
  const settingsBreadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/account", label: "Account" },
  ];
  return (
    <BreadcrumbPageWrapper breadcrumbs={settingsBreadcrumbs}>
      <UserAccount />
    </BreadcrumbPageWrapper>
  );
};

export default page;
