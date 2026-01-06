import Link from 'next/link';
import { Building2, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto py-12 md:py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">RentBD</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Simplifying property rentals in Bangladesh. Find your dream home or manage your properties with ease.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/manage-properties" className="hover:text-foreground transition-colors">Properties</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Connect</h4>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
                 <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} RentBD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
