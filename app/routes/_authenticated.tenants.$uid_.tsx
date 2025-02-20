import { getTenant, getUsers, deleteTenant } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.tenants.$uid_";
import { Form, Link, redirect } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { format } from "date-fns";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const tenant = await getTenant(params.uid);
  const users = await getUsers(tenant.uid);
  return { tenant, users };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteTenant(params.uid);
    return redirect("/tenants");
  }

  return null;
}

export default function TenantPage({ loaderData }: Route.ComponentProps) {
  const { tenant, users } = loaderData;

  return (
    <div className="space-y-8">
      {/* ヘッダーセクション */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link to="/tenants">
                <ArrowLeftIcon className="h-4 w-4" />
                戻る
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">
              {tenant.name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-10">
            テナント情報の詳細と所属ユーザーを確認できます。
          </p>
        </div>
        <Form method="post">
          <Button
            type="submit"
            name="intent"
            value="delete"
            variant="destructive"
            onClick={(e) => {
              if (
                !confirm(
                  "このテナントを削除してもよろしいですか？\n※所属するユーザーも全て削除されます。"
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            テナントを削除
          </Button>
        </Form>
      </div>

      {/* テナント情報 */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>テナントの基本情報です。</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  テナントID
                </dt>
                <dd className="text-sm">{tenant.uid}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  作成日時
                </dt>
                <dd className="text-sm">
                  {format(new Date(tenant.createdAt), "yyyy/MM/dd HH:mm")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* ユーザー一覧 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>所属ユーザー</CardTitle>
                <CardDescription>
                  テナントに所属するユーザーの一覧です。
                </CardDescription>
              </div>
              <Button asChild>
                <Link to="users/new">ユーザーを追加</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ユーザー</TableHead>
                  <TableHead>ロール</TableHead>
                  <TableHead className="text-right">作成日時</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.items.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>{user.familyName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {user.familyName} {user.givenName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.loginId}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {user.role === "TENANT_ADMIN" ? "管理者" : "一般"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "yyyy/MM/dd HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
