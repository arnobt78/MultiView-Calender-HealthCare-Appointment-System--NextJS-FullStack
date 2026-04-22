import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ControlPanelLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-64" /> {/* Search */}
          <Skeleton className="h-9 w-32" /> {/* Export */}
          <Skeleton className="h-9 w-32" /> {/* Add New */}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs Skeleton */}
        <div className="w-64 border-r bg-muted/30 p-4 space-y-2 hidden md:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="space-y-4">
            {/* Table Header Match */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>

            {/* Table Skeleton */}
            <Card className="overflow-hidden">
              <div className="border-b px-4 py-3 flex gap-4">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
              <div className="divide-y">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="px-4 py-4 flex gap-4 items-center">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
