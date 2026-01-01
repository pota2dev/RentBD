"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface PricingViewProps {
  isPro: boolean;
}

export default function PricingView({ isPro }: PricingViewProps) {
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const res = await fetch("/pricing/api", { method: "POST" });
      if (res.ok) {
        setShowCheckout(false);
        router.refresh();
      } else {
        console.error("Failed to upgrade");
      }
    } catch (error) {
      console.error("Error upgrading:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground">
          Unlock premium features to get the most out of RentBD.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Essential features for everyone.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold mb-6">
              $0<span className="text-lg font-normal text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Basic Property Search</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>View Public Reviews</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Limited Property Details</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`flex flex-col relative ${isPro ? "border-primary shadow-lg" : ""}`}>
          {isPro && (
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                CURRENT
              </span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>Advanced tools for serious users.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-3xl font-bold mb-6">
              $9.99<span className="text-lg font-normal text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>All Free Features</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Advanced Search Filters</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Priority Support</span>
              </li>
                <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Verified Badge</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPro ? (
              <Button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetch("/pricing/api", { method: "DELETE" });
                    if (res.ok) router.refresh();
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setLoading(false);
                  }
                }} 
                variant="destructive" 
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Subscription
              </Button>
            ) : (
              <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
                <DialogTrigger asChild>
                  <Button className="w-full">Upgrade to Pro</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upgrade to Pro</DialogTitle>
                    <DialogDescription>
                      Enter your payment details to simulate a purchase. No actual charge will be made.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <button 
                        className={`flex-1 p-3 border rounded-md flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <span className="font-semibold">Credit Card</span>
                      </button>
                      <button 
                        className={`flex-1 p-3 border rounded-md flex items-center justify-center transition-all ${paymentMethod === 'paypal' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted'}`}
                        onClick={() => setPaymentMethod('paypal')}
                      >
                        <span className="font-semibold text-blue-600">PayPal</span>
                      </button>
                    </div>

                    {paymentMethod === 'card' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Cardholder Name</Label>
                          <Input id="name" placeholder="John Doe" defaultValue="Test User" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="number">Card Number</Label>
                          <Input id="number" placeholder="0000 0000 0000 0000" defaultValue="4242 4242 4242 4242" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry</Label>
                            <Input id="expiry" placeholder="MM/YY" defaultValue="12/30" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" defaultValue="123" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center border rounded-md bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          You will be redirected to PayPal to complete your purchase.
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleUpgrade} disabled={loading} className="w-full">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {paymentMethod === 'paypal' ? 'Pay with PayPal' : 'Pay Now ($9.99)'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
