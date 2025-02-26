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
import { getMe, getResident, updateResident } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.residents.$uid.edit";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { uid } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");

  const resident = await getResident(uid, uid);
  return {
    resident,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const formData = await request.formData();
  const me = await getMe();
  const { uid } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");

  const data = {
    familyName: formData.get("familyName") as string,
    givenName: formData.get("givenName") as string,
    familyNameFurigana: formData.get("familyNameFurigana") as string,
    givenNameFurigana: formData.get("givenNameFurigana") as string,
    dateOfBirth: formData.get("dateOfBirth") as string,
    gender: formData.get("gender") as "MALE" | "FEMALE",
    admissionDate: formData.get("admissionDate") as string,
  };

  await updateResident(me.tenantUid, uid, data);
  return redirect(`/residents/${uid}`);
}

export default function ResidentEditPage({ loaderData }: Route.ComponentProps) {
  const { resident } = loaderData;
  const navigate = useNavigate();
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [admissionDate, setAdmissionDate] = useState<string>("");

  // 初期値をセット
  useEffect(() => {
    if (resident) {
      // YYYY-MM-DD形式に変換
      const formattedDateOfBirth = format(
        new Date(resident.dateOfBirth),
        "yyyy-MM-dd"
      );
      const formattedAdmissionDate = format(
        new Date(resident.admissionDate),
        "yyyy-MM-dd"
      );

      setDateOfBirth(formattedDateOfBirth);
      setAdmissionDate(formattedAdmissionDate);
    }
  }, [resident]);

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>利用者情報編集</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="familyName">姓</Label>
                <Input
                  id="familyName"
                  name="familyName"
                  defaultValue={resident.familyName}
                  required
                />
              </div>
              <div>
                <Label htmlFor="givenName">名</Label>
                <Input
                  id="givenName"
                  name="givenName"
                  defaultValue={resident.givenName}
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
                  defaultValue={resident.familyNameFurigana}
                  required
                />
              </div>
              <div>
                <Label htmlFor="givenNameFurigana">名（フリガナ）</Label>
                <Input
                  id="givenNameFurigana"
                  name="givenNameFurigana"
                  defaultValue={resident.givenNameFurigana}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gender">性別</Label>
              <Select name="gender" defaultValue={resident.gender} required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="性別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">男性</SelectItem>
                  <SelectItem value="FEMALE">女性</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateOfBirth">生年月日</Label>
              <Input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="admissionDate">入所日</Label>
              <Input
                type="date"
                id="admissionDate"
                name="admissionDate"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/residents/${resident.uid}`)}
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
