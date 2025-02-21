import {
  getAssessment,
  getTranscription,
  updateAssessment,
  updateTranscription,
  type AssessmentDto,
  type AssessmentUpdateInputDto,
} from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.assessments.$uid";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const assessment = await getAssessment(params.uid);
  const transcription = await getTranscription(params.uid);
  return {
    assessment,
    transcription,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update_transcription") {
    const transcription = formData.get("transcription") as string;
    await updateTranscription(params.uid, { transcription });
    return null;
  }

  const data: AssessmentUpdateInputDto = {
    familyInfo: formData.get("familyInfo") as string,
    careLevel: formData.get(
      "careLevel"
    ) as AssessmentUpdateInputDto["careLevel"],
    physicalIndependence: formData.get(
      "physicalIndependence"
    ) as AssessmentUpdateInputDto["physicalIndependence"],
    cognitiveIndependence: formData.get(
      "cognitiveIndependence"
    ) as AssessmentUpdateInputDto["cognitiveIndependence"],
    medicalHistory: formData.get("medicalHistory") as string,
    medications: formData.get("medications") as string,
    formalServices: formData.get("formalServices") as string,
    informalSupport: formData.get("informalSupport") as string,
    consultationBackground: formData.get("consultationBackground") as string,
    lifeHistory: formData.get("lifeHistory") as string,
    complaints: formData.get("complaints") as string,
    healthNotes: formData.get("healthNotes") as string,
    mentalStatus: formData.get("mentalStatus") as string,
    physicalStatus: formData.get("physicalStatus") as string,
    adlStatus: formData.get("adlStatus") as string,
    communication: formData.get("communication") as string,
    dailyLife: formData.get("dailyLife") as string,
    instrumentalADL: formData.get("instrumentalADL") as string,
    participation: formData.get("participation") as string,
    environment: formData.get("environment") as string,
    livingSituation: formData.get("livingSituation") as string,
    legalSupport: formData.get("legalSupport") as string,
    personalTraits: formData.get("personalTraits") as string,
  };

  await updateAssessment(params.uid, data);
  return null;
}

