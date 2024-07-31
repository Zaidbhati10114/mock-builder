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

interface DeleteModalProps {
  id: Id<"projects">;
}

const DeleteModal = ({ id }: DeleteModalProps) => {
  const deleteProject = useMutation(api.projects.deleteProject);
  const [isOpen, setIsOpen] = React.useState(false);
  const user = useUser();
  const handleDelete = async () => {
    try {
      await deleteProject({ id: id, clerkId: user.user?.id! });
      toast("Project deleted");
      setIsOpen(false);
    } catch (error) {
      console.log("errror");
    }
  };
  return (
    <div>
      <AlertDialog onOpenChange={(isOpen) => setIsOpen(isOpen)}>
        <AlertDialogTrigger asChild>
          <Button size={"xs"} className="ml-2" variant="destructive">
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
            <AlertDialogAction onClick={() => handleDelete()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteModal;
