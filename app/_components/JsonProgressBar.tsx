"use client";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import React from "react";

const JsonProgressBar = () => {
  const user = useUser();
  const user_id = user?.user?.id;
  const get_user = useQuery(api.users.getUserById, { clerkId: user_id! });

  // Assuming the maximum number of projects is 2
  const maxProjects = get_user?.jsonGenerationCount || 2;
  const json_count = get_user?.jsonGenerationCount || 1000;

  // Calculate the progress value as a percentage
  const progressValue = (json_count / maxProjects) * 100;

  return (
    <div className="space-y-3">
      <Progress value={progressValue} />
      <h2>
        <strong>{json_count}</strong> credits JSONs generated so far used
      </h2>
    </div>
  );
};

export default JsonProgressBar;
