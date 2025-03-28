import type { Route } from "./+types/_authenticated.assessments.new";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  getMe,
  getSubjects,
  createSubject,
  createAssessment,
} from "~/api/nagaraCareAPI";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import type { SubjectCreateInputDto, SubjectDto } from "~/api/nagaraCareAPI";
import { Form, Link, redirect, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Separator } from "~/components/ui/separator";

export async function clientLoader() {
  const me = await getMe();
  const subjects = await getSubjects();
  return {
    subjects,
    tenantUid: me.tenantUid,
  };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create_subject") {
    const tenantUid = formData.get("tenantUid") as string;
    const subject = {
      familyName: formData.get("familyName") as string,
      givenName: formData.get("givenName") as string,
      familyNameFurigana: formData.get("familyNameFurigana") as string,
      givenNameFurigana: formData.get("givenNameFurigana") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      gender: formData.get("gender") as "MALE" | "FEMALE",
    };

    const createdSubject = await createSubject(subject);
    const assessment = await createAssessment({
      subjectUid: createdSubject.uid,
    });
    return redirect(`/assessments/${assessment.uid}`);
  }

  if (intent === "create_assessment") {
    const subjectUid = formData.get("subjectUid") as string;
    const assessment = await createAssessment({
      subjectUid,
    });
    return redirect(`/assessments/${assessment.uid}`);
  }

  return null;
}

export default function AssessmentNew({ loaderData }: Route.ComponentProps) {
  const { subjects, tenantUid } = loaderData;
  const [isCreatingNewSubject, setIsCreatingNewSubject] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/assessments");
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
          <CardTitle className="text-xl">新規アセスメント作成</CardTitle>
          <CardDescription>
            対象者を選択するか、新規対象者を作成してください
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            {!isCreatingNewSubject ? (
              <>
                <div className="space-y-4">
                  <Form method="post" className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="subjectUid"
                        className="text-base font-medium"
                      >
                        対象者
                      </Label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Select name="subjectUid" required>
                          <SelectTrigger className="w-full sm:w-[300px] h-11">
                            <SelectValue placeholder="対象者を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.items.map((subject: SubjectDto) => (
                              <SelectItem key={subject.uid} value={subject.uid}>
                                {subject.familyName} {subject.givenName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="submit"
                          name="intent"
                          value="create_assessment"
                          className="w-full sm:w-auto"
                        >
                          アセスメントを作成
                        </Button>
                      </div>
                    </div>
                  </Form>

                  <Separator className="my-4" />

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      対象者が見つからない場合は新規作成してください
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingNewSubject(true)}
                    >
                      新規対象者を作成
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <Form method="post" className="space-y-5">
                <input type="hidden" name="tenantUid" value={tenantUid} />
                <input type="hidden" name="intent" value="create_subject" />

                <div>
                  <h3 className="text-base font-medium mb-3">基本情報</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="familyName">姓</Label>
                      <Input
                        id="familyName"
                        name="familyName"
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="givenName">名</Label>
                      <Input
                        id="givenName"
                        name="givenName"
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyNameFurigana">姓（フリガナ）</Label>
                      <Input
                        id="familyNameFurigana"
                        name="familyNameFurigana"
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="givenNameFurigana">名（フリガナ）</Label>
                      <Input
                        id="givenNameFurigana"
                        name="givenNameFurigana"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-2" />

                <div>
                  <h3 className="text-base font-medium mb-3">個人情報</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dateOfBirth">生年月日</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        required
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label>性別</Label>
                      <RadioGroup
                        name="gender"
                        defaultValue="MALE"
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="MALE" id="male" />
                          <Label htmlFor="male">男性</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FEMALE" id="female" />
                          <Label htmlFor="female">女性</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <CardFooter className="flex justify-end space-x-4 px-0 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingNewSubject(false)}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit" className="px-6">
                    対象者を作成
                  </Button>
                </CardFooter>
              </Form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
