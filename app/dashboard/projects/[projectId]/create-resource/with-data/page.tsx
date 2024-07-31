import Component from "@/app/_components/ResourceFormWithData";
import React from "react";

const page = ({ params }: { params: { projectId: string } }) => {
  const projectId = params.projectId;
  return (
    <div>
      <Component id={projectId} />
    </div>
  );
};

export default page;
