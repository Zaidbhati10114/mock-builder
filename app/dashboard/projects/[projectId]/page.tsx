"use client";
import BreadcrumbPageWrapper from "@/app/_components/BreaccrumbPageWrapper";
import ResourceCard from "@/app/_components/ResourceCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Braces, FileJson, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const ProjectNotFoundCard = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 p-8 rounded-lg text-center mt-10">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-700 mb-4">
        Project Not Found
      </h2>
      <p className="text-red-600 mb-6">
        The project you are trying to access has been deleted or no longer
        exists.
      </p>
      <Button
        onClick={() => router.push("/dashboard/projects")}
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        Create New Project
      </Button>
    </div>
  );
};

const ProjectIdPage = ({
  params,
}: {
  params: { projectId: Id<"projects"> };
}) => {
  const { projectId } = params;
  const router = useRouter();
  const user = useUser();

  const user_info = useQuery(api?.users.getUserById, {
    clerkId: user?.user?.id!,
  });

  const project = useQuery(api.projects.getProject, { id: projectId });

  // If project is not found, render the not found card
  if (project === null) {
    return <ProjectNotFoundCard />;
  }

  const breadcrumbs = [
    { href: "/dashboard/projects", label: "Projects" },
    { href: `/dashboard/projects/${projectId}`, label: "Choose a Type" },
  ];

  return (
    <BreadcrumbPageWrapper breadcrumbs={breadcrumbs} projectId={projectId}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        {!user_info?.isPro && user_info?.resourceCount! >= 2 ? (
          <div className="max-w-2xl mx-auto text-center bg-blue-50 border border-blue-200 rounded-2xl p-8 md:p-10">
            <p className="text-lg md:text-xl text-gray-700 mb-6">
              Free tier only allows 2 projects. Upgrade to create more!
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold">
              Upgrade to Pro
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10 max-w-[1400px] mx-auto">
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
              description="This tool is designed for pro developers to generate JSON data based on the available parameters on this application."
              buttonText="Generate JSON Data"
              badgeText="Pro"
              projectId={projectId}
            />
          </div>
        )}
      </div>
    </BreadcrumbPageWrapper>
  );
};

export default ProjectIdPage;
