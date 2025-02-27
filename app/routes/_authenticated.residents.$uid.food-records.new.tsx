import { useState, useEffect } from "react";
import { Form, redirect, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/_authenticated.residents.$uid.food-records.new";
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
import {
  getResident,
  createFoodRecord,
  FoodRecordCreateInputDtoMealTime,
} from "~/api/nagaraCareAPI";
import { format } from "date-fns";
import { ChevronLeft, Clock } from "lucide-react";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { uid } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");

  const resident = await getResident(uid, uid);
  return {
    resident,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const { uid } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");

  const formData = await request.formData();
  const mealTime = formData.get(
    "mealTime"
  ) as keyof typeof FoodRecordCreateInputDtoMealTime;
  const useCustomDateTime = formData.get("useCustomDateTime") === "true";
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;

  // 日付と時間が明示的に指定されている場合はそれを使用、そうでなければ現在時刻
  let recordedAt: string;
  if (useCustomDateTime && date) {
    const dateObj = new Date(date);

    // 時間が指定されている場合は、その時間を設定
    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      dateObj.setHours(hours, minutes, 0, 0);
    } else {
      // 時間が指定されていない場合は、食事時間帯に応じたデフォルト時間を設定
      switch (mealTime) {
        case "BREAKFAST":
          dateObj.setHours(7, 0, 0, 0);
          break;
        case "LUNCH":
          dateObj.setHours(12, 0, 0, 0);
          break;
        case "DINNER":
          dateObj.setHours(18, 0, 0, 0);
          break;
        default:
          dateObj.setHours(12, 0, 0, 0);
      }
    }

    recordedAt = dateObj.toISOString();
  } else {
    recordedAt = new Date().toISOString();
  }

  // 初期値で食事記録を作成
  const foodRecord = await createFoodRecord(uid, {
    recordedAt,
    mealTime,
    mainCoursePercentage: 0,
    sideDishPercentage: 0,
    soupPercentage: 0,
    beverageType: "WATER",
    beverageVolume: 0,
    notes: "",
  });

  return redirect(`/residents/${uid}/food-records/${foodRecord.uid}`);
}

export default function NewFoodRecordPage({
  loaderData,
}: Route.ComponentProps) {
  const { resident } = loaderData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedMealTime, setSelectedMealTime] = useState<string>(
    searchParams.get("mealTime") || ""
  );

  // 日付と時間を明示的に指定するかどうか
  const [useCustomDateTime, setUseCustomDateTime] = useState(false);

  // 日付の初期値を設定
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState<string>(searchParams.get("date") || today);

  // 時間の初期値を設定
  const now = new Date();
  const defaultTime = format(now, "HH:mm");
  const [time, setTime] = useState<string>(defaultTime);

  // 食事時間帯が変更されたときに、デフォルトの時間を設定
  useEffect(() => {
    if (selectedMealTime) {
      switch (selectedMealTime) {
        case "BREAKFAST":
          setTime("07:00");
          break;
        case "LUNCH":
          setTime("12:00");
          break;
        case "DINNER":
          setTime("18:00");
          break;
      }
    }
  }, [selectedMealTime]);

  const handleCancel = () => {
    navigate(`/residents/${resident.uid}/food-records`);
  };

  const handleBack = () => {
    navigate(`/residents/${resident.uid}/food-records`);
  };

  // 日付と時間を明示的に指定する場合は、両方の入力が必要
  // 指定しない場合は、食事時間帯のみ必須
  const isFormValid =
    selectedMealTime && (!useCustomDateTime || (date && time));

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
            <span className="font-medium">
              {resident.familyName} {resident.givenName}
            </span>
            さんの食事記録を作成します
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form method="post" className="space-y-6">
            <input
              type="hidden"
              name="useCustomDateTime"
              value={useCustomDateTime.toString()}
            />

            <div className="space-y-5">
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

              <Separator className="my-4" />

              <div className="border rounded-md p-5 bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium text-base">
                      日時を指定する
                    </span>
                  </div>
                  <Switch
                    checked={useCustomDateTime}
                    onCheckedChange={setUseCustomDateTime}
                  />
                </div>

                {useCustomDateTime && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">日付</Label>
                      <Input
                        type="date"
                        id="date"
                        name="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required={useCustomDateTime}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">時間</Label>
                      <Input
                        type="time"
                        id="time"
                        name="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required={useCustomDateTime}
                        className="h-11"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 text-sm text-muted-foreground">
                  {useCustomDateTime
                    ? "指定した日時で記録します"
                    : "現在の日時で記録します"}
                </div>
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
