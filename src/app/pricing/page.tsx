import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionStatus } from "./model";
import PricingView from "./view";

export default async function PricingPage() {
  const user = await currentUser();
  const { isPro } = await getUserSubscriptionStatus();

  return <PricingView isPro={isPro} isAuthenticated={!!user} />;
}
