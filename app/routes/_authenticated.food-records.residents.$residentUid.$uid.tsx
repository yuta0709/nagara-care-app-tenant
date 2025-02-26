import { useState } from "react";
import { Form, redirect, useNavigate } from "react-router";
import type { Route } from "./+types/_authenticated.food-records.residents.$residentUid.$uid";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Slider } from "~/components/ui/slider";
import {
  getFoodRecords,
  getResident,
  updateFoodRecord,
  deleteFoodRecord,
  FoodRecordUpdateInputDtoMealTime,
  FoodRecordUpdateInputDtoBeverageType,
} from "~/api/nagaraCareAPI";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { residentUid, uid } = params;
  if (!residentUid || !uid) throw new Error("必要なパラメータが不足しています");

  // 食事記録一覧を取得して、その中から特定のUIDの記録を見つける
  const foodRecordsResponse = await getFoodRecords(residentUid);
  const foodRecord = foodRecordsResponse.items.find(
    (record) => record.uid === uid
  );

  if (!foodRecord) {
    throw new Error("指定された食事記録が見つかりません");
  }

  const resident = await getResident(residentUid, residentUid);

  return {
    resident,
    foodRecord,
  };
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const { residentUid, uid } = params;
  if (!residentUid || !uid) throw new Error("必要なパラメータが不足しています");

  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "delete") {
    await deleteFoodRecord(residentUid, uid);
    return redirect(`/food-records/residents/${residentUid}`);
  }

  const mealTime = formData.get(
    "mealTime"
  ) as keyof typeof FoodRecordUpdateInputDtoMealTime;
  const beverageType = formData.get(
    "beverageType"
  ) as keyof typeof FoodRecordUpdateInputDtoBeverageType;
  const mainCoursePercentage = parseInt(
    formData.get("mainCoursePercentage") as string,
    10
  );
  const sideDishPercentage = parseInt(
    formData.get("sideDishPercentage") as string,
    10
  );
  const soupPercentage = parseInt(formData.get("soupPercentage") as string, 10);
  const beverageVolume = parseInt(formData.get("beverageVolume") as string, 10);
  const notes = formData.get("notes") as string;
  const recordedAt = formData.get("recordedAt") as string;

  await updateFoodRecord(residentUid, uid, {
    recordedAt,
    mealTime,
    mainCoursePercentage,
    sideDishPercentage,
    soupPercentage,
    beverageType,
    beverageVolume,
    notes,
  });

  return redirect(`/food-records/residents/${residentUid}`);
}

export default function FoodRecordDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { resident, foodRecord } = loaderData;
  const navigate = useNavigate();

  const [mainCoursePercentage, setMainCoursePercentage] = useState(
    foodRecord.mainCoursePercentage
  );
  const [sideDishPercentage, setSideDishPercentage] = useState(
    foodRecord.sideDishPercentage
  );
  const [soupPercentage, setSoupPercentage] = useState(
    foodRecord.soupPercentage
  );
  const [beverageVolume, setBeverageVolume] = useState(
    foodRecord.beverageVolume
  );
  const [mealTime, setMealTime] = useState<
    keyof typeof FoodRecordUpdateInputDtoMealTime
  >(foodRecord.mealTime);
  const [beverageType, setBeverageType] = useState<
    keyof typeof FoodRecordUpdateInputDtoBeverageType
  >(foodRecord.beverageType);
  const [notes, setNotes] = useState(foodRecord.notes);

  const handleCancel = () => {
    navigate(`/food-records/residents/${resident.uid}`);
  };

  // 食事時間帯の日本語表示
  const getMealTimeLabel = (mealTime: string) => {
    switch (mealTime) {
      case "BREAKFAST":
        return "朝食";
      case "LUNCH":
        return "昼食";
      case "DINNER":
        return "夕食";
      default:
        return mealTime;
    }
  };

  // 飲み物の種類の日本語表示
  const getBeverageTypeLabel = (beverageType: string) => {
    switch (beverageType) {
      case "WATER":
        return "水";
      case "TEA":
        return "お茶";
      case "OTHER":
        return "その他";
      default:
        return beverageType;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>食事記録の詳細</CardTitle>
          <CardDescription>
            {resident.familyName} {resident.givenName}さんの
            {getMealTimeLabel(foodRecord.mealTime)}の記録 -
            {format(new Date(foodRecord.recordedAt), "yyyy年MM月dd日 HH:mm", {
              locale: ja,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <input
              type="hidden"
              name="recordedAt"
              value={foodRecord.recordedAt}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mealTime">食事の時間帯</Label>
                <Select
                  name="mealTime"
                  value={mealTime}
                  onValueChange={(
                    value: keyof typeof FoodRecordUpdateInputDtoMealTime
                  ) => setMealTime(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="時間帯を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BREAKFAST">朝食</SelectItem>
                    <SelectItem value="LUNCH">昼食</SelectItem>
                    <SelectItem value="DINNER">夕食</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beverageType">飲み物の種類</Label>
                <Select
                  name="beverageType"
                  value={beverageType}
                  onValueChange={(
                    value: keyof typeof FoodRecordUpdateInputDtoBeverageType
                  ) => setBeverageType(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="飲み物を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WATER">水</SelectItem>
                    <SelectItem value="TEA">お茶</SelectItem>
                    <SelectItem value="OTHER">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="mainCoursePercentage">主食の摂取率</Label>
                  <span className="text-sm text-muted-foreground">
                    {mainCoursePercentage}%
                  </span>
                </div>
                <Slider
                  id="mainCoursePercentage"
                  name="mainCoursePercentage"
                  value={[mainCoursePercentage]}
                  onValueChange={(values: number[]) =>
                    setMainCoursePercentage(values[0])
                  }
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="sideDishPercentage">副食の摂取率</Label>
                  <span className="text-sm text-muted-foreground">
                    {sideDishPercentage}%
                  </span>
                </div>
                <Slider
                  id="sideDishPercentage"
                  name="sideDishPercentage"
                  value={[sideDishPercentage]}
                  onValueChange={(values: number[]) =>
                    setSideDishPercentage(values[0])
                  }
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="soupPercentage">汁物の摂取率</Label>
                  <span className="text-sm text-muted-foreground">
                    {soupPercentage}%
                  </span>
                </div>
                <Slider
                  id="soupPercentage"
                  name="soupPercentage"
                  value={[soupPercentage]}
                  onValueChange={(values: number[]) =>
                    setSoupPercentage(values[0])
                  }
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beverageVolume">飲み物の摂取量 (ml)</Label>
                <Input
                  id="beverageVolume"
                  name="beverageVolume"
                  type="number"
                  min={0}
                  value={beverageVolume}
                  onChange={(e) =>
                    setBeverageVolume(parseInt(e.target.value, 10))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="submit"
                name="_action"
                value="delete"
                variant="destructive"
              >
                削除
              </Button>

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  キャンセル
                </Button>
                <Button type="submit" name="_action" value="update">
                  保存
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
