import { useNavigate, useParams, useSubmit } from "react-router";
import { useState } from "react";
import { format, differenceInYears } from "date-fns";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  getDailyRecord,
  updateDailyRecord,
  deleteDailyRecord,
  getResident,
  getDailyRecordTranscription,
  updateDailyRecordTranscription,
  DailyRecordUpdateInputDtoDailyStatus,
  type DailyRecordDto,
} from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.residents.$uid.daily-records.$dailyRecordId";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { uid, dailyRecordId } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");
  if (!dailyRecordId) throw new Error("日常記録IDが指定されていません");

  const resident = await getResident(uid, uid);
  const dailyRecord = await getDailyRecord(uid, dailyRecordId);
  const transcription = await getDailyRecordTranscription(uid, dailyRecordId);

  return {
    resident,
    dailyRecord,
    transcription,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const { uid, dailyRecordId } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");
  if (!dailyRecordId) throw new Error("日常記録IDが指定されていません");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteDailyRecord(uid, dailyRecordId);
    return redirect(`/residents/${uid}/daily-records`);
  }

  if (intent === "update_transcription") {
    const transcription = formData.get("transcription") as string;
    await updateDailyRecordTranscription(uid, dailyRecordId, {
      transcription,
    });
    return null;
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

export default function DailyRecordPage({ loaderData }: Route.ComponentProps) {
  const { resident, dailyRecord, transcription } = loaderData;
  const navigate = useNavigate();
  const params = useParams();
  const submit = useSubmit();
  const [transcriptionText, setTranscriptionText] = useState(
    transcription.transcription
  );

  const [dailyStatus, setDailyStatus] = useState<
    "NORMAL" | "WARNING" | "ALERT"
  >(dailyRecord.dailyStatus);
  const [notes, setNotes] = useState(dailyRecord.notes);

  // 年齢を計算する関数
  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const handleBack = () => {
    navigate(`/residents/${params.uid}/daily-records`);
  };

  const handleDelete = () => {
    if (window.confirm("この日常記録を削除してもよろしいですか？")) {
      const formData = new FormData();
      formData.append("intent", "delete");

      submit(formData, {
        method: "post",
      });
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

        {/* 右ペイン：文字起こし */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/50 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">文字起こし</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="transcription" className="w-full">
                <TabsContent value="transcription" className="space-y-4">
                  <Form method="post" className="space-y-4">
                    <input
                      type="hidden"
                      name="intent"
                      value="update_transcription"
                    />
                    <Textarea
                      name="transcription"
                      value={transcriptionText}
                      onChange={(e) => setTranscriptionText(e.target.value)}
                      className="min-h-[400px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="secondary"
                        className="px-6"
                      >
                        文字起こしを保存
                      </Button>
                    </div>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
