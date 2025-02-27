import { useState, useEffect } from "react";
import { Form, redirect, useActionData, useNavigate } from "react-router";
import type { Route } from "./+types/_authenticated.residents.$uid.elimination-records.$eliminationRecordId";
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
import { Switch } from "~/components/ui/switch";
import {
  getEliminationRecords,
  updateEliminationRecord,
  getEliminationRecordTranscription,
  updateEliminationRecordTranscription,
  type EliminationRecordUpdateInputDto,
} from "~/api/nagaraCareAPI";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { uid, eliminationRecordId } = params;
  if (!uid || !eliminationRecordId)
    throw new Error("必要なパラメータが不足しています");

  const eliminationRecordsResponse = await getEliminationRecords(uid);
  const eliminationRecord = eliminationRecordsResponse.items.find(
    (record) => record.uid === eliminationRecordId
  );

  if (!eliminationRecord) {
    throw new Error("指定された排泄記録が見つかりません");
  }

  const transcription = await getEliminationRecordTranscription(
    uid,
    eliminationRecordId
  );

  return {
    eliminationRecord,
    transcription,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const { uid, eliminationRecordId } = params;
  if (!uid || !eliminationRecordId)
    throw new Error("必要なパラメータが不足しています");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update_transcription") {
    const transcription = formData.get("transcription") as string;
    await updateEliminationRecordTranscription(uid, eliminationRecordId, {
      transcription,
    });
    return null;
  }

  const data: EliminationRecordUpdateInputDto = {
    recordedAt: formData.get("recordedAt") as string,
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

  await updateEliminationRecord(uid, eliminationRecordId, data);
  return null;
}

export default function EliminationRecordPage({
  loaderData,
}: Route.ComponentProps) {
  const { eliminationRecord, transcription } = loaderData;
  const navigate = useNavigate();
  const [transcriptionText, setTranscriptionText] = useState(
    transcription.transcription
  );

  // フォームの値を管理するstate
  const [eliminationMethod, setEliminationMethod] = useState(
    eliminationRecord.eliminationMethod
  );
  const [hasFeces, setHasFeces] = useState(eliminationRecord.hasFeces);
  const [hasUrine, setHasUrine] = useState(eliminationRecord.hasUrine);
  const [fecalIncontinence, setFecalIncontinence] = useState(
    eliminationRecord.fecalIncontinence
  );
  const [urinaryIncontinence, setUrinaryIncontinence] = useState(
    eliminationRecord.urinaryIncontinence
  );
  const [fecesAppearance, setFecesAppearance] = useState(
    eliminationRecord.fecesAppearance
  );
  const [fecesVolume, setFecesVolume] = useState(eliminationRecord.fecesVolume);
  const [urineAppearance, setUrineAppearance] = useState(
    eliminationRecord.urineAppearance
  );
  const [urineVolume, setUrineVolume] = useState(eliminationRecord.urineVolume);
  const [notes, setNotes] = useState(eliminationRecord.notes);

  const handleBack = () => {
    navigate(`/residents/${eliminationRecord.residentUid}/elimination-records`);
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
        {/* 左ペイン：排泄記録フォーム */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-xl">排泄記録の編集</CardTitle>
              <CardDescription>
                {format(
                  new Date(eliminationRecord.recordedAt),
                  "yyyy/MM/dd HH:mm"
                )}
                の記録
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form method="post" className="space-y-6">
                <input
                  type="hidden"
                  name="recordedAt"
                  value={eliminationRecord.recordedAt}
                />

                <div className="space-y-5">
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
                    />
                  </div>

                  <div className="space-y-4 border rounded-md p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="hasFeces"
                        className="text-base font-medium"
                      >
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
                            onChange={(e) =>
                              setFecesVolume(Number(e.target.value))
                            }
                            min={0}
                            className="h-11"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4 border rounded-md p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="hasUrine"
                        className="text-base font-medium"
                      >
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
                            onChange={(e) =>
                              setUrineVolume(Number(e.target.value))
                            }
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