export default function Assessment({ loaderData }: Route.ComponentProps) {
  const { assessment, transcription } = loaderData;
  const [transcriptionText, setTranscriptionText] = useState(
    transcription.transcription
  );
  const [summaryText, setSummaryText] = useState("");
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* 左ペイン：アセスメントフォーム */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-2rem)]">
          <Card>
            <CardHeader>
              <CardTitle>アセスメント情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form method="post">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="familyInfo">家族構成</Label>
                    <Textarea
                      id="familyInfo"
                      name="familyInfo"
                      defaultValue={assessment.familyInfo}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="careLevel">要介護状態区分</Label>
                    <Select
                      name="careLevel"
                      defaultValue={assessment.careLevel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="要介護状態区分を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEEDS_CARE_1">要介護1</SelectItem>
                        <SelectItem value="NEEDS_CARE_2">要介護2</SelectItem>
                        <SelectItem value="NEEDS_CARE_3">要介護3</SelectItem>
                        <SelectItem value="NEEDS_CARE_4">要介護4</SelectItem>
                        <SelectItem value="NEEDS_CARE_5">要介護5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="physicalIndependence">
                      障害高齢者の日常生活自立度
                    </Label>
                    <Select
                      name="physicalIndependence"
                      defaultValue={assessment.physicalIndependence}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="日常生活自立度を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INDEPENDENT">自立</SelectItem>
                        <SelectItem value="J1">J1</SelectItem>
                        <SelectItem value="J2">J2</SelectItem>
                        <SelectItem value="A1">A1</SelectItem>
                        <SelectItem value="A2">A2</SelectItem>
                        <SelectItem value="B1">B1</SelectItem>
                        <SelectItem value="B2">B2</SelectItem>
                        <SelectItem value="C1">C1</SelectItem>
                        <SelectItem value="C2">C2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cognitiveIndependence">
                      認知症高齢者の日常生活自立度
                    </Label>
                    <Select
                      name="cognitiveIndependence"
                      defaultValue={assessment.cognitiveIndependence}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="日常生活自立度を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INDEPENDENT">自立</SelectItem>
                        <SelectItem value="I">I</SelectItem>
                        <SelectItem value="IIa">IIa</SelectItem>
                        <SelectItem value="IIb">IIb</SelectItem>
                        <SelectItem value="IIIa">IIIa</SelectItem>
                        <SelectItem value="IIIb">IIIb</SelectItem>
                        <SelectItem value="IV">IV</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="medicalHistory">既往症</Label>
                    <Textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      defaultValue={assessment.medicalHistory}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="medications">服用薬剤</Label>
                    <Textarea
                      id="medications"
                      name="medications"
                      defaultValue={assessment.medications}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="formalServices">
                      使用しているフォーマルサービス
                    </Label>
                    <Textarea
                      id="formalServices"
                      name="formalServices"
                      defaultValue={assessment.formalServices}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="informalSupport">
                      使用しているインフォーマルサービス
                    </Label>
                    <Textarea
                      id="informalSupport"
                      name="informalSupport"
                      defaultValue={assessment.informalSupport}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="consultationBackground">
                      相談に至った経緯
                    </Label>
                    <Textarea
                      id="consultationBackground"
                      name="consultationBackground"
                      defaultValue={assessment.consultationBackground}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lifeHistory">生活史</Label>
                    <Textarea
                      id="lifeHistory"
                      name="lifeHistory"
                      defaultValue={assessment.lifeHistory}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="complaints">主訴</Label>
                    <Textarea
                      id="complaints"
                      name="complaints"
                      defaultValue={assessment.complaints}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="healthNotes">健康状態</Label>
                    <Textarea
                      id="healthNotes"
                      name="healthNotes"
                      defaultValue={assessment.healthNotes}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mentalStatus">精神状態</Label>
                    <Textarea
                      id="mentalStatus"
                      name="mentalStatus"
                      defaultValue={assessment.mentalStatus}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="physicalStatus">身体状態</Label>
                    <Textarea
                      id="physicalStatus"
                      name="physicalStatus"
                      defaultValue={assessment.physicalStatus}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adlStatus">ADL</Label>
                    <Textarea
                      id="adlStatus"
                      name="adlStatus"
                      defaultValue={assessment.adlStatus}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="communication">コミュニケーション</Label>
                    <Textarea
                      id="communication"
                      name="communication"
                      defaultValue={assessment.communication}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dailyLife">日常生活</Label>
                    <Textarea
                      id="dailyLife"
                      name="dailyLife"
                      defaultValue={assessment.dailyLife}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instrumentalADL">IADL</Label>
                    <Textarea
                      id="instrumentalADL"
                      name="instrumentalADL"
                      defaultValue={assessment.instrumentalADL}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="participation">参加・参加制約</Label>
                    <Textarea
                      id="participation"
                      name="participation"
                      defaultValue={assessment.participation}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="environment">環境</Label>
                    <Textarea
                      id="environment"
                      name="environment"
                      defaultValue={assessment.environment}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="livingSituation">生活状況</Label>
                    <Textarea
                      id="livingSituation"
                      name="livingSituation"
                      defaultValue={assessment.livingSituation}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="legalSupport">制度的環境</Label>
                    <Textarea
                      id="legalSupport"
                      name="legalSupport"
                      defaultValue={assessment.legalSupport}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="personalTraits">個人因子</Label>
                    <Textarea
                      id="personalTraits"
                      name="personalTraits"
                      defaultValue={assessment.personalTraits}
                      className="h-24"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    保存
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* 右ペイン：文字起こしと要約のタブ */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>文字起こし・要約</CardTitle>
                <Button>解析</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transcription" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="transcription">文字起こし</TabsTrigger>
                  <TabsTrigger value="summary">要約</TabsTrigger>
                </TabsList>
                <TabsContent value="transcription" className="space-y-4">
                  <Form method="post">
                    <input
                      type="hidden"
                      name="intent"
                      value="update_transcription"
                    />
                    <div className="space-y-4">
                      <div className="w-full">
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          文字起こしを更新
                        </Button>
                      </div>
                      <Textarea
                        name="transcription"
                        value={transcriptionText}
                        onChange={(e) => setTranscriptionText(e.target.value)}
                        className="h-[calc(100vh-20rem)]"
                        placeholder="音声の文字起こしがここに表示されます..."
                      />
                    </div>
                  </Form>
                </TabsContent>
                <TabsContent value="summary">
                  <Textarea
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    className="h-[calc(100vh-16rem)]"
                    placeholder="文字起こしの要約がここに表示されます..."
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
