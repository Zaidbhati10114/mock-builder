import BreadcrumbPageWrapper from "@/app/_components/BreaccrumbPageWrapper";
import Projects from "@/app/_components/Projects";
import React from "react";

const page = () => {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/projects", label: "Projects" },
  ];

  return (
    <BreadcrumbPageWrapper breadcrumbs={breadcrumbs}>
      <Projects />
    </BreadcrumbPageWrapper>
  );
};

export default page;
