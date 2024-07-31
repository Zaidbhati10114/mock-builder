"use client";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React, { useEffect } from "react";
import ProjectCard from "./ProjectCard";
import { AddProject } from "./AddProjectModal";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { convertCreatedAt } from "@/lib/utils";
import { Loader } from "./Loader";
import Image from "next/image";
import Breadcrumbs from "./Breadcrumbs";
import { useBreadcrumbStore } from "@/lib/store";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

const Projects = () => {
  const { user } = useUser();
  //const { updateBreadcrumbs } = useBreadcrumbStore();

  const documents = [
    {
      id: "1",
      title: "Project1",
      createdAt: "2023-03-01",
    },
    {
      id: "2",
      title: "Project2",
      createdAt: "2023-03-01",
    },
    // Add more projects as needed
  ];

  const projects = useQuery(api?.projects?.getProjects, { clerkId: user?.id! });
  console.log("projects", projects);
  //const projects: any = [];

  return (
    <>
      <div className="container p-10 h-full overflow-y-auto scrollbar-hide">
        {projects ? (
          <div className="flex flex-col items-center mb-10 w-full gap-10 px-5">
            <div className="max-w-[730px] flex w-full justify-between items-center">
              <h3 className="">All Projects</h3>
              <AddProject />
            </div>
            <ul className="flex w-full flex-col gap-6 max-w-[730px]">
              {projects.map(
                ({ _id: id, projectName, _creationTime: createdAt }: any) => (
                  <ProjectCard
                    key={id}
                    id={id}
                    title={projectName}
                    createdAt={convertCreatedAt(createdAt)}
                  />
                )
              )}
            </ul>
          </div>
        ) : null}

        {projects === undefined && <Loader />}
        {projects?.length === 0 && (
          <div className="flex w-full items-center justify-center">
            <Image
              src="/no-data.svg"
              alt="Document"
              width={580}
              height={580}
              className="mx-auto"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Projects;
