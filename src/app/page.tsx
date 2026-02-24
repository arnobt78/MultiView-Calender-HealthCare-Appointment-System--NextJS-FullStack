// Home Page - Server Component (SSR)
// This is the route entry point that renders the client-side HomePage component
// The page itself is a server component for optimal SSR and metadata support

import HomePage from "@/components/pages/HomePage";

export default function Page() {
  return <HomePage />;
}
