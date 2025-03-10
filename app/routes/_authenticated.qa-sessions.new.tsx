import { Form, redirect, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { getMe, createQaSession } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.qa-sessions.new";

export async function clientLoader() {
  const me = await getMe();
  return { me };
}

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;

  // QAセッションを作成
  const me = await getMe();
  const qaSession = await createQaSession({ title });

  return redirect(`/qa-sessions/${qaSession.uid}`);
}

export default function NewQaSessionPage({ loaderData }: Route.ComponentProps) {
  const { me } = loaderData;
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新規質疑応答セッション</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">セッションタイトル</Label>
              <Input
                id="title"
                name="title"
                placeholder="例: プレゼンテーション Q&A"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/qa-sessions")}
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
