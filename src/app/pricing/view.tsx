"use client";

import { PricingTable } from "@clerk/nextjs";

interface PricingViewProps {
  isPro: boolean;
  isAuthenticated: boolean;
}

export default function PricingView({ isPro, isAuthenticated }: PricingViewProps) {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground">
          Unlock premium features to get the most out of RentBD.
        </p>
        {isAuthenticated && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Current Plan: <span className="font-semibold text-foreground">{isPro ? "Pro" : "Free"}</span>
            </p>
          </div>
        )}
      </div>

      {/* Clerk's native PricingTable component */}
      <PricingTable />
    </div>
  );
}

