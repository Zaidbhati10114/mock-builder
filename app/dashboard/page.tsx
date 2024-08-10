"use client";

import { useUser, useClerk } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BreadcrumbPageWrapper from "../_components/BreaccrumbPageWrapper";
import { AppLoader } from "../_components/AppLoader";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import { toast } from "sonner";

const DashboardPage = () => {
  const [error, setError] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const upgrade = useAction(api.stripe.pay);
  const get_user = useQuery(api.users.getUser);

  const dashboardBreadcrumbs = [{ href: "/dashboard", label: "Dashboard" }];

  return (
    <>
      <BreadcrumbPageWrapper breadcrumbs={dashboardBreadcrumbs}>
        {user && (
          <main className="flex flex-1 flex-col gap-4 p-4 lg:px-8">
            <h1>Dashboard</h1>
            {!get_user || (!user && <Button>Sign In</Button>)}
            {}
          </main>
        )}
      </BreadcrumbPageWrapper>
    </>
  );
};

export default DashboardPage;
