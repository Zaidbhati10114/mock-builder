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
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useDashboardTheme } from "@/hooks/useDashboardTheme";
import Link from "next/link";

export function UserNav() {
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { setTheme } = useDashboardTheme();
  const [isLoading, setIsLoading] = useState(false); // Set initial state to false
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (userLoaded) {
      setIsLoading(false);
    }
  }, [userLoaded]);

  const handleSignOut = async (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await signOut();
      setTheme("light");
      router.push("/");
      // window.location.href = "/";
      // const response = await fetch("/api/logout", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });

      // const result = await response.json();

      // if (result.success) {
      //   setTheme("light");
      //   router.replace("/");
      // } else {
      //   console.error("Failed to log out:", result.message);
      //   setIsLoading(false);
      // }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropdownOpenChange = (open: boolean) => {
    if (!isLoading) {
      setIsDropdownOpen(open);
    }
  };

  return (
    <>
      <DropdownMenu
        open={isDropdownOpen}
        onOpenChange={handleDropdownOpenChange}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.imageUrl || "https://github.com/shadcn.png"}
                alt="User Avatar"
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
                {user?.emailAddresses[0]?.emailAddress || ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href={"dashboard/account"}>
              <DropdownMenuItem className="cursor-pointer">
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
            <Link href={"/dashboard/account"}>
              <DropdownMenuItem className="cursor-pointer">
                Billing
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
            <Link href={"/dashboard/settings"}>
              <DropdownMenuItem className="cursor-pointer">
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isLoading}
            className="cursor-pointer"
            onClick={handleSignOut}
          >
            {isLoading ? <Loader className="animate-spin mr-2" /> : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
