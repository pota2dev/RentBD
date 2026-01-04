"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Building2, Home, CreditCard, User, Heart, Calendar, Search, ChevronDown } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [showFeatures, setShowFeatures] = useState(false);

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
          <Link
            href="/manage-properties"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/manage-properties")
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Properties
          </Link>
          <Link
            href="/pricing"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/pricing") ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Pricing
          </Link>

          {/* Features Dropdown */}
          <div className="relative group">
            <button className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground flex items-center gap-1">
              Features
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute left-0 mt-0 w-56 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                {/* Feature 7 */}
                <Link
                  href="/booking-calendar?propertyId=1"
                  className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Booking Calendar</p>
                    <p className="text-xs text-gray-600">Manage availability & bookings</p>
                  </div>
                </Link>

                {/* Feature 12 */}
                <Link
                  href="/saved-properties"
                  className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Heart className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Saved Properties</p>
                    <p className="text-xs text-gray-600">Your watchlist & favorites</p>
                  </div>
                </Link>

                {/* Feature 16 */}
                <Link
                  href="/property-search"
                  className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Search className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Search & Ranking</p>
                    <p className="text-xs text-gray-600">Find properties with filters</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
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
