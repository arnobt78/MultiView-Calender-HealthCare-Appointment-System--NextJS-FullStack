/**
 * SSR: Category detail page.
 * Server fetches via Prisma, passes to client component for editing.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeCategory } from "@/lib/serializers";
import { isValidUUID } from "@/lib/validation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { CategoryDetailForm } from "@/components/control-panel/CategoryDetailForm";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Category — ${id.slice(0, 8)}` };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const raw = await prisma.category.findUnique({ where: { id } });
  if (!raw) notFound();

  const category = serializeCategory(raw);

  return (
    <div className="max-w-9xl mx-auto space-y-6 p-4">
      <PageHeader
        title={category.label}
        description="Category — all table schema properties"
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
            id · created_at · updated_at · label · description · color · icon
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* All schema fields */}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">id</dt>
              <dd className="font-mono break-all text-xs mt-0.5">{category.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">created_at</dt>
              <dd className="mt-0.5">{category.created_at ? new Date(category.created_at).toLocaleString() : "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">updated_at</dt>
              <dd className="mt-0.5">{category.updated_at ? new Date(category.updated_at).toLocaleString() : "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">label</dt>
              <dd className="mt-0.5 font-medium">{category.label}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">description</dt>
              <dd className="mt-0.5">{category.description ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">color</dt>
              <dd className="flex items-center gap-2 mt-0.5">
                {category.color && (
                  <input
                    type="color"
                    value={category.color}
                    readOnly
                    disabled
                    title="Category color"
                    className="inline-block h-4 w-5 rounded border p-0 cursor-default"
                  />
                )}
                <span>{category.color ?? "—"}</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">icon</dt>
              <dd className="mt-0.5">{category.icon ?? "—"}</dd>
            </div>
          </dl>

          {/* Edit form (client component) */}
          <CategoryDetailForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
}

