"use client";

import { useUser } from "@clerk/nextjs";
import OnboardingGuide from "../_components/OnBoardingGuide";
import BreadcrumbPageWrapper from "../_components/BreaccrumbPageWrapper";
import {
  Activity,
  Database,
  FileText,
  FolderOpen,
  Sparkles,
} from "lucide-react";

const DashboardPage = () => {
  const { user } = useUser();
  const dashboardBreadcrumbs = [{ href: "/dashboard", label: "Dashboard" }];

  return (
    <>
      <BreadcrumbPageWrapper breadcrumbs={dashboardBreadcrumbs}>
        {user && (
          <main className="flex flex-1 flex-col gap-4">
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Welcome Back!
                  </h1>
                  <p className="text-slate-600 mt-1 sm:mt-2">
                    Generate AI-powered datasets with ease
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl flex items-center space-x-2 w-fit">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">
                    System Active
                  </span>
                </div>
              </div>

              {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  {
                    title: "Total Projects",
                    value: "12",
                    change: "+2 this week",
                    icon: FolderOpen,
                    color: "blue",
                  },
                  {
                    title: "Data Generated",
                    value: "1.2K",
                    change: "+156 today",
                    icon: Database,
                    color: "green",
                  },
                  {
                    title: "Credits Used",
                    value: "710",
                    change: "71% of limit",
                    icon: Sparkles,
                    color: "purple",
                  },
                  {
                    title: "Active Resources",
                    value: "28",
                    change: "+4 recent",
                    icon: FileText,
                    color: "orange",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-${stat.color}-100`}
                      >
                        <stat.icon
                          className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600`}
                        />
                      </div>
                      <span className="text-xs sm:text-sm text-green-600 font-medium">
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3 sm:mt-4">
                      {stat.value}
                    </h3>
                    <p className="text-slate-600 text-sm">{stat.title}</p>
                  </div>
                ))}
              </div> */}

              <div className="bg-white w-full max-h-full rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-100">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
                  How AI Data Hub Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg mx-auto mb-3 sm:mb-4">
                        {item.step}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        )}
      </BreadcrumbPageWrapper>
    </>
  );
};

export default DashboardPage;
