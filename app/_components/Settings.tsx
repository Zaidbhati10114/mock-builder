"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { DeleteUserModal } from "./UserDeleteModal";

const Settings = () => {
  return (
    <div className="space-y-8 mt-4">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings. Set your preferred language and
          timezone.
        </p>
      </div>
      <Separator />
      <div className="space-y-8 mt-4">
        <div className="flex flex-row max-w-[50vh] items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Delete Account</Label>
            <p className="text-xs">
              Delete your account and all associated data.
            </p>
          </div>
          <DeleteUserModal />
        </div>
      </div>
    </div>
  );
};

export default Settings;
