"use client";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  isAuth: boolean;
}

const MobileNavLanding = ({ isAuth }: MobileNavProps) => {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isActive = (link: string) => pathname === link;

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <div className="sm:hidden">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSheetOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col w-80">
          <nav className="grid gap-2 text-lg font-medium">
            {isAuth ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center  px-2 rounded-xl transition-all hover:text-primary ${
                    isActive("/dashboard")
                      ? "active rounded-lg bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                  onClick={handleLinkClick}
                >
                  <Button>Dashboard</Button>
                </Link>
                <Link
                  href="/sign-out"
                  className={`flex items-center  px-2 rounded-xl transition-all hover:text-primary ${
                    isActive("/dashboard")
                      ? "active rounded-lg bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                  onClick={handleLinkClick}
                >
                  <Button>SignOut</Button>
                </Link>
              </>
            ) : (
              <Link
                href="/sign-in"
                className={`flex items-center gap-5 px-2 rounded-xl transition-all hover:text-primary ${
                  isActive("/sign-in")
                    ? "active rounded-lg bg-primary/10 text-primary"
                    : "text-foreground"
                }`}
                onClick={handleLinkClick}
              >
                Sign in
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavLanding;
