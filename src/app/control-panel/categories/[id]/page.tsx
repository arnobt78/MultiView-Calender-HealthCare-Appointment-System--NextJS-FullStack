"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCategory } from "@/hooks/useCategories";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { CategoryDetailForm } from "@/components/control-panel/CategoryDetailForm";

export default function CategoryDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { data: category, isLoading, isError, error } = useCategory(id);

  if (!id) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-destructive">Invalid category ID.</p>
        <Button variant="link" asChild><Link href="/control-panel">Back to Control Panel</Link></Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-destructive">{error?.message ?? "Failed to load category."}</p>
        <Button variant="link" asChild><Link href="/control-panel">Back to Control Panel</Link></Button>
      </div>
    );
  }

  if (isLoading || !category) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-muted-foreground">Loading category...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <PageHeader
        title={`Category: ${category.label}`}
        description="All table schema properties"
        actions={
          <Button variant="outline" asChild>
            <Link href="/control-panel">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Schema: categories</CardTitle>
          <p className="text-sm text-muted-foreground">
            id, created_at, updated_at, label, description, color, icon
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-2 text-sm">
            <div><dt className="font-medium text-muted-foreground">id</dt><dd className="font-mono">{category.id}</dd></div>
            <div><dt className="font-medium text-muted-foreground">created_at</dt><dd>{category.created_at ? new Date(category.created_at).toISOString() : "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">updated_at</dt><dd>{category.updated_at ? new Date(category.updated_at).toISOString() : "—"}</dd></div>
            <div><dt className="font-medium text-muted-foreground">label</dt><dd>{category.label}</dd></div>
            <div><dt className="font-medium text-muted-foreground">description</dt><dd>{category.description ?? "—"}</dd></div>
            <div className="flex items-center gap-2">
              <dt className="font-medium text-muted-foreground">color</dt>
              <dd className="flex items-center gap-2">
                {category.color && <span className="inline-block h-4 w-5 rounded border" style={{ backgroundColor: category.color }} />}
                <span>{category.color ?? "—"}</span>
              </dd>
            </div>
            <div><dt className="font-medium text-muted-foreground">icon</dt><dd>{category.icon ?? "—"}</dd></div>
          </dl>
          <CategoryDetailForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
}
