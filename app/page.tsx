"use client";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useClerk();
  const router = useRouter();

  return (
    <div>
      <h1>This is landing page</h1>
      {user && (
        <Button onClick={() => router.push("/dashboard")}>
          Go to dashboard
        </Button>
      )}
    </div>
  );
}
