import { Form, redirect } from "react-router";
import type { Route } from "../_auth.login/+types/route";
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
import { getMe, login, type SignInDto } from "~/api/nagaraCareAPI";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId");
  const password = formData.get("password");
  const token = await login({
    loginId: userId as string,
    password: password as string,
  });
  localStorage.setItem("token", token.token);
  return redirect("/");
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-[400px] w-full">
        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>アカウント情報を入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <Form className="space-y-6" method="post">
              <div className="space-y-2">
                <Label htmlFor="userId">ユーザーID</Label>
                <Input
                  id="userId"
                  name="userId"
                  type="text"
                  placeholder="your-user-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                />
              </div>
              <Button type="submit" className="w-full">
                ログイン
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
