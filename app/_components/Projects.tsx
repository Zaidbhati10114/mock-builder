"use client";
import React from "react";
import ProjectCard from "./ProjectCard";
import { AddProject } from "./AddProjectModal";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { convertCreatedAt } from "@/lib/utils";
import { Loader } from "./Loader";
import Image from "next/image";

import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { projectType } from "@/types";

const Projects = () => {
  const { user } = useUser();
  const router = useRouter();
  if (!user) {
    router.push("/sign-in");
  }

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
  //console.log("projects", projects);
  //const projects: any = [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">All Projects</h1>
          <AddProject />
        </div>

        <div className="w-full">
          <div className="flex flex-col gap-6">
            {projects?.map(
              ({
                _id: id,
                projectName,
                _creationTime: createdAt,
              }: projectType) => (
                <ProjectCard
                  key={id}
                  id={id}
                  title={projectName}
                  createdAt={convertCreatedAt(createdAt)}
                />
              )
            )}
          </div>
        </div>

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
