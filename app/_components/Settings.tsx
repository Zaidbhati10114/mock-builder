"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Settings as SettingsIcon } from "lucide-react";
import React from "react";
import { DeleteUserModal } from "./UserDeleteModal";

const Settings = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 max-w-5xl">
      {/* Header Section */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gray-100 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-gray-700" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Settings
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          Update your account settings. Set your preferred language and
          timezone.
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Delete Account Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <Label className="text-lg font-semibold text-gray-900">
                  Delete Account
                </Label>
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <div className="sm:ml-4 flex-shrink-0">
              <DeleteUserModal />
            </div>
          </div>
        </div>

        {/* Future Settings Placeholder Cards */}
        {/* You can add more setting cards here following the same pattern */}

        {/* Example: Language & Timezone Card (commented out for now) */}
        {/* 
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <Label className="text-lg font-semibold text-gray-900">
                  Language & Timezone
                </Label>
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Set your preferred language and timezone for a personalized experience.
              </p>
            </div>
            <div className="sm:ml-4 flex-shrink-0">
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default Settings;
