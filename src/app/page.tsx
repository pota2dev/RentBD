import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to RentBD
          </h1>
          
          <div className="w-full">
            <SignedOut>
              <div className="flex flex-col gap-4 items-center sm:items-start p-6 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  Please sign in to continue accessing the platform.
                </p>
                <div className="flex gap-4 mt-2">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 bg-transparent text-black border border-black rounded-md hover:bg-zinc-100 transition-colors dark:text-white dark:border-white dark:hover:bg-zinc-800">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col gap-4 items-center sm:items-start p-6 border rounded-lg bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50 w-full">
                <div className="flex items-center gap-4 w-full justify-between">
                  <p className="text-lg text-green-800 dark:text-green-300">
                    You are signed in!
                  </p>
                  <UserButton afterSignOutUrl="/" />
                </div>
                <div className="flex gap-4 mt-4">
                  <Link href="/profile" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Go to Profile
                  </Link>
                </div>
              </div>
            </SignedIn>
          </div>
        </div>

        <div className="mt-12 text-sm text-zinc-500">
          <p>Protected by Clerk Authentication</p>
        </div>
      </main>
    </div>
  );
}
