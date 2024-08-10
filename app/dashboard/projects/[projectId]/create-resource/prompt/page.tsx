import BreadcrumbPageWrapper from "@/app/_components/BreaccrumbPageWrapper";
import JsonGeneratorForm from "@/app/_components/ResourceDataForm";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";

const page = ({ params }: { params: { projectId: Id<"projects"> } }) => {
  const projectId = params.projectId;
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/projects", label: "Projects" },

    {
      href: `/dashboard/projects/${projectId}/create-resource/with-prompt`,
      label: "Generate with Prompt",
    },
  ];

  return (
    <>
      <BreadcrumbPageWrapper breadcrumbs={breadcrumbs} projectId={projectId}>
        <JsonGeneratorForm id={projectId} />
      </BreadcrumbPageWrapper>
    </>
  );
};

export default page;
