import { useState, useEffect } from "react";
import { Form, redirect, useActionData, useNavigate } from "react-router";
import type { Route } from "./+types/_authenticated.residents.$uid.bath-records.$bathRecordId";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  getBathRecords,
  updateBathRecord,
  getBathRecordTranscription,
  updateBathRecordTranscription,
  type BathRecordUpdateInputDto,
} from "~/api/nagaraCareAPI";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { uid, bathRecordId } = params;
  if (!uid || !bathRecordId)
    throw new Error("必要なパラメータが不足しています");

  const bathRecordsResponse = await getBathRecords(uid);
  const bathRecord = bathRecordsResponse.items.find(
    (record) => record.uid === bathRecordId
  );

  if (!bathRecord) {
    throw new Error("指定された入浴記録が見つかりません");
  }

  const transcription = await getBathRecordTranscription(uid, bathRecordId);

  return {
    bathRecord,
    transcription,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const { uid, bathRecordId } = params;
  if (!uid || !bathRecordId)
    throw new Error("必要なパラメータが不足しています");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update_transcription") {
    const transcription = formData.get("transcription") as string;
    await updateBathRecordTranscription(uid, bathRecordId, {
      transcription,
    });
    return null;
  }

  const data: BathRecordUpdateInputDto = {
    recordedAt: formData.get("recordedAt") as string,
    bathMethod: formData.get("bathMethod") as string,
    notes: formData.get("notes") as string,
  };

  await updateBathRecord(uid, bathRecordId, data);
  return null;
}

export default function BathRecordPage({ loaderData }: Route.ComponentProps) {
  const { bathRecord, transcription } = loaderData;
  const navigate = useNavigate();
  const [transcriptionText, setTranscriptionText] = useState(
    transcription.transcription
  );

  // フォームの値を管理するstate
  const [bathMethod, setBathMethod] = useState(bathRecord.bathMethod);
  const [notes, setNotes] = useState(bathRecord.notes);

  const handleBack = () => {
    navigate(`/residents/${bathRecord.residentUid}/bath-records`);
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
        {/* 左ペイン：入浴記録フォーム */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-xl">入浴記録の編集</CardTitle>
              <CardDescription>
                {format(new Date(bathRecord.recordedAt), "yyyy/MM/dd HH:mm")}
                の記録
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form method="post" className="space-y-6">
                <input
                  type="hidden"
                  name="recordedAt"
                  value={bathRecord.recordedAt}
                />

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bathMethod"
                      className="text-base font-medium"
                    >
                      入浴方法
                    </Label>
                    <Input
                      type="text"
                      id="bathMethod"
                      name="bathMethod"
                      value={bathMethod}
                      onChange={(e) => setBathMethod(e.target.value)}
                      className="h-11"
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

                <CardFooter className="flex justify-end space-x-4 px-0 pt-4">
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
