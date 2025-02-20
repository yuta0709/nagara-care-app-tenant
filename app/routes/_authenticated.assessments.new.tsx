import type { Route } from "./+types/_authenticated.assessments.new";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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

export async function clientLoader() {
  const me = await getMe();
  const subjects = await getSubjects(me.tenantUid);
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

    const createdSubject = await createSubject(tenantUid, subject);
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

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>新規アセスメント作成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isCreatingNewSubject ? (
              <>
                <div className="flex items-center space-x-4">
                  <Form method="post" className="flex items-center space-x-4">
                    <Select name="subjectUid" required>
                      <SelectTrigger className="w-[300px]">
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
                    >
                      アセスメントを作成
                    </Button>
                  </Form>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingNewSubject(true)}
                  >
                    新規対象者を作成
                  </Button>
                </div>
              </>
            ) : (
              <Form method="post" className="space-y-4">
                <input type="hidden" name="tenantUid" value={tenantUid} />
                <input type="hidden" name="intent" value="create_subject" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="familyName">姓</Label>
                    <Input id="familyName" name="familyName" required />
                  </div>
                  <div>
                    <Label htmlFor="givenName">名</Label>
                    <Input id="givenName" name="givenName" required />
                  </div>
                  <div>
                    <Label htmlFor="familyNameFurigana">姓（フリガナ）</Label>
                    <Input
                      id="familyNameFurigana"
                      name="familyNameFurigana"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="givenNameFurigana">名（フリガナ）</Label>
                    <Input
                      id="givenNameFurigana"
                      name="givenNameFurigana"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">生年月日</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <Label>性別</Label>
                  <RadioGroup
                    name="gender"
                    defaultValue="MALE"
                    className="flex space-x-4"
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
                <div className="flex space-x-4">
                  <Button type="submit">対象者を作成</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingNewSubject(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
