"use client";
import BreadcrumbPageWrapper from "@/app/_components/BreaccrumbPageWrapper";
import ResourceCard from "@/app/_components/ResourceCard";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Braces, FileJson } from "lucide-react";
import React, { useEffect, useState } from "react";

const ProjectIdPage = ({
  params,
}: {
  params: { projectId: Id<"projects"> };
}) => {
  const { projectId } = params;
  const [openModal, setOpenModal] = useState(false);
  const user = useUser();
  const user_info = useQuery(api?.users.getUserById, {
    clerkId: user?.user?.id!,
  });

  const breadcrumbs = [
    { href: "/dashboard/projects", label: "Projects" },
    { href: `/dashboard/projects/${projectId}`, label: "Choose a Type" },
  ];

  return (
    <BreadcrumbPageWrapper breadcrumbs={breadcrumbs} projectId={projectId}>
      <div className="p-4 mt-10 flex flex-col space-y-4 gap-4 md:flex-row md:justify-center md:space-y-0 md:space-x-4">
        {!user_info?.isPro && user_info?.resourceCount! >= 2 ? (
          <div>
            <p className="mb-4">
              Free tier only allows 2 projects. Upgrade to create more!
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Upgrade to Pro
            </button>
          </div>
        ) : (
          <>
            <ResourceCard
              route="prompt"
              icon={Braces}
              title="Generate Data with Your Input Prompt with AI"
              description="This tool helps beginners generate data based on their input prompts using AI technology."
              buttonText="Generate JSON Data"
              badgeText="Beginner"
              projectId={projectId}
            />
            <ResourceCard
              route="with-data"
              icon={FileJson}
              title="Generate JSON Data with Specific Data"
              description="This tool is designed for pro developers to generate JSON data based on the available parametes on this application."
              buttonText="Generate JSON Data"
              badgeText="Pro"
              projectId={projectId}
            />
          </>
        )}
      </div>
    </BreadcrumbPageWrapper>
  );
};

export default ProjectIdPage;
