import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/components/LoadingScreen";
export function Authenticated({ children }) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, isLoading, router]);
    if (isLoading) {
        return <LoadingScreen />;
    }
    if (!isAuthenticated) {
        return null;
    }
    return <>{children}</>;
}
