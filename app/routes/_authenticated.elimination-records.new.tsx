import { useState, useEffect } from "react";
import { Form, redirect, useNavigate } from "react-router";
import type { Route } from "./+types/_authenticated.elimination-records.new";
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
import {
  getMe,
  getResidents,
  createEliminationRecord,
} from "~/api/nagaraCareAPI";
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
    eliminationMethod: formData.get("eliminationMethod") as string,
    hasFeces: formData.get("hasFeces") === "true",
    hasUrine: formData.get("hasUrine") === "true",
    fecalIncontinence: formData.get("fecalIncontinence") === "true",
    urinaryIncontinence: formData.get("urinaryIncontinence") === "true",
    fecesAppearance: formData.get("fecesAppearance") as string,
    fecesVolume: Number(formData.get("fecesVolume")),
    urineAppearance: formData.get("urineAppearance") as string,
    urineVolume: Number(formData.get("urineVolume")),
    notes: formData.get("notes") as string,
  };

  const response = await createEliminationRecord(residentUid, data);
  return redirect(
    `/residents/${residentUid}/elimination-records/${response.uid}`
  );
}

export default function NewEliminationRecordPage({
  loaderData,
}: Route.ComponentProps) {
  const { residents, preselectedResidentUid } = loaderData;
  const navigate = useNavigate();

  // フォームの状態管理
  const [residentUid, setResidentUid] = useState(preselectedResidentUid || "");
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [eliminationMethod, setEliminationMethod] = useState("トイレ");
  const [hasFeces, setHasFeces] = useState(false);
  const [hasUrine, setHasUrine] = useState(false);
  const [fecalIncontinence, setFecalIncontinence] = useState(false);
  const [urinaryIncontinence, setUrinaryIncontinence] = useState(false);
  const [fecesAppearance, setFecesAppearance] = useState("");
  const [fecesVolume, setFecesVolume] = useState(0);
  const [urineAppearance, setUrineAppearance] = useState("");
  const [urineVolume, setUrineVolume] = useState(0);
  const [notes, setNotes] = useState("");

  const handleBack = () => {
    navigate(`/elimination-records`);
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
          <CardTitle className="text-xl">新規排泄記録</CardTitle>
          <CardDescription>排泄記録を作成します</CardDescription>
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
                <Label
                  htmlFor="eliminationMethod"
                  className="text-base font-medium"
                >
                  排泄方法
                </Label>
                <Input
                  type="text"
                  id="eliminationMethod"
                  name="eliminationMethod"
                  value={eliminationMethod}
                  onChange={(e) => setEliminationMethod(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-4 border rounded-md p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasFeces" className="text-base font-medium">
                    便の有無
                  </Label>
                  <Switch
                    id="hasFeces"
                    name="hasFeces"
                    checked={hasFeces}
                    onCheckedChange={setHasFeces}
                    value={hasFeces ? "true" : "false"}
                  />
                </div>

                {hasFeces && (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="fecalIncontinence"
                        className="text-base font-medium"
                      >
                        便失禁の有無
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="fecalIncontinence"
                          name="fecalIncontinence"
                          checked={fecalIncontinence}
                          onCheckedChange={setFecalIncontinence}
                          value={fecalIncontinence ? "true" : "false"}
                        />
                        <span>{fecalIncontinence ? "あり" : "なし"}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="fecesAppearance"
                        className="text-base font-medium"
                      >
                        便の性状
                      </Label>
                      <Input
                        type="text"
                        id="fecesAppearance"
                        name="fecesAppearance"
                        value={fecesAppearance}
                        onChange={(e) => setFecesAppearance(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="fecesVolume"
                        className="text-base font-medium"
                      >
                        便の量 (g)
                      </Label>
                      <Input
                        type="number"
                        id="fecesVolume"
                        name="fecesVolume"
                        value={fecesVolume}
                        onChange={(e) => setFecesVolume(Number(e.target.value))}
                        min={0}
                        className="h-11"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4 border rounded-md p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasUrine" className="text-base font-medium">
                    尿の有無
                  </Label>
                  <Switch
                    id="hasUrine"
                    name="hasUrine"
                    checked={hasUrine}
                    onCheckedChange={setHasUrine}
                    value={hasUrine ? "true" : "false"}
                  />
                </div>

                {hasUrine && (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="urinaryIncontinence"
                        className="text-base font-medium"
                      >
                        尿失禁の有無
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="urinaryIncontinence"
                          name="urinaryIncontinence"
                          checked={urinaryIncontinence}
                          onCheckedChange={setUrinaryIncontinence}
                          value={urinaryIncontinence ? "true" : "false"}
                        />
                        <span>{urinaryIncontinence ? "あり" : "なし"}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="urineAppearance"
                        className="text-base font-medium"
                      >
                        尿の性状
                      </Label>
                      <Input
                        type="text"
                        id="urineAppearance"
                        name="urineAppearance"
                        value={urineAppearance}
                        onChange={(e) => setUrineAppearance(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="urineVolume"
                        className="text-base font-medium"
                      >
                        尿量 (ml)
                      </Label>
                      <Input
                        type="number"
                        id="urineVolume"
                        name="urineVolume"
                        value={urineVolume}
                        onChange={(e) => setUrineVolume(Number(e.target.value))}
                        min={0}
                        className="h-11"
                      />
                    </div>
                  </>
                )}
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
