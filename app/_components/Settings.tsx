import { Separator } from "@/components/ui/separator";
import React from "react";

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
      {/* <AccountForm /> */}
    </div>
  );
};

export default Settings;
