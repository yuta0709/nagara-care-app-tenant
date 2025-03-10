import { useState } from "react";
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
                        disabled={isExtracting || !transcript.trim()}
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
