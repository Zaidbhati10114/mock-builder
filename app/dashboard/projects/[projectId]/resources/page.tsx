"use client";
import BreadcrumbPageWrapper from "@/app/_components/BreaccrumbPageWrapper";
import Resources from "@/app/_components/Resources";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React from "react";

const ResourcesPage = ({
  params: { projectId },
}: {
  params: { projectId: Id<"projects"> };
}) => {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/projects", label: "Projects" },
    { href: `/dashboard/projects/${projectId}`, label: "{projectName}" },
    { href: `/dashboard/projects/${projectId}/resources`, label: "Resources" },
  ];
  return (
    <div>
      <BreadcrumbPageWrapper breadcrumbs={breadcrumbs} projectId={projectId}>
        <Resources projectId={projectId} />
      </BreadcrumbPageWrapper>
    </div>
  );
};

export default ResourcesPage;
