import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Building2, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4 text-center px-4">
      <div className="relative mb-4">
        <Building2 className="h-24 w-24 text-muted-foreground/20" />
        <div className="absolute -bottom-2 -right-2 rounded-full bg-background p-1 border">
           <span className="text-4xl font-bold text-primary">?</span>
        </div>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
      <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
      
      <p className="max-w-[500px] text-muted-foreground md:text-lg">
        Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or doesn't exist.
      </p>
      
      <div className="flex gap-4 pt-4">
        <Link href="/">
          <Button variant="default" className="gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
        <Link href="/contact">
           <Button variant="outline">Contact Support</Button>
        </Link>
      </div>
    </div>
  )
}
