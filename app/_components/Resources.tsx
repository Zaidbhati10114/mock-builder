"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import Image from "next/image";
import { Loader } from "./Loader";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ResourceDataCard } from "./ResourceDataCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { resourceType } from "@/types";

interface ResourceProps {
  projectId: Id<"projects">;
}

const Resources = ({ projectId }: ResourceProps) => {
  const router = useRouter();
  const resource = useQuery(api.resources.getResources, { projectId });

  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="container p-10 h-full overflow-y-auto scrollbar-hide">
      {resource ? (
        <div className="flex flex-col items-center mb-10 w-full gap-10 px-5">
          <div className="max-w-[730px] flex w-full justify-between items-center">
            <h3 className="">All Resources</h3>
            <Link href={`/dashboard/projects/${projectId}`}>
              <Button>
                <Plus className="h-4 w-4" />
                Create Resource
              </Button>
            </Link>
          </div>
          <ul className="flex w-full flex-col gap-6 max-w-[730px]">
            {resource?.map(
              ({
                _id: id,
                resourceName,
                data,
                projectId,
                live,
              }: resourceType) => (
                <ResourceDataCard
                  initialLiveStatus={live}
                  key={id}
                  id={id}
                  title={resourceName}
                  data={data}
                  projectId={projectId}
                />
              )
            )}
          </ul>
        </div>
      ) : null}

      {resource === undefined && <Loader />}
      {resource?.length === 0 && (
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
  );
};

export default Resources;
{
  /* <div>{!resource || (resource === undefined && <h1>No resource</h1>)}</div> */
}
