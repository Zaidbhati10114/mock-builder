import BreadcrumbPageWrapper from "@/app/_components/BreaccrumbPageWrapper";
import JsonGeneratorForm from "@/app/_components/ResourceDataForm";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";

const page = ({ params }: { params: { projectId: Id<"projects"> } }) => {
  const projectId = params.projectId;
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/projects", label: "Projects" },
    { href: `/dashboard/projects/${projectId}`, label: "{projectName}" },
    {
      href: `/dashboard/projects/${projectId}/create-resource/with-prompt`,
      label: "Generate with Prompt",
    },
  ];

  return (
    <BreadcrumbPageWrapper breadcrumbs={breadcrumbs} projectId={projectId}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Generate Data with AI Prompt
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Describe your data needs and let AI generate structured JSON for you
          </p>
        </div>

        <JsonGeneratorForm id={projectId} />
      </div>
    </BreadcrumbPageWrapper>
  );
};

export default page;
