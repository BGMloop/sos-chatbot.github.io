import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
const Error = ({ statusCode }) => {
    return (<div className="flex h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <h1 className="text-6xl font-bold">{statusCode || 'Error'}</h1>
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'}
        </p>
        <div className="pt-6">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>);
};
Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};
export default Error;
