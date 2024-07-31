import JsonGeneratorForm from "@/app/_components/ResourceDataForm";
import React from "react";

const page = ({ params }: { params: { projectId: string } }) => {
  const projectId = params.projectId;
  return (
    <div>
      <JsonGeneratorForm id={projectId} />
    </div>
  );
};

export default page;
