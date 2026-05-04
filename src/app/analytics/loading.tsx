import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-500">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* KPI Cards Skeleton — Exact match to page grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Array Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-[280px]">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {(["h-[65%]", "h-[45%]", "h-[80%]", "h-[55%]", "h-[70%]", "h-[40%]", "h-[90%]", "h-[60%]", "h-[75%]", "h-[50%]", "h-[85%]", "h-[35%]"] as const).map((hCls, i) => (
                <Skeleton key={i} className={`flex-1 rounded-t ${hCls}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-[280px]">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
