"use client";

import { useUser } from "@clerk/nextjs";
import BreadcrumbPageWrapper from "../_components/BreaccrumbPageWrapper";
import { Activity } from "lucide-react";

const DashboardPage = () => {
  const { user } = useUser();
  const dashboardBreadcrumbs = [{ href: "/dashboard", label: "Dashboard" }];

  return (
    <BreadcrumbPageWrapper breadcrumbs={dashboardBreadcrumbs}>
      {user && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-5xl">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Welcome Back!
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Generate AI-powered datasets with ease
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 w-fit shadow-sm">
              <Activity className="w-4 h-4" />
              <span className="font-medium text-sm">System Active</span>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6">
              How AI Data Hub Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  step: "1",
                  title: "Create Project",
                  description:
                    "Start by creating a new project and defining your data requirements.",
                },
                {
                  step: "2",
                  title: "Generate Data",
                  description:
                    "Our AI algorithms generate high-quality, relevant datasets based on your specifications.",
                },
                {
                  step: "3",
                  title: "Manage Resources",
                  description:
                    "Organize, share, and manage your generated data resources with powerful tools.",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-base">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </BreadcrumbPageWrapper>
  );
};

export default DashboardPage;
