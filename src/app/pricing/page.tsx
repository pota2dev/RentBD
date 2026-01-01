
import { currentUser } from "@clerk/nextjs/server";
import PricingView from "./view";

export default async function PricingPage() {
  const user = await currentUser();
  const isPro = user?.publicMetadata?.plan === "pro";

  return <PricingView isPro={isPro} isAuthenticated={!!user} />;
}
