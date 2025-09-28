"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

import Link from "next/link";

import React from "react";

interface ResourceCardTwoProps {
  title: string;
  description: string;
  buttonText: string;
  badgeText: string;
  projectId: string;
  icon: LucideIcon;
  route: string;
}

const ResourceCard = ({
  title,
  description,
  buttonText,
  badgeText,
  projectId,
  icon: Icon,
  route,
}: ResourceCardTwoProps) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="absolute top-2 left-2">
        <Badge>{badgeText}</Badge>
      </div>
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center justify-center text-center">
        <Icon className="h-10 w-10 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">{description}</p>

        <Link
          href={`/dashboard/projects/${projectId}/create-resource/${route}`}
        >
          <Button>{buttonText}</Button>
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
