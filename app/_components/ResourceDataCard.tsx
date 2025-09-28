"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { FileCode2, EyeOffIcon, EyeIcon, Trash2 } from "lucide-react";
import { DataViewer } from "./DataViewer";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@clerk/clerk-react";

interface ResourceDataCardProps {
  title: string;
  id: Id<"resources">;
  data: any;
  projectId: Id<"projects">;
  initialLiveStatus: boolean;
}

export const ResourceDataCard = ({
  title,
  id,
  data,
  projectId,
  initialLiveStatus,
}: ResourceDataCardProps) => {
  const deleteResource = useMutation(api.resources.deleteResource);
  const toggleResourceLive = useMutation(api.resources.toggleProjectLive);
  const user = useUser();

  const [live, setLive] = useState(initialLiveStatus);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteResource({ resourceId: id, clerkId: user?.user?.id! });
      toast.success("Resource deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError
          ? (error.data as string)
          : "Failed to delete Resource";
      toast.error(errorMessage);
    }
  };

  const handleToggle = async () => {
    if (live) {
      try {
        await toggleResourceLive({ projectId });
        setLive(false);
        toast.success("Resource is now private");
      } catch (error) {
        const errorMessage =
          error instanceof ConvexError ? (error.data as string) : "";
        toast.error(errorMessage);
      }
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmToggle = async () => {
    try {
      await toggleResourceLive({ projectId });
      setLive(true);
      setShowConfirmDialog(false);
      toast.success("Resource is now live");
    } catch (error) {
      toast.error("Error making resource public");
    }
  };

  return (
    <li>
      <Card className="w-full bg-white rounded-xl p-3 sm:p-5 shadow-md border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: icon + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-md p-2 bg-slate-50 flex-shrink-0">
              <FileCode2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-medium text-slate-900 truncate">
                {title}
              </p>
            </div>
          </div>

          {/* Right: three buttons aligned */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:ml-4">
            {/* View Data (keep DataViewer default button) */}
            <div className="w-full sm:w-auto">
              <DataViewer id={id} data={data} name={title} live={live} />
            </div>

            {/* Make Live / Make Private */}
            <Button
              size="sm"
              onClick={handleToggle}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              {live ? (
                <>
                  <EyeOffIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Make Private</span>
                </>
              ) : (
                <>
                  <EyeIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Make Live</span>
                </>
              )}
            </Button>

            {/* Delete */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="w-full sm:w-auto flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Delete</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirm dialog for making live */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make Resource Live?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="px-6 pb-6 pt-2 text-sm text-slate-700">
            This action will make your resource public and accessible via a
            share link. Are you sure you want to continue?
          </div>
          <div className="flex items-center justify-end gap-2 px-6 pb-6">
            <AlertDialogCancel asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                size="sm"
                onClick={handleConfirmToggle}
                className="bg-blue-600 text-white"
              >
                Continue
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
};
