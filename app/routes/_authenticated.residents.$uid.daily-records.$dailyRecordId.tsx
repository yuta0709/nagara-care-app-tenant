import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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
  getDailyRecord,
  updateDailyRecord,
  deleteDailyRecord,
  getResident,
  DailyRecordUpdateInputDtoDailyStatus,
  type DailyRecordDto,
} from "~/api/nagaraCareAPI";

export async function clientLoader({
  params,
}: {
  params: { uid: string; dailyRecordId: string };
}) {
  const { uid, dailyRecordId } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");
  if (!dailyRecordId) throw new Error("日常記録IDが指定されていません");

  const resident = await getResident(uid, uid);
  const dailyRecord = await getDailyRecord(uid, dailyRecordId);

  return {
    resident,
    dailyRecord,
  };
}

export async function clientAction({
  request,
  params,
}: {
  request: Request;
  params: { uid: string; dailyRecordId: string };
}) {
  const { uid, dailyRecordId } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");
  if (!dailyRecordId) throw new Error("日常記録IDが指定されていません");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteDailyRecord(uid, dailyRecordId);
    return redirect(`/residents/${uid}/daily-records`);
  }

  const recordedAt = formData.get("recordedAt") as string;
  const dailyStatus = formData.get(
    "dailyStatus"
  ) as keyof typeof DailyRecordUpdateInputDtoDailyStatus;
  const notes = formData.get("notes") as string;

  await updateDailyRecord(uid, dailyRecordId, {
    recordedAt,
    dailyStatus,
    notes,
  });

  return redirect(`/residents/${uid}/daily-records`);
}

export default function DailyRecordPage({
  loaderData,
}: {
  loaderData: { resident: any; dailyRecord: DailyRecordDto };
}) {
  const { resident, dailyRecord } = loaderData;
  const navigate = useNavigate();
  const params = useParams();

  const [dailyStatus, setDailyStatus] = useState<
    "NORMAL" | "WARNING" | "ALERT"
  >(dailyRecord.dailyStatus);
  const [notes, setNotes] = useState(dailyRecord.notes);

  const handleBack = () => {
    navigate(`/residents/${params.uid}/daily-records`);
  };

  const handleDelete = () => {
    if (window.confirm("この日常記録を削除してもよろしいですか？")) {
      const form = document.createElement("form");
      form.method = "post";
      const input = document.createElement("input");
      input.name = "intent";
      input.value = "delete";
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    }
  };

  return (
    <div className="p-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左ペイン：日常記録フォーム */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-xl">日常記録の編集</CardTitle>
              <CardDescription>
                {format(new Date(dailyRecord.recordedAt), "yyyy/MM/dd HH:mm", {
                  locale: ja,
                })}
                の記録
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form method="post" className="space-y-6">
                <input
                  type="hidden"
                  name="recordedAt"
                  value={dailyRecord.recordedAt}
                />

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="dailyStatus"
                      className="text-base font-medium"
                    >
                      日常の状態
                    </Label>
                    <Select
                      name="dailyStatus"
                      value={dailyStatus}
                      onValueChange={(value: "NORMAL" | "WARNING" | "ALERT") =>
                        setDailyStatus(value)
                      }
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
                </div>

                <CardFooter className="flex justify-between space-x-4 px-0 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={handleDelete}
                  >
                    削除
                  </Button>
                  <Button type="submit" className="px-6">
                    保存
                  </Button>
                </CardFooter>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* 右ペイン：利用者情報 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>利用者情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">氏名：</span>
                  {resident.familyName} {resident.givenName}
                </div>
                <div>
                  <span className="font-medium">年齢：</span>
                  {resident.age}歳
                </div>
                <div>
                  <span className="font-medium">性別：</span>
                  {resident.gender === "MALE" ? "男性" : "女性"}
                </div>
                <div>
                  <span className="font-medium">要介護度：</span>
                  {resident.careLevel}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
