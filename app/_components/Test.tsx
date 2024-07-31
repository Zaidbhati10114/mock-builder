"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";

const Test = () => {
  const tasks = useQuery(api.tasks.get);
  return (
    <div>{tasks?.map((task, index) => <div key={index}>{task.text}</div>)}</div>
  );
};

export default Test;
