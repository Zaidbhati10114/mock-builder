"use client";
import React, { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";

import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";

import { useRouter } from "next/navigation";
import { ConvexError } from "convex/values";
import { useIsSubscribed } from "@/lib/useUserLimitstore";

import { Loader2 } from "lucide-react";

export const DeleteUserModal = () => {
  const router = useRouter();
  const deleteUser = useMutation(api.users.deleteUser);
  const [loading, setLoading] = useState(false);
  const { user: userDetails } = useIsSubscribed();
  const cancelSubscription = useAction(api.users.cancelSubscription);
  const deleteProject = useMutation(api.projects.deleteAllProjectsForUser);
  const [isOpen, setIsOpen] = React.useState(false);
  const user = useUser();

  const handleDelete = async () => {
    try {
      setLoading(true);
      // Delete the user via API

      const clerkId = user?.user?.id!;
      const { isPro, projectCount, resourceCount } = userDetails || {};

      // Cancel subscription if the user is Pro
      if (isPro) {
        const cancelResponse = await cancelSubscription({ clerkId });
        if (cancelResponse.success) {
          toast.success("Subscription cancelled successfully");
        } else {
          toast.error("Error cancelling subscription");
          return;
        }
      }

      const response = await fetch("/api/users", {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Error deleting user");
        return;
      }

      // Delete all projects and resources if they exist
      if (
        projectCount &&
        resourceCount &&
        projectCount > 0 &&
        resourceCount > 0
      ) {
        const deleteResponse = await deleteProject({ clerkId });
        if (deleteResponse.success) {
          toast.success("Projects and resources deleted successfully");
        } else {
          toast.error("Error deleting projects and resources");
          return;
        }
      }

      // Finally, delete the user
      const deleteUserResponse = await deleteUser({ clerkId });
      if (deleteUserResponse.success) {
        toast.success("User deleted successfully");
        setLoading(false);
        setIsOpen(false);

        router.push("/");
      } else {
        toast.error("Error deleting user");
      }
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError
          ? error.data
          : "An unexpected error occurred";
      toast.error(errorMessage);
      console.error(errorMessage);
    }
  };

  return (
    <div>
      <AlertDialog onOpenChange={(isOpen) => setIsOpen(isOpen)}>
        <AlertDialogTrigger asChild>
          <Button size={"xs"} variant="destructive">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              project and resources associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              disabled={loading}
              variant={"destructive"}
              onClick={() => handleDelete()}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : ""}
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
