import { Card } from "@/components/ui/card";
import { FileIcon, Trash2, Database } from "lucide-react";
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
    <Card className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="rounded-md p-2 flex-shrink-0">
            <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-black" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Created about {createdAt}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:ml-4 sm:flex-shrink-0">
          <Link href={`/dashboard/projects/${id}`} className="w-full sm:w-auto">
            <Button size="sm" variant="secondary" className="w-full sm:w-auto">
              Generate Data
            </Button>
          </Link>
          <Link
            href={`/dashboard/projects/${id}/resources`}
            className="w-full sm:w-auto"
          >
            <Button
              size="sm"
              className="w-full sm:w-auto bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
            >
              <Database className="w-4 h-4 mr-2" />
              Resources
            </Button>
          </Link>
          <DeleteModal
            id={id}
            buttonSize="sm"
            buttonVariant="outline"
            className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          />
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
