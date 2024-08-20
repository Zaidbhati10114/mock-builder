import { Card } from "@/components/ui/card";
import { FileIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import DeleteModal from "./DeleteModal";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  id: Id<"projects">;
  title: string;
  createdAt?: string;
}

const ProjectCard = ({ id, title, createdAt }: ProjectCardProps) => {
  return (
    <Card className="w-full space-y-4">
      <li
        key={id}
        className="flex flex-col  sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg bg-doc bg-cover p-3 sm:p-5 shadow-xl"
      >
        <div className="flex flex-1 items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
          <div className="rounded-md p-2">
            <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-black" />
          </div>
          <div className="space-y-1 flex-1">
            <p className="line-clamp-1 text-light text-base sm:text-lg">
              {title}
            </p>
            <p className="text-xs sm:text-sm text-light">
              Created about {createdAt}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href={`/dashboard/projects/${id}`} className="w-full sm:w-auto">
            <Button
              size={"xs"}
              variant={"secondary"}
              className="w-full sm:w-auto"
            >
              Create Test
            </Button>
          </Link>
          <Link
            href={`/dashboard/projects/${id}/resources`}
            className="w-full sm:w-auto"
          >
            <Button
              variant={"secondary"}
              size={"xs"}
              className="w-full sm:w-auto"
            >
              Resources
            </Button>
          </Link>
          <DeleteModal id={id} />
        </div>
      </li>
    </Card>
  );
};

export default ProjectCard;
