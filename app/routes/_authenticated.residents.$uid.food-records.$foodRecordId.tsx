import { useState, useEffect, useRef } from "react";
import {
  Form,
  redirect,
  useActionData,
  useNavigate,
  useParams,
} from "react-router";
import type { Route } from "./+types/_authenticated.residents.$uid.food-records.$foodRecordId";
import { Button } from "~/components/ui/button";
import "regenerator-runtime/runtime.js";
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
import { Slider } from "~/components/ui/slider";
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
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

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
  const params = useParams();
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

  // extract処理の状態管理
  const [isExtracting, setIsExtracting] = useState(false);
  const extractIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const prevTranscriptRef = useRef<string>("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // 音声認識の開始
  const startListening = () => {
    if (browserSupportsSpeechRecognition) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "ja-JP" });

      // 録音開始時に定期的なextract処理を開始
      startPeriodicExtract();
    }
  };

  // 音声認識の停止
  const stopListening = () => {
    SpeechRecognition.stopListening();

    // 録音停止時に定期的なextract処理も停止
    stopPeriodicExtract();
  };

  // 定期的なextract処理を開始
  const startPeriodicExtract = () => {
    // 既存のインターバルがあれば停止
    stopPeriodicExtract();

    // バックアップとして30秒ごとにextract処理を実行
    extractIntervalRef.current = setInterval(() => {
      if (!isExtracting && transcriptionText.trim().length > 0) {
        extractTranscription();
      }
    }, 30000); // 30秒間隔（バックアップとして）
  };

  // 定期的なextract処理を停止
  const stopPeriodicExtract = () => {
    if (extractIntervalRef.current) {
      clearInterval(extractIntervalRef.current);
      extractIntervalRef.current = null;
    }
  };

  // transcriptが更新されたら、transcriptionTextに反映し、必要に応じてextract実行
  useEffect(() => {
    if (transcript) {
      console.log("Transcript updated:", transcript);
      console.log("Previous transcript:", prevTranscriptRef.current);
      console.log("isExtracting:", isExtracting);

      setTranscriptionText(transcript);

      // 前回のtranscriptと比較して変化があり、かつextract処理中でなければ実行
      // 条件を緩和：単に前回と違う、かつ処理中でなければ実行
      if (
        transcript !== prevTranscriptRef.current &&
        !isExtracting &&
        transcript.trim().length > 0
      ) {
        console.log("Transcript changed, scheduling extraction");

        // 少し遅延を入れて、連続した音声入力による頻繁な実行を防止
        const timer = setTimeout(() => {
          console.log("Executing extraction");
          extractTranscription();
        }, 1500); // 1.5秒の遅延

        // 現在のtranscriptを保存（タイマーの前に保存して、次の変更との比較に備える）
        prevTranscriptRef.current = transcript;

        return () => {
          console.log("Clearing extraction timeout");
          clearTimeout(timer);
        };
      }

      // 現在のtranscriptを保存（条件を満たさない場合でも保存）
      prevTranscriptRef.current = transcript;
    }
  }, [transcript, isExtracting]);

  // extract処理を実行
  const extractTranscription = async () => {
    if (isExtracting) {
      console.log("Already extracting, skipping");
      return; // 既に処理中なら何もしない
    }

    console.log("Starting extraction process");
    setIsExtracting(true);

    try {
      // 現在の文字起こしを保存してから解析
      console.log("Saving transcription:", transcriptionText);
      await updateTranscription();

      // extract処理を実行
      if (formRef.current) {
        console.log("Submitting extract form");

        // フォームを手動でサブミット
        formRef.current.requestSubmit();
      } else {
        console.log("Form reference not found");
        setIsExtracting(false); // formがなければフラグをリセット
      }
    } catch (error) {
      console.error("Extract処理中にエラーが発生しました:", error);
      setIsExtracting(false); // エラー時はフラグをリセット
    }
  };

  // 文字起こしを保存
  const updateTranscription = async () => {
    const { uid } = foodRecord;
    const { foodRecordId } = params;

    if (!foodRecordId) {
      console.error("foodRecordIdが見つかりません");
      return;
    }

    await updateFoodRecordTranscription(uid, foodRecordId, {
      transcription: transcriptionText,
    });
  };

  // 解析結果が返ってきたら、nullでない項目をフォームに反映
  useEffect(() => {
    console.log("Action data updated:", actionData);

    if (actionData?.extracted) {
      console.log("Extracted data received:", actionData.extracted);
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

      // extract処理が完了したらフラグをリセット
      console.log("Resetting isExtracting flag");
      setIsExtracting(false);
    }
  }, [actionData]);

  // コンポーネントのアンマウント時にインターバルをクリア
  useEffect(() => {
    // コンポーネントのマウント時に実行
    console.log("Component mounted, initializing state");

    // 初期状態の設定
    prevTranscriptRef.current = transcriptionText || "";
    setIsExtracting(false);

    return () => {
      console.log("Component unmounting, cleaning up");
      stopPeriodicExtract();
    };
  }, []);

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
                    <div className="flex justify-between items-center">
                      <Label
                        htmlFor="mainCoursePercentage"
                        className="text-base font-medium"
                      >
                        主食の摂取量
                      </Label>
                      <span className="text-sm font-medium">
                        {mainCoursePercentage}%
                      </span>
                    </div>
                    <Slider
                      id="mainCoursePercentage"
                      value={[mainCoursePercentage]}
                      onValueChange={(values) =>
                        setMainCoursePercentage(values[0])
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="py-4"
                    />
                    <input
                      type="hidden"
                      name="mainCoursePercentage"
                      value={mainCoursePercentage}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label
                        htmlFor="sideDishPercentage"
                        className="text-base font-medium"
                      >
                        副食の摂取量
                      </Label>
                      <span className="text-sm font-medium">
                        {sideDishPercentage}%
                      </span>
                    </div>
                    <Slider
                      id="sideDishPercentage"
                      value={[sideDishPercentage]}
                      onValueChange={(values) =>
                        setSideDishPercentage(values[0])
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="py-4"
                    />
                    <input
                      type="hidden"
                      name="sideDishPercentage"
                      value={sideDishPercentage}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label
                        htmlFor="soupPercentage"
                        className="text-base font-medium"
                      >
                        汁物の摂取量
                      </Label>
                      <span className="text-sm font-medium">
                        {soupPercentage}%
                      </span>
                    </div>
                    <Slider
                      id="soupPercentage"
                      value={[soupPercentage]}
                      onValueChange={(values) => setSoupPercentage(values[0])}
                      min={0}
                      max={100}
                      step={5}
                      className="py-4"
                    />
                    <input
                      type="hidden"
                      name="soupPercentage"
                      value={soupPercentage}
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
                <Button
                  type="button"
                  variant={listening ? "destructive" : "outline"}
                  onClick={listening ? stopListening : startListening}
                  disabled={!browserSupportsSpeechRecognition}
                  className="mr-2"
                >
                  {listening ? (
                    <>
                      <span className="mr-2">●</span>
                      録音停止
                    </>
                  ) : (
                    <>
                      <span className="mr-2">◉</span>
                      録音開始
                    </>
                  )}
                </Button>
                <Form method="post" ref={formRef}>
                  <input type="hidden" name="intent" value="extract" />
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-black hover:bg-black/90"
                    disabled={isExtracting}
                  >
                    {isExtracting ? "解析中..." : "文字起こしを解析"}
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
