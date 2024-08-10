"use client";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import React from "react";

interface ProgressBarProps {
  max_projects: number;
}

const ProgressBar = ({ max_projects }: ProgressBarProps) => {
  const user = useUser();
  const user_id = user?.user?.id;
  const get_user = useQuery(api.users.getUserById, { clerkId: user_id! });

  // Assuming the maximum number of projects is 2

  const projectCount = get_user?.projectCount || 0;

  // Calculate the progress value as a percentage
  const progressValue = (projectCount / max_projects) * 100;

  return (
    <div className="space-y-3">
      <Progress value={progressValue} />
      <h2>
        <strong>{projectCount}</strong> out of {max_projects} projects used
      </h2>
    </div>
  );
};

export default ProgressBar;
