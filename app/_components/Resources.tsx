"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-2xl font-bold">All Resources</h1>
        </div>

        <div>
          {/* Keep as Link if Create Resource is separate page; style it to match dashboard */}
          <Link href={`/dashboard/projects/${projectId}`}>
            <Button className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Resource
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full">
        <ul className="flex flex-col gap-6">
          {resource?.map(
            ({
              _id: id,
              resourceName,
              data,
              projectId: pid,
              live,
            }: resourceType) => (
              <ResourceDataCard
                initialLiveStatus={live}
                key={id}
                id={id}
                title={resourceName}
                data={data}
                projectId={pid}
              />
            )
          )}
        </ul>
      </div>

      {resource === undefined && <Loader />}

      {resource?.length === 0 && (
        <div className="flex w-full items-center justify-center">
          <Image
            src="/no-data.svg"
            alt="No resources"
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
