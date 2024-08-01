"use client";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = () => {
    signOut().then(() => {
      router.push("/sign-in");
    });
  };
  return (
    <div>
      <h1>This is landing page</h1>
      <Button size="sm" variant="outline" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
