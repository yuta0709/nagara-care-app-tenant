import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Plus as PlusIcon, Pencil as PencilIcon } from "lucide-react";
import { getMe, getUsers } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.staff_";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useMe } from "~/contexts/AuthContext";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const me = await getMe();
  const users = await getUsers(me.tenantUid);
  return {
    users,
  };
}

export default function AuthenticatedStaff({
  loaderData,
}: Route.ComponentProps) {
  const { users } = loaderData;
  const me = useMe();
  const isTenantAdmin = me?.role === "TENANT_ADMIN";

  // ロールの日本語表示
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "TENANT_ADMIN":
        return "テナント管理者";
      case "CAREGIVER":
        return "介護士";
      default:
        return role;
    }
  };

  // ロールに基づいたバッジの色を返す
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "TENANT_ADMIN":
        return "default";
      case "CAREGIVER":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>スタッフ一覧</CardTitle>
            {isTenantAdmin && (
              <Button asChild>
                <Link to="/staff/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  新規作成
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {users.items.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              スタッフがいません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ログインID</TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead>フリガナ</TableHead>
                  <TableHead>権限</TableHead>
                  <TableHead>作成日</TableHead>
                  {isTenantAdmin && (
                    <TableHead className="text-right">操作</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.items.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>{user.loginId}</TableCell>
                    <TableCell>
                      {user.familyName} {user.givenName}
                    </TableCell>
                    <TableCell>
                      {user.familyNameFurigana} {user.givenNameFurigana}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "yyyy年MM月dd日", {
                        locale: ja,
                      })}
                    </TableCell>
                    {isTenantAdmin && (
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/staff/${user.uid}/edit`}>
                            <PencilIcon className="mr-1 h-3 w-3" />
                            編集
                          </Link>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
