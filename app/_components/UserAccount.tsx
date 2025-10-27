"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useIsSubscribed } from "@/lib/useUserLimitstore";
import { convertDate } from "@/utils/convertData";
import { useUser } from "@clerk/clerk-react";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { User, Mail, Calendar, Crown, Sparkles } from "lucide-react";

const UserAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const cancelSubscription = useAction(api.users.cancelSubscription);
  const router = useRouter();
  const { user } = useUser();
  const { user: userDetails } = useIsSubscribed();
  const upgrade = useAction(api.stripe.pay);

  async function handleUpgrade() {
    const url = await upgrade();
    router.push(url);
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    setCancelError(null);
    try {
      const res = await cancelSubscription({ clerkId: user?.id! });
      router.push("/dashboard");
      toast.success(
        "Subscription cancelled successfully. You are now free tier"
      );
    } catch (err) {
      setCancelError("An error occurred while cancelling the subscription");
      toast.error("An error occurred while cancelling the subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 max-w-5xl">
      {/* Header Section */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gray-100 rounded-lg">
            <User className="h-6 w-6 text-gray-700" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Account
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          See your account information and manage your account settings.
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Account Information Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* Email Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <Label className="text-lg font-semibold text-gray-900">
                Email Address
              </Label>
            </div>
            <Input
              className="max-w-full bg-gray-50"
              disabled
              value={user?.emailAddresses[0]?.emailAddress}
            />
          </div>
        </div>

        {/* Subscription End Date Card (Only show for Pro users) */}
        {userDetails?.isPro && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <Label className="text-lg font-semibold text-gray-900">
                    Subscription Ends On
                  </Label>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Date when your subscription will end. You will be charged for
                  your next billing cycle.
                </p>
              </div>
              <div className="sm:ml-4 flex-shrink-0">
                <Badge className="text-sm px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-100">
                  {convertDate(userDetails?.subscriptionEndDate as number)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tier Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-lg ${userDetails?.isPro ? "bg-yellow-50" : "bg-gray-50"}`}
                >
                  {userDetails?.isPro ? (
                    <Crown className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <Label className="text-lg font-semibold text-gray-900">
                  Subscription Tier
                </Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-sm px-3 py-1 ${
                      userDetails?.isPro
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {userDetails?.isPro ? "Pro Account" : "Free Account"}
                  </Badge>
                </div>

                {!userDetails?.isPro && (
                  <p className="text-sm text-gray-600">
                    Need a Premium Account? Upgrade to unlock all features.
                  </p>
                )}

                {userDetails?.isPro ? (
                  <Button
                    onClick={handleCancelSubscription}
                    variant="outline"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "Canceling..." : "Switch to Free"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleUpgrade}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                )}

                {cancelError && (
                  <p className="text-sm text-red-600 mt-2">{cancelError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
