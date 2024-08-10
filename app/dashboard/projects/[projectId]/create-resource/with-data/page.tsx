import BreadcrumbPageWrapper from "@/app/_components/BreaccrumbPageWrapper";
import Component from "@/app/_components/ResourceFormWithData";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";

const page = ({ params }: { params: { projectId: Id<"projects"> } }) => {
  const projectId = params.projectId;
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/projects", label: "Projects" },

    {
      href: `/dashboard/projects/${projectId}/create-resource/with-data`,
      label: "Generate with Data",
    },
  ];
  return (
    <div>
      <BreadcrumbPageWrapper breadcrumbs={breadcrumbs} projectId={projectId}>
        <Component id={projectId} />
      </BreadcrumbPageWrapper>
    </div>
  );
};

export default page;
