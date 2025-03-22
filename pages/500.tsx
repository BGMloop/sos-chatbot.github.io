import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Custom500() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <h1 className="text-6xl font-bold">500</h1>
        <h2 className="text-2xl font-semibold">Server Error</h2>
        <p className="text-muted-foreground">
          Sorry, something went wrong on our server. We're working to fix it.
        </p>
        <div className="pt-6">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 