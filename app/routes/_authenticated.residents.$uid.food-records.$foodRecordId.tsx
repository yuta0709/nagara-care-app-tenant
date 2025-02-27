import { useState, useEffect } from "react";
import { Form, redirect, useActionData, useNavigate } from "react-router";
import type { Route } from "./+types/_authenticated.residents.$uid.food-records.$foodRecordId";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  getFoodRecords,
  updateFoodRecord,
  getFoodRecordTranscription,
  updateFoodRecordTranscription,
  extractFoodRecord,
  type FoodRecordUpdateInputDto,
  type FoodRecordExtractedDto,
} from "~/api/nagaraCareAPI";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { uid, foodRecordId } = params;
  if (!uid || !foodRecordId)
    throw new Error("必要なパラメータが不足しています");

  const foodRecordsResponse = await getFoodRecords(uid);
  const foodRecord = foodRecordsResponse.items.find(
    (record) => record.uid === foodRecordId
  );

  if (!foodRecord) {
    throw new Error("指定された食事記録が見つかりません");
  }

  const transcription = await getFoodRecordTranscription(uid, foodRecordId);

  return {
    foodRecord,
    transcription,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const { uid, foodRecordId } = params;
  if (!uid || !foodRecordId)
    throw new Error("必要なパラメータが不足しています");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update_transcription") {
    const transcription = formData.get("transcription") as string;
    await updateFoodRecordTranscription(uid, foodRecordId, { transcription });
    return null;
  }

  if (intent === "extract") {
    const result = await extractFoodRecord(uid, foodRecordId);
    return { extracted: result };
  }

  const data: FoodRecordUpdateInputDto = {
    recordedAt: formData.get("recordedAt") as string,
    mealTime: formData.get("mealTime") as FoodRecordUpdateInputDto["mealTime"],
    mainCoursePercentage: Number(formData.get("mainCoursePercentage")),
    sideDishPercentage: Number(formData.get("sideDishPercentage")),
    soupPercentage: Number(formData.get("soupPercentage")),
    beverageType: formData.get(
      "beverageType"
    ) as FoodRecordUpdateInputDto["beverageType"],
    beverageVolume: Number(formData.get("beverageVolume")),
    notes: formData.get("notes") as string,
  };

  await updateFoodRecord(uid, foodRecordId, data);
  return null;
}

export default function FoodRecordPage({ loaderData }: Route.ComponentProps) {
  const { foodRecord, transcription } = loaderData;
  const actionData = useActionData<{ extracted: FoodRecordExtractedDto }>();
  const navigate = useNavigate();
  const [transcriptionText, setTranscriptionText] = useState(
    transcription.transcription
  );

  // フォームの値を管理するstate
  const [mainCoursePercentage, setMainCoursePercentage] = useState(
    foodRecord.mainCoursePercentage
  );
  const [sideDishPercentage, setSideDishPercentage] = useState(
    foodRecord.sideDishPercentage
  );
  const [soupPercentage, setSoupPercentage] = useState(
    foodRecord.soupPercentage
  );
  const [beverageType, setBeverageType] = useState(foodRecord.beverageType);
  const [beverageVolume, setBeverageVolume] = useState(
    foodRecord.beverageVolume
  );
  const [notes, setNotes] = useState(foodRecord.notes);

  // 解析結果が返ってきたら、nullでない項目をフォームに反映
  useEffect(() => {
    if (actionData?.extracted) {
      const { extracted } = actionData;
      if (extracted.mainCoursePercentage !== null) {
        setMainCoursePercentage(extracted.mainCoursePercentage);
      }
      if (extracted.sideDishPercentage !== null) {
        setSideDishPercentage(extracted.sideDishPercentage);
      }
      if (extracted.soupPercentage !== null) {
        setSoupPercentage(extracted.soupPercentage);
      }
      if (extracted.beverageType !== null) {
        setBeverageType(
          extracted.beverageType as FoodRecordUpdateInputDto["beverageType"]
        );
      }
      if (extracted.beverageVolume !== null) {
        setBeverageVolume(extracted.beverageVolume);
      }
      if (extracted.notes !== null) {
        setNotes(extracted.notes);
      }
    }
  }, [actionData]);

  const handleBack = () => {
    navigate(`/residents/${foodRecord.residentUid}/food-records`);
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
        {/* 左ペイン：食事記録フォーム */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-xl">食事記録の編集</CardTitle>
              <CardDescription>
                {format(new Date(foodRecord.recordedAt), "yyyy/MM/dd HH:mm")}の
                {foodRecord.mealTime === "BREAKFAST"
                  ? "朝食"
                  : foodRecord.mealTime === "LUNCH"
                  ? "昼食"
                  : "夕食"}
                の記録
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form method="post" className="space-y-6">
                <input
                  type="hidden"
                  name="recordedAt"
                  value={foodRecord.recordedAt}
                />
                <input
                  type="hidden"
                  name="mealTime"
                  value={foodRecord.mealTime}
                />

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="mainCoursePercentage"
                      className="text-base font-medium"
                    >
                      主食の摂取量 (%)
                    </Label>
                    <Input
                      type="number"
                      id="mainCoursePercentage"
                      name="mainCoursePercentage"
                      value={mainCoursePercentage}
                      onChange={(e) =>
                        setMainCoursePercentage(Number(e.target.value))
                      }
                      min={0}
                      max={100}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="sideDishPercentage"
                      className="text-base font-medium"
                    >
                      副食の摂取量 (%)
                    </Label>
                    <Input
                      type="number"
                      id="sideDishPercentage"
                      name="sideDishPercentage"
                      value={sideDishPercentage}
                      onChange={(e) =>
                        setSideDishPercentage(Number(e.target.value))
                      }
                      min={0}
                      max={100}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="soupPercentage"
                      className="text-base font-medium"
                    >
                      汁物の摂取量 (%)
                    </Label>
                    <Input
                      type="number"
                      id="soupPercentage"
                      name="soupPercentage"
                      value={soupPercentage}
                      onChange={(e) =>
                        setSoupPercentage(Number(e.target.value))
                      }
                      min={0}
                      max={100}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="beverageType"
                      className="text-base font-medium"
                    >
                      飲み物の種類
                    </Label>
                    <Select
                      name="beverageType"
                      value={beverageType}
                      onValueChange={(value) =>
                        setBeverageType(
                          value as FoodRecordUpdateInputDto["beverageType"]
                        )
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="飲み物を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WATER">水</SelectItem>
                        <SelectItem value="TEA">お茶</SelectItem>
                        <SelectItem value="OTHER">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="beverageVolume"
                      className="text-base font-medium"
                    >
                      飲み物の摂取量 (ml)
                    </Label>
                    <Input
                      type="number"
                      id="beverageVolume"
                      name="beverageVolume"
                      value={beverageVolume}
                      onChange={(e) =>
                        setBeverageVolume(Number(e.target.value))
                      }
                      min={0}
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
              <div className="flex items-center space-x-2">
                <Form method="post">
                  <input type="hidden" name="intent" value="extract" />
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-black hover:bg-black/90"
                  >
                    文字起こしを解析
                  </Button>
                </Form>
              </div>
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
