"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useIsSubscribed } from "@/lib/useUserLimitstore";
import { convertDate } from "@/utils/convertData";
import { useUser } from "@clerk/clerk-react";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

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
        "Subscription cancelled successfully.You are now free tier"
      );
    } catch (err) {
      setCancelError("An error occurred while cancelling the subscription");
      toast.error("An error occurred while cancelling the subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          See your account information and manage your account settings.
        </p>
      </div>
      <Separator />
      <div className="gap-1 flex flex-col">
        <Label className="text-base mb-2">Email</Label>
        <Input
          className="max-w-[50vh]"
          disabled
          placeholder={user?.emailAddresses[0]?.emailAddress}
        />
      </div>
      {userDetails?.isPro && (
        <div className="flex flex-row max-w-[50vh] items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Subscription Ends on</Label>
            <p className="text-xs">
              Date when your subscription will end. You will be charged for your
            </p>
          </div>
          <p>{convertDate(userDetails?.subscriptionEndDate as number)}</p>
        </div>
      )}
      <div className="flex flex-row max-w-[50vh] items-center justify-between rounded-lg border p-4">
        <div className="space-y-4">
          <Label className="text-base">Subscription Tier</Label>
          <h2 className="text-xs text-base text-gray-300 font-semibold">
            Need a Premium Account?
          </h2>
          {userDetails?.isPro ? (
            <Button onClick={handleCancelSubscription} size={"sm"} className="">
              {isLoading ? "Canceling..." : "Switch to Free"}
            </Button>
          ) : (
            <Button onClick={handleUpgrade} size={"sm"} className="">
              Upgrade to Pro
            </Button>
          )}
        </div>
        {cancelError && <p style={{ color: "red" }}>{cancelError}</p>}
        {userDetails?.isPro ? "Pro" : "Free"}
      </div>
    </div>
  );
};

export default UserAccount;
