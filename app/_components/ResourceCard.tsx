"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ResourceCardProps {
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
}: ResourceCardProps) => {
  return (
    <div className="relative bg-white rounded-2xl p-8 md:p-10 lg:p-12 shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col h-full min-h-[350px] md:min-h-[380px] lg:min-h-[420px]">
      {/* Badge */}
      <div className="absolute top-5 right-5">
        <Badge
          variant={badgeText === "Pro" ? "default" : "secondary"}
          className="text-xs px-3 py-1 font-medium"
        >
          {badgeText}
        </Badge>
      </div>

      {/* Content Container */}
      <div className="flex flex-col items-center text-center flex-grow justify-center">
        {/* Icon */}
        <div className="mb-6 p-5 md:p-6 bg-gray-50 rounded-full">
          <Icon
            className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 text-gray-700"
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl lg:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 leading-tight px-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base lg:text-base text-gray-600 leading-relaxed mb-6 md:mb-7 lg:mb-8 flex-grow px-4 max-w-lg">
          {description}
        </p>

        {/* Button */}
        <Link
          href={`/dashboard/projects/${projectId}/create-resource/${route}`}
          className="w-full max-w-sm"
        >
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5 md:py-6 text-sm md:text-base rounded-xl transition-colors">
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
