import { Form, redirect, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getMe, getUsers, updateUser } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.staff.$uid.edit";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useMe } from "~/contexts/AuthContext";
import { useEffect } from "react";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const me = await getMe();
  // テナント管理者以外はアクセス不可
  if (me.role !== "TENANT_ADMIN") {
    return redirect("/staff");
  }

  const { uid } = params;
  if (!uid) throw new Error("ユーザーIDが指定されていません");

  // ユーザー一覧から該当ユーザーを検索
  const users = await getUsers(me.tenantUid);
  const user = users.items.find((u) => u.uid === uid);

  if (!user) {
    throw new Error("指定されたユーザーが見つかりません");
  }

  return {
    user,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const me = await getMe();
  // テナント管理者以外は操作不可
  if (me.role !== "TENANT_ADMIN") {
    return redirect("/staff");
  }

  const { uid } = params;
  if (!uid) throw new Error("ユーザーIDが指定されていません");

  const formData = await request.formData();
  const familyName = formData.get("familyName") as string;
  const givenName = formData.get("givenName") as string;
  const familyNameFurigana = formData.get("familyNameFurigana") as string;
  const givenNameFurigana = formData.get("givenNameFurigana") as string;
  const role = formData.get("role") as "TENANT_ADMIN" | "CAREGIVER";

  await updateUser(uid, {
    familyName,
    givenName,
    familyNameFurigana,
    givenNameFurigana,
    role,
  });

  return redirect("/staff");
}

export default function StaffEdit({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const navigate = useNavigate();
  const me = useMe();

  // テナント管理者以外はリダイレクト
  useEffect(() => {
    if (me && me.role !== "TENANT_ADMIN") {
      navigate("/staff");
    }
  }, [me, navigate]);

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>スタッフ情報編集</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div>
              <Label htmlFor="loginId">ログインID</Label>
              <Input
                id="loginId"
                name="loginId"
                value={user.loginId}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                ログインIDは変更できません
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="familyName">姓</Label>
                <Input
                  id="familyName"
                  name="familyName"
                  defaultValue={user.familyName}
                  required
                />
              </div>
              <div>
                <Label htmlFor="givenName">名</Label>
                <Input
                  id="givenName"
                  name="givenName"
                  defaultValue={user.givenName}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="familyNameFurigana">姓（フリガナ）</Label>
                <Input
                  id="familyNameFurigana"
                  name="familyNameFurigana"
                  defaultValue={user.familyNameFurigana}
                  required
                />
              </div>
              <div>
                <Label htmlFor="givenNameFurigana">名（フリガナ）</Label>
                <Input
                  id="givenNameFurigana"
                  name="givenNameFurigana"
                  defaultValue={user.givenNameFurigana}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">権限</Label>
              <Select name="role" required defaultValue={user.role}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="権限を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TENANT_ADMIN">テナント管理者</SelectItem>
                  <SelectItem value="CAREGIVER">介護士</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/staff")}
              >
                キャンセル
              </Button>
              <Button type="submit">更新</Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
