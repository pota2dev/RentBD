import { auth } from "@clerk/nextjs/server";

/**
 * Model: Business logic for pricing and subscription management
 */

export interface SubscriptionStatus {
  isPro: boolean;
  planSlug: string;
}

/**
 * Get the current user's subscription status
 * Uses Clerk's has() helper to check for "pro" plan
 */
export async function getUserSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { has } = await auth();
  
  // Check if user has the "pro" plan using Clerk Billing
  const isPro = has ? has({ plan: "pro" }) : false;
  
  return {
    isPro,
    planSlug: isPro ? "pro" : "free",
  };
}
