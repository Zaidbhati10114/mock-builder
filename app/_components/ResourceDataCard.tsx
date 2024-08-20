"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { FileCode2, CopyIcon } from "lucide-react";
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const user = useUser();

  const toggleResourceLive = useMutation(api.resources.toggleProjectLive);
  const [live, setLive] = useState(initialLiveStatus);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

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
      setShowShareDialog(true);
    } catch (error) {
      toast.error("Error making resource public");
    }
  };

  const handleCopyLink = () => {
    // Replace this with the actual link generation logic
    const link = `https://proficient-opossum-116.convex.site/get-resource?resourceID=${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  return (
    <Card>
      <li
        key={id}
        className="flex flex-col  sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg bg-doc bg-cover p-3 sm:p-5 shadow-xl"
      >
        <div className="flex flex-1 items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
          <div className="rounded-md p-2">
            <FileCode2 className="w-6 h-6 fill-black" />
          </div>
          <div className="space-y-1">
            <p className="line-clamp-1 text-light text-lg">{title}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DataViewer id={id} data={data} name={title} live={live} />
          <Button variant="secondary" size={"xs"} onClick={handleToggle}>
            {live ? "Make Private" : "Make Public"}
          </Button>
          {}
          <Button variant="destructive" size={"xs"} onClick={handleDelete}>
            Delete
          </Button>
        </div>

        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will make your resource public. Are you sure you
                want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmToggle}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <AlertDialogContent className="sm:max-w-[525px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Share preset</AlertDialogTitle>
              <AlertDialogDescription>
                Anyone who has this link and an account will be able to view
                this.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center space-x-2 pt-4">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={`https://proficient-opossum-116.convex.site/get-resource?resourceID=${id}`}
                  readOnly
                  className="h-9"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-3"
                onClick={handleCopyLink}
              >
                <span className="sr-only">Copy</span>
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowShareDialog(false)}>
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </li>
    </Card>
  );
};
