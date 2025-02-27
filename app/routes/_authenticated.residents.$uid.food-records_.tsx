import { Link, useParams, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Plus as PlusIcon,
  Coffee,
  UtensilsCrossed,
  Soup,
  Croissant,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { getDailyFoodRecords, getResident } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.residents.$uid.food-records_";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { FoodRecordItem } from "~/components/FoodRecordItem";
import { DateDisplay } from "~/components/DateDisplay";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { uid } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");

  const resident = await getResident(uid, uid);
  const dailyFoodRecords = await getDailyFoodRecords(uid);

  return {
    resident,
    dailyFoodRecords,
  };
}

export default function ResidentFoodRecordsPage({
  loaderData,
}: Route.ComponentProps) {
  const { resident, dailyFoodRecords } = loaderData;
  const params = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/residents/${params.uid}`);
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

  // 食事時間帯のアイコンを取得
  const getMealTimeIcon = (mealTime: string) => {
    switch (mealTime) {
      case "BREAKFAST":
        return <Coffee className="h-4 w-4" />;
      case "LUNCH":
        return <UtensilsCrossed className="h-4 w-4" />;
      case "DINNER":
        return <Soup className="h-4 w-4" />;
      default:
        return <UtensilsCrossed className="h-4 w-4" />;
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

  // 摂取率の平均を計算
  const calculateAveragePercentage = (record: any) => {
    if (!record) return "-";
    const sum =
      record.mainCoursePercentage +
      record.sideDishPercentage +
      record.soupPercentage;
    return Math.round(sum / 3);
  };

  // 摂取率に基づいた色を返す
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 50)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  // 摂取率に基づいたプログレスバーの色を返す
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {resident.familyName} {resident.givenName}さんの食事記録
          </h1>
          <p className="text-sm text-muted-foreground">
            {resident.familyNameFurigana} {resident.givenNameFurigana}
          </p>
        </div>
        <Button asChild>
          <Link to={`/residents/${params.uid}/food-records/new`}>
            <PlusIcon className="mr-2 h-4 w-4" />
            新規記録
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>日別食事記録</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyFoodRecords.items.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              食事記録がありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">日付</TableHead>
                  <TableHead>朝食</TableHead>
                  <TableHead>昼食</TableHead>
                  <TableHead>夕食</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyFoodRecords.items.map((dailyRecord) => (
                  <TableRow key={dailyRecord.date}>
                    <TableCell className="font-medium">
                      <DateDisplay date={dailyRecord.date} />
                    </TableCell>
                    <TableCell>
                      <FoodRecordItem
                        record={dailyRecord.breakfast}
                        date={dailyRecord.date}
                        mealTime="BREAKFAST"
                        residentUid={params.uid || ""}
                        linkPrefix="/residents"
                      />
                    </TableCell>
                    <TableCell>
                      <FoodRecordItem
                        record={dailyRecord.lunch}
                        date={dailyRecord.date}
                        mealTime="LUNCH"
                        residentUid={params.uid || ""}
                        linkPrefix="/residents"
                      />
                    </TableCell>
                    <TableCell>
                      <FoodRecordItem
                        record={dailyRecord.dinner}
                        date={dailyRecord.date}
                        mealTime="DINNER"
                        residentUid={params.uid || ""}
                        linkPrefix="/residents"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
