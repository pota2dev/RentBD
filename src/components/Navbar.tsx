"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Building2, Home, CreditCard, User } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">RentBD</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <SignedIn>
            <Link
              href="/manage-properties"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/manage-properties")
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              My Properties
            </Link>
            <Link
              href="/rent-history"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/rent-history")
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Rent History
            </Link>
          </SignedIn>
          <Link
            href="/pricing"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/pricing") ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Pricing
          </Link>
        </div>

        {/* Right Side (Auth) */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <div className="hidden md:flex items-center gap-4 mr-4">
                <Link href="/profile">
                   <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                   </Button>
                </Link>
            </div>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </SignInButton>
            <Link href="/pricing">
                <Button size="sm">Get Pro</Button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
