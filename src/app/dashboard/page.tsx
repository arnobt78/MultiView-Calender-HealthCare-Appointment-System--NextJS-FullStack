import { Suspense } from "react";
import HomePage from "@/components/pages/HomePage";

export default function DashboardPage() {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      {/* <Suspense fallback={null}> */}
      <HomePage />
      {/* </Suspense> */}
    </div>
  );
}
