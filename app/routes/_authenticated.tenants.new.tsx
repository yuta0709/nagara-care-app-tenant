import type { Route } from "./+types/_authenticated.tenants_";
import { Form, Link, redirect } from "react-router";
import { createTenant } from "~/api/nagaraCareAPI";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const tenant = await createTenant({ name });
  return redirect(`/tenants/${tenant.uid}`);
}

export default function NewTenantPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="space-y-8">
      {/* ヘッダーセクション */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1">
              <Link to="/tenants">
                <ArrowLeftIcon className="h-4 w-4" />
                戻る
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">
              新規テナント作成
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-10">
            新しいテナントを作成します。
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>テナント情報</CardTitle>
            <CardDescription>
              テナントの基本情報を入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">テナント名</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="テナント名を入力"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link to="/tenants">キャンセル</Link>
                </Button>
                <Button type="submit">作成</Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
