"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import { AppLoader } from "./AppLoader";
import { Loader } from "lucide-react";

export function UserNav() {
  const { user, isLoaded: userLoaded } = useUser();
  const get_user = useQuery(api.users.getUser);
  const { sessionId, isLoaded: authLoaded } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userLoaded && authLoaded) {
      setIsLoading(false);
    }
  }, [userLoaded, authLoaded]);

  useEffect(() => {
    if (!isLoading && !sessionId) {
      router.push("/");
    }
  }, [isLoading, sessionId, router]);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    router.push("/");
  };

  if (!sessionId) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={get_user?.imageUrl || "https://github.com/shadcn.png"}
              alt="@shadcn"
            />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.emailAddresses[0].emailAddress || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isLoading}
          className="cursor-pointer"
          onClick={handleSignOut}
        >
          {isLoading ? <Loader className="animate-spin mr-2" /> : ""}
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
