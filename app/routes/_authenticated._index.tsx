import { getMe, getResidents, getUsers, getTenant } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated._index";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Users, UserRound, Home } from "lucide-react";
import { Link } from "react-router";

export async function clientLoader() {
  const me = await getMe();
  const users = await getUsers(me.tenantUid);
  const residents = await getResidents(me.tenantUid);
  const tenant = await getTenant(me.tenantUid);

  return {
    users,
    residents,
    me,
    tenant,
  };
}

export default function AuthenticatedIndex({
  loaderData,
}: Route.ComponentProps) {
  const { users, residents, me, tenant } = loaderData;

  // テナント管理者の数をカウント
  const adminCount = users.items.filter(
    (user) => user.role === "TENANT_ADMIN"
  ).length;

  // 介護士の数をカウント
  const caregiverCount = users.items.filter(
    (user) => user.role === "CAREGIVER"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 利用者数カード */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50">
            <CardTitle className="text-sm font-medium">利用者数</CardTitle>
            <UserRound className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{residents.items.length}人</div>
            <p className="text-xs text-muted-foreground mt-2">
              施設内の登録利用者の総数
            </p>
            <div className="mt-4">
              <Link
                to="/residents"
                className="text-xs text-blue-500 hover:underline"
              >
                利用者一覧を見る →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* スタッフ数カード */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50">
            <CardTitle className="text-sm font-medium">スタッフ数</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{users.items.length}人</div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-muted-foreground">
                テナント管理者: {adminCount}人
              </div>
              <div className="text-xs text-muted-foreground">
                介護士: {caregiverCount}人
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/staff"
                className="text-xs text-green-500 hover:underline"
              >
                スタッフ一覧を見る →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 施設情報カード */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-50">
            <CardTitle className="text-sm font-medium">施設情報</CardTitle>
            <Home className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-xl font-bold mb-1">{tenant.name}</div>
            <div className="text-xs text-muted-foreground mb-3">
              施設ID: {tenant.uid}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ログインユーザー: {me.familyName} {me.givenName}
            </p>
            <p className="text-xs text-muted-foreground">
              権限: {me.role === "TENANT_ADMIN" ? "テナント管理者" : "介護士"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
