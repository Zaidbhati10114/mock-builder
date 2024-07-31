// app/_components/BreadcrumbPageWrapper.tsx
"use client";

import React, { useEffect } from "react";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useBreadcrumbStore } from "@/lib/store";

interface BreadcrumbItem {
  href: string;
  label: string;
}

interface BreadcrumbPageWrapperProps {
  children: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
  projectId?: Id<"projects">;
}

const BreadcrumbPageWrapper: React.FC<BreadcrumbPageWrapperProps> = ({
  children,
  breadcrumbs,
  projectId,
}) => {
  const updateBreadcrumbs = useBreadcrumbStore(
    (state: any) => state.updateBreadcrumbs
  );
  const project = useQuery(
    api.projects.getProject,
    projectId ? { id: projectId } : "skip"
  );

  useEffect(() => {
    if (projectId && project) {
      const updatedBreadcrumbs = breadcrumbs.map((crumb) =>
        crumb.label === "{projectName}"
          ? { ...crumb, label: project.projectName }
          : crumb
      );
      updateBreadcrumbs(updatedBreadcrumbs);
    } else {
      updateBreadcrumbs(breadcrumbs);
    }
  }, [updateBreadcrumbs, breadcrumbs, project, projectId]);

  return <>{children}</>;
};

export default BreadcrumbPageWrapper;
