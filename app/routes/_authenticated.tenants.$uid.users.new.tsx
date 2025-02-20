import type { Route } from "./+types/_authenticated.tenants.$uid.users.new";
import { Form, Link, redirect, useLoaderData, useNavigate } from "react-router";
import { createUser, getTenant } from "~/api/nagaraCareAPI";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const clientLoader = async ({ params }: Route.LoaderArgs) => {
  const tenant = await getTenant(params.uid);
  return { tenant };
};

export const clientAction = async ({
  request,
  params,
}: Route.ClientActionArgs) => {
  const formData = await request.formData();
  const loginId = formData.get("loginId") as string;
  const password = formData.get("password") as string;
  const familyName = formData.get("familyName") as string;
  const givenName = formData.get("givenName") as string;
  const familyNameFurigana = formData.get("familyNameFurigana") as string;
  const givenNameFurigana = formData.get("givenNameFurigana") as string;
  const role = formData.get("role") as string;

  await createUser(params.uid, {
    loginId,
    password,
    familyName,
    givenName,
    familyNameFurigana,
    givenNameFurigana,
    role,
  });

  return redirect(`/tenants/${params.uid}`);
};

export default function NewUserPage() {
  const { tenant } = useLoaderData();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">新規ユーザー作成</h1>
        <Button
          variant="outline"
          onClick={() => navigate(`/tenants/${tenant.uid}`)}
        >
          戻る
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー情報</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginId">ログインID</Label>
              <Input id="loginId" name="loginId" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="familyName">姓（漢字）</Label>
                <Input id="familyName" name="familyName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="givenName">名（漢字）</Label>
                <Input id="givenName" name="givenName" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="familyNameFurigana">姓（フリガナ）</Label>
                <Input
                  id="familyNameFurigana"
                  name="familyNameFurigana"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="givenNameFurigana">名（フリガナ）</Label>
                <Input
                  id="givenNameFurigana"
                  name="givenNameFurigana"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">役割</Label>
              <Select name="role" required>
                <SelectTrigger>
                  <SelectValue placeholder="役割を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TENANT_ADMIN">管理者</SelectItem>
                  <SelectItem value="CAREGIVER">介護士</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/tenants/${tenant.uid}`)}
              >
                キャンセル
              </Button>
              <Button type="submit">作成</Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
