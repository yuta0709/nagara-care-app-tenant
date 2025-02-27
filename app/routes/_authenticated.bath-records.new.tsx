import { useState, useEffect } from "react";
import { Form, redirect, useNavigate } from "react-router";
import type { Route } from "./+types/_authenticated.bath-records.new";
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
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Clock, ChevronLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getMe, getResidents, createBathRecord } from "~/api/nagaraCareAPI";
import { format } from "date-fns";

export async function clientLoader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const residentUid = url.searchParams.get("residentUid");

  const me = await getMe();
  const residents = await getResidents(me.tenantUid);

  return {
    residents,
    preselectedResidentUid: residentUid,
  };
}

export async function clientAction({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const residentUid = formData.get("residentUid") as string;
  const useCustomDateTime = formData.get("useCustomDateTime") === "true";

  let recordedAt: string;
  if (useCustomDateTime) {
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    recordedAt = `${date}T${time}:00`;
  } else {
    recordedAt = new Date().toISOString();
  }

  const data = {
    recordedAt,
    bathMethod: formData.get("bathMethod") as string,
    notes: formData.get("notes") as string,
  };

  const response = await createBathRecord(residentUid, data);
  return redirect(`/residents/${residentUid}/bath-records/${response.uid}`);
}

export default function NewBathRecordPage({
  loaderData,
}: Route.ComponentProps) {
  const { residents, preselectedResidentUid } = loaderData;
  const navigate = useNavigate();

  // フォームの状態管理
  const [residentUid, setResidentUid] = useState(preselectedResidentUid || "");
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [bathMethod, setBathMethod] = useState("一般浴");
  const [notes, setNotes] = useState("");

  const handleBack = () => {
    navigate(`/bath-records`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center text-muted-foreground"
          onClick={handleBack}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          戻る
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-xl">新規入浴記録</CardTitle>
          <CardDescription>入浴記録を作成します</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form method="post" className="space-y-6">
            <input
              type="hidden"
              name="useCustomDateTime"
              value={useCustomDateTime.toString()}
            />

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="residentUid" className="text-base font-medium">
                  利用者
                </Label>
                <Select
                  name="residentUid"
                  value={residentUid}
                  onValueChange={setResidentUid}
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="利用者を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.items.map((resident) => (
                      <SelectItem key={resident.uid} value={resident.uid}>
                        {resident.familyName} {resident.givenName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md p-5 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium text-base">
                      日時を指定する
                    </span>
                  </div>
                  <Switch
                    checked={useCustomDateTime}
                    onCheckedChange={setUseCustomDateTime}
                  />
                </div>

                {useCustomDateTime && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">日付</Label>
                      <Input
                        type="date"
                        id="date"
                        name="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required={useCustomDateTime}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">時間</Label>
                      <Input
                        type="time"
                        id="time"
                        name="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required={useCustomDateTime}
                        className="h-11"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 text-sm text-muted-foreground">
                  {useCustomDateTime
                    ? "指定した日時で記録します"
                    : "現在の日時で記録します"}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathMethod" className="text-base font-medium">
                  入浴方法
                </Label>
                <Input
                  type="text"
                  id="bathMethod"
                  name="bathMethod"
                  value={bathMethod}
                  onChange={(e) => setBathMethod(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-medium">
                  備考
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="px-6">
                保存
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
