import { FileJson2 } from "lucide-react";
import Image from "next/image";

export const AppLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <FileJson2 className="size-20 animate-spin fill-green-300" />
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
