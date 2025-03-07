import { useState, useEffect } from "react";
import { Form, redirect, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/_authenticated.food-records.new";
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
import {
  getMe,
  getResidents,
  createFoodRecord,
  FoodRecordCreateInputDtoMealTime,
} from "~/api/nagaraCareAPI";
import { ChevronLeft } from "lucide-react";
import { Separator } from "~/components/ui/separator";

export async function clientLoader() {
  const me = await getMe();
  const residents = await getResidents(me.tenantUid);
  return {
    residents,
  };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const residentUid = formData.get("residentUid") as string;
  const mealTime = formData.get(
    "mealTime"
  ) as keyof typeof FoodRecordCreateInputDtoMealTime;
  const date = formData.get("date") as string;

  // 日付が指定されている場合はその日の12時を使用、そうでなければ現在時刻
  let recordedAt: string;
  if (date) {
    const dateObj = new Date(date);
    dateObj.setHours(12, 0, 0, 0);
    recordedAt = dateObj.toISOString();
  } else {
    recordedAt = new Date().toISOString();
  }

  // 初期値で食事記録を作成
  const foodRecord = await createFoodRecord(residentUid, {
    recordedAt,
    mealTime,
    mainCoursePercentage: 0,
    sideDishPercentage: 0,
    soupPercentage: 0,
    beverageType: "WATER",
    beverageVolume: 0,
    notes: "",
  });

  return redirect(`/residents/${residentUid}/food-records/${foodRecord.uid}`);
}

export default function NewFoodRecordPage({
  loaderData,
}: Route.ComponentProps) {
  const { residents } = loaderData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedResident, setSelectedResident] = useState<string>(
    searchParams.get("residentUid") || ""
  );
  const [selectedMealTime, setSelectedMealTime] = useState<string>(
    searchParams.get("mealTime") || ""
  );
  const [date, setDate] = useState<string>(searchParams.get("date") || "");

  const handleCancel = () => {
    navigate("/food-records");
  };

  const handleBack = () => {
    navigate("/food-records");
  };

  const isFormValid = selectedResident && selectedMealTime;

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
          <CardTitle className="text-xl">新規食事記録</CardTitle>
          <CardDescription>
            利用者と食事の時間帯を選択してください
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form method="post" className="space-y-6">
            {date && <input type="hidden" name="date" value={date} />}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="residentUid" className="text-base font-medium">
                  利用者
                </Label>
                <Select
                  name="residentUid"
                  value={selectedResident}
                  onValueChange={setSelectedResident}
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="利用者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.items.map((resident) => (
                      <SelectItem key={resident.uid} value={resident.uid}>
                        {resident.familyName} {resident.givenName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label htmlFor="mealTime" className="text-base font-medium">
                  食事の時間帯
                </Label>
                <Select
                  name="mealTime"
                  value={selectedMealTime}
                  onValueChange={setSelectedMealTime}
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="時間帯を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BREAKFAST">朝食</SelectItem>
                    <SelectItem value="LUNCH">昼食</SelectItem>
                    <SelectItem value="DINNER">夕食</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CardFooter className="flex justify-end space-x-4 px-0 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                キャンセル
              </Button>
              <Button type="submit" disabled={!isFormValid} className="px-6">
                作成
              </Button>
            </CardFooter>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
