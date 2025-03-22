import { useEffect, useState } from 'react';
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import '../app/globals.css';

// Create a client only on the client side
let convexClient;
if (typeof window !== 'undefined') {
  convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-lemur-994.convex.cloud");
}

function MyApp({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false);

  // Use effect to detect client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get the layout from the page component
  const getLayout = Component.getLayout || ((page) => page);

  // Don't render Convex-dependent components on the server
  if (!isClient) {
    return getLayout(<Component {...pageProps} />);
  }

  return (
    <ConvexProvider client={convexClient}>
      {getLayout(<Component {...pageProps} />)}
    </ConvexProvider>
  );
}

export default MyApp; 