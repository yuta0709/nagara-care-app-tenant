import { Link, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Plus as PlusIcon } from "lucide-react";
import { getDailyFoodRecords, getResident } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.food-records.residents.$uid_";
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

  // 摂取率の平均を計算
  const calculateAveragePercentage = (record: any) => {
    if (!record) return "-";
    const sum =
      record.mainCoursePercentage +
      record.sideDishPercentage +
      record.soupPercentage;
    return Math.round(sum / 3) + "%";
  };

  return (
    <div className="space-y-6">
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
          <Link to={`/food-records/new?residentUid=${params.uid}`}>
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
                  <TableHead>日付</TableHead>
                  <TableHead>朝食</TableHead>
                  <TableHead>昼食</TableHead>
                  <TableHead>夕食</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyFoodRecords.items.map((dailyRecord) => (
                  <TableRow key={dailyRecord.date}>
                    <TableCell className="font-medium">
                      {format(new Date(dailyRecord.date), "yyyy年MM月dd日(E)", {
                        locale: ja,
                      })}
                    </TableCell>
                    <TableCell>
                      {dailyRecord.breakfast ? (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>摂取率:</span>
                            <span>
                              {calculateAveragePercentage(
                                dailyRecord.breakfast
                              )}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <Link
                              to={`/food-records/residents/${params.uid}/${dailyRecord.breakfast.uid}`}
                            >
                              詳細
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <Link
                            to={`/food-records/new?residentUid=${params.uid}&mealTime=BREAKFAST&date=${dailyRecord.date}`}
                          >
                            <PlusIcon className="mr-1 h-3 w-3" />
                            記録
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {dailyRecord.lunch ? (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>摂取率:</span>
                            <span>
                              {calculateAveragePercentage(dailyRecord.lunch)}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <Link
                              to={`/food-records/residents/${params.uid}/${dailyRecord.lunch.uid}`}
                            >
                              詳細
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <Link
                            to={`/food-records/new?residentUid=${params.uid}&mealTime=LUNCH&date=${dailyRecord.date}`}
                          >
                            <PlusIcon className="mr-1 h-3 w-3" />
                            記録
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {dailyRecord.dinner ? (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>摂取率:</span>
                            <span>
                              {calculateAveragePercentage(dailyRecord.dinner)}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <Link
                              to={`/food-records/residents/${params.uid}/${dailyRecord.dinner.uid}`}
                            >
                              詳細
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <Link
                            to={`/food-records/new?residentUid=${params.uid}&mealTime=DINNER&date=${dailyRecord.date}`}
                          >
                            <PlusIcon className="mr-1 h-3 w-3" />
                            記録
                          </Link>
                        </Button>
                      )}
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
