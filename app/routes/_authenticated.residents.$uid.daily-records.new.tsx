import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Form } from "react-router";
import { redirect } from "react-router";
import {
  createDailyRecord,
  getResident,
  DailyRecordCreateInputDtoDailyStatus,
} from "~/api/nagaraCareAPI";

export async function clientLoader({ params }: { params: { uid: string } }) {
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
}: {
  request: Request;
  params: { uid: string };
}) {
  const { uid } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");

  const formData = await request.formData();
  const useCustomDateTime = formData.get("useCustomDateTime") === "true";
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const dailyStatus =
    (formData.get(
      "dailyStatus"
    ) as keyof typeof DailyRecordCreateInputDtoDailyStatus) || "NORMAL";
  const notes = (formData.get("notes") as string) || "";

  // 日付と時間が明示的に指定されている場合はそれを使用、そうでなければ現在時刻
  let recordedAt: string;
  if (useCustomDateTime && date) {
    const dateObj = new Date(date);

    // 時間が指定されている場合は、その時間を設定
    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      dateObj.setHours(hours, minutes, 0, 0);
    } else {
      // 時間が指定されていない場合は、現在時刻を設定
      const now = new Date();
      dateObj.setHours(now.getHours(), now.getMinutes(), 0, 0);
    }

    recordedAt = dateObj.toISOString();
  } else {
    recordedAt = new Date().toISOString();
  }

  // 日常記録を作成
  const dailyRecord = await createDailyRecord(uid, {
    recordedAt,
    dailyStatus,
    notes,
  });

  return redirect(`/residents/${uid}/daily-records/${dailyRecord.uid}`);
}

export default function NewDailyRecordPage({
  loaderData,
}: {
  loaderData: { resident: any };
}) {
  const { resident } = loaderData;
  const navigate = useNavigate();
  const params = useParams();

  const [useCustomDateTime, setUseCustomDateTime] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [dailyStatus, setDailyStatus] = useState<string>("NORMAL");
  const [notes, setNotes] = useState("");

  const handleBack = () => {
    navigate(`/residents/${params.uid}/daily-records`);
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
          <CardTitle className="text-xl">新規日常記録</CardTitle>
          <CardDescription>
            <span className="font-medium">
              {resident.familyName} {resident.givenName}
            </span>
            さんの日常記録を作成します
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form method="post" className="space-y-6">
            <input
              type="hidden"
              name="useCustomDateTime"
              value={useCustomDateTime.toString()}
            />

            <div className="border rounded-md p-5 bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium text-base">日時を指定する</span>
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
              <Label htmlFor="dailyStatus" className="text-base font-medium">
                日常の状態
              </Label>
              <Select
                name="dailyStatus"
                value={dailyStatus}
                onValueChange={setDailyStatus}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="状態を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">普通</SelectItem>
                  <SelectItem value="WARNING">注意</SelectItem>
                  <SelectItem value="ALERT">警告</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-medium">
                メモ
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <CardFooter className="flex justify-end space-x-4 px-0 pt-4">
              <Button type="submit" className="px-6">
                保存
              </Button>
            </CardFooter>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
