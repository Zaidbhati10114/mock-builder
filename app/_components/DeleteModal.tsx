"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
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
import { useMutation } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { ConvexError } from "convex/values";

interface DeleteModalProps {
  id: Id<"projects">;
  buttonVariant?: "destructive" | "outline";
  buttonSize?: "sm" | "xs";
  className?: string;
}

const DeleteModal = ({
  id,
  buttonVariant = "outline",
  buttonSize = "sm",
  className = "",
}: DeleteModalProps) => {
  const deleteProject = useMutation(api.projects.deleteProject);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const user = useUser();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject({ id, clerkId: user.user?.id! });
      toast.success("Project deleted successfully");
      setIsOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError
          ? (error.data as string)
          : "Failed to delete project";
      toast.error(errorMessage);
      console.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size={buttonSize} variant={buttonVariant} className={className}>
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-gray-900">
            Delete Project?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-600 mt-2">
            This action cannot be undone. This will permanently delete your
            project and all its associated resources including generated data,
            uploaded files, and configuration settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 mt-6">
          <AlertDialogCancel
            disabled={isDeleting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 flex-1 sm:flex-none"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              "Delete Project"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteModal;
