import "regenerator-runtime/runtime";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  getMe,
  findQaSession,
  deleteQaSession,
  updateTranscription,
  extractQaPairsFromTranscription,
  type QuestionAnswerOutputDto,
  type ExtractedQaPair,
  upsertQuestionAnswers,
} from "~/api/nagaraCareAPI";
import { format } from "date-fns";
import type { Route } from "./+types/_authenticated.qa-sessions.$uid";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Mic, MicOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { uid } = params;
  const me = await getMe();
  const qaSession = await findQaSession(uid);

  return {
    me,
    qaSession,
  };
}

export default function QaSessionDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { me, qaSession } = loaderData;
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [transcript, setTranscript] = useState(qaSession.transcription);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedQaPairs, setExtractedQaPairs] = useState<ExtractedQaPair[]>(
    []
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialTranscript, setInitialTranscript] = useState("");
  // 前回の処理時刻を保持するref
  const lastProcessTimeRef = useRef<number>(0);
  // 処理中フラグのref
  const isCurrentlyProcessingRef = useRef<boolean>(false);
  // デバウンスタイマーref
  const debounceTimerRef = useRef<number | null>(null);

  const {
    transcript: recordedTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ transcribing: true });

  // 文字起こしの保存と質問抽出を行う関数
  const processTranscription = async (currentTranscript: string) => {
    // 既に処理中の場合は何もしない
    if (isCurrentlyProcessingRef.current) return;

    // 現在の処理時刻を記録
    const currentTime = Date.now();
    // 前回の処理から2秒以内の場合は処理しない（デバウンス）
    if (currentTime - lastProcessTimeRef.current < 2000) return;

    // 処理中フラグを立てる
    isCurrentlyProcessingRef.current = true;
    setIsProcessing(true);

    try {
      // 文字起こしをバックエンドに保存
      await updateTranscription(qaSession.uid, {
        transcription: currentTranscript,
      });

      // 質問回答ペアを抽出
      const result = await extractQaPairsFromTranscription(qaSession.uid);
      setExtractedQaPairs(result.data);

      // 処理時刻を更新
      lastProcessTimeRef.current = Date.now();
    } catch (error) {
      console.error("文字起こしの処理中にエラーが発生しました", error);
    } finally {
      // 処理中フラグを下ろす
      isCurrentlyProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  // 録音内容が更新されたら処理を実行
  useEffect(() => {
    // 録音中のみ実行
    if (isRecording && recordedTranscript) {
      const currentFullTranscript =
        initialTranscript + " " + recordedTranscript;
      // 録音中はリアルタイムで文字起こしを表示
      setTranscript(currentFullTranscript);

      // 前回のタイマーをクリア
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }

      // 2秒後に処理を実行（デバウンス処理）
      debounceTimerRef.current = window.setTimeout(() => {
        processTranscription(currentFullTranscript);
      }, 2000);
    }

    // コンポーネントのアンマウント時にタイマーをクリア
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [recordedTranscript, isRecording, initialTranscript]);

  const handleSaveQaPairs = async () => {
    await upsertQuestionAnswers(qaSession.uid, {
      questionAnswers: extractedQaPairs,
    });
  };

  // 編集モードが有効になったときに再構築されたテキストをセット
  const handleEditModeChange = (checked: boolean) => {
    setIsEditMode(checked);
  };

  const handleDelete = async () => {
    if (confirm("このQAセッションを削除してもよろしいですか？")) {
      await deleteQaSession(qaSession.uid);
      navigate("/qa-sessions");
    }
  };

  const handleSaveTranscript = async () => {
    if (!transcript.trim()) return;

    setIsSaving(true);
    try {
      await updateTranscription(qaSession.uid, {
        transcription: transcript,
      });
      // 保存成功後、ページをリロードして最新のデータを取得
      window.location.reload();
    } catch (error) {
      console.error("文字起こしの保存に失敗しました", error);
      alert("文字起こしの保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtractQaPairs = async () => {
    setIsExtracting(true);
    try {
      const result = await extractQaPairsFromTranscription(qaSession.uid);
      setExtractedQaPairs(result.data);
    } catch (error) {
      console.error("質疑応答の抽出に失敗しました", error);
      alert("質疑応答の抽出に失敗しました");
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      setIsRecording(false);

      // 録音停止時の処理
      if (recordedTranscript) {
        // 初期状態と現在の文字起こしを組み合わせて最終的な文字起こしを作成
        const finalTranscript = initialTranscript + " " + recordedTranscript;
        setTranscript(finalTranscript);

        // 録音停止時も処理を実行（デバウンス処理と重複しないように確認）
        if (!isCurrentlyProcessingRef.current) {
          processTranscription(finalTranscript);
        }
      }
    } else {
      // 録音開始時に現在の文字起こしを初期状態として保持
      setInitialTranscript(transcript);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "ja-JP" });
      setIsRecording(true);
      // 録音開始時に編集モードを有効にする
      setIsEditMode(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>質疑応答セッション詳細</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/qa-sessions">戻る</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                削除
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            作成日時:{" "}
            {format(new Date(qaSession.createdAt), "yyyy/MM/dd HH:mm")}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end mb-4 space-x-2">
            <Switch
              id="edit-mode"
              checked={isEditMode}
              onCheckedChange={handleEditModeChange}
            />
            <Label htmlFor="edit-mode">編集モード</Label>

            <Button
              variant={listening ? "destructive" : "default"}
              size="sm"
              onClick={toggleRecording}
              className="ml-4"
            >
              {listening ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  録音停止
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  録音開始
                </>
              )}
            </Button>
          </div>

          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[500px] border rounded-md"
          >
            <ResizablePanel defaultSize={50}>
              <div className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">文字起こし</h3>
                  {isEditMode && (
                    <Button
                      onClick={handleSaveTranscript}
                      disabled={isSaving}
                      size="sm"
                    >
                      {isSaving ? "保存中..." : "保存"}
                    </Button>
                  )}
                </div>
                {isEditMode ? (
                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="flex-1 min-h-[400px]"
                    placeholder="文字起こしを入力してください..."
                  />
                ) : (
                  <div className="flex-1 overflow-auto whitespace-pre-wrap border rounded-md p-4 bg-muted/30">
                    {transcript}
                  </div>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={50}>
              <div className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">質疑応答</h3>
                  {isEditMode && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSaveQaPairs}
                        disabled={isSaving}
                        size="sm"
                      >
                        {isSaving ? "保存中..." : "保存"}
                      </Button>
                      <Button
                        onClick={handleExtractQaPairs}
                        disabled={isExtracting || !transcript?.trim()}
                        size="sm"
                      >
                        {isExtracting ? "抽出中..." : "文字起こしから抽出"}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="overflow-auto flex-1">
                  {isEditMode && extractedQaPairs.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>質問</TableHead>
                          <TableHead>回答</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extractedQaPairs.map((qa, index) => (
                          <TableRow key={index}>
                            <TableCell className="align-top">
                              {qa.question}
                            </TableCell>
                            <TableCell className="align-top">
                              {qa.answer}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>質問</TableHead>
                          <TableHead>回答</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {qaSession.questionAnswers.map((qa) => (
                          <TableRow key={qa.uid}>
                            <TableCell className="align-top">
                              {qa.question}
                            </TableCell>
                            <TableCell className="align-top">
                              {qa.answer}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </CardContent>
      </Card>
    </div>
  );
}
