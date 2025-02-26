import { Link, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Plus as PlusIcon,
  Coffee,
  UtensilsCrossed,
  Soup,
  Croissant,
  Clock,
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
                      <div className="flex flex-col">
                        <span>
                          {format(
                            new Date(dailyRecord.date),
                            "yyyy年MM月dd日",
                            {
                              locale: ja,
                            }
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(dailyRecord.date), "(E)", {
                            locale: ja,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dailyRecord.breakfast ? (
                        <Link
                          to={`/residents/${params.uid}/food-records/${dailyRecord.breakfast.uid}`}
                          className="block p-3 -m-2 rounded-lg transition-all hover:bg-muted/50 border border-transparent hover:border-muted hover:shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Croissant className="h-3.5 w-3.5 text-amber-600" />
                                  <span>主食</span>
                                </div>
                                <Badge
                                  className={getPercentageColor(
                                    dailyRecord.breakfast.mainCoursePercentage
                                  )}
                                >
                                  {dailyRecord.breakfast.mainCoursePercentage}%
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`${getProgressColor(
                                    dailyRecord.breakfast.mainCoursePercentage
                                  )} h-1.5 rounded-full`}
                                  style={{
                                    width: `${dailyRecord.breakfast.mainCoursePercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                  <UtensilsCrossed className="h-3.5 w-3.5 text-green-600" />
                                  <span>副食</span>
                                </div>
                                <Badge
                                  className={getPercentageColor(
                                    dailyRecord.breakfast.sideDishPercentage
                                  )}
                                >
                                  {dailyRecord.breakfast.sideDishPercentage}%
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`${getProgressColor(
                                    dailyRecord.breakfast.sideDishPercentage
                                  )} h-1.5 rounded-full`}
                                  style={{
                                    width: `${dailyRecord.breakfast.sideDishPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Soup className="h-3.5 w-3.5 text-orange-600" />
                                  <span>汁物</span>
                                </div>
                                <Badge
                                  className={getPercentageColor(
                                    dailyRecord.breakfast.soupPercentage
                                  )}
                                >
                                  {dailyRecord.breakfast.soupPercentage}%
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`${getProgressColor(
                                    dailyRecord.breakfast.soupPercentage
                                  )} h-1.5 rounded-full`}
                                  style={{
                                    width: `${dailyRecord.breakfast.soupPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm pt-1 border-t">
                              <div className="flex items-center gap-1.5">
                                <Coffee className="h-3.5 w-3.5 text-blue-600" />
                                <span>飲み物</span>
                              </div>
                              <span className="text-sm font-medium">
                                {getBeverageTypeLabel(
                                  dailyRecord.breakfast.beverageType
                                )}
                                {dailyRecord.breakfast.beverageVolume}ml
                              </span>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-center h-[100px]">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <Link
                              to={`/residents/${params.uid}/food-records/new?mealTime=BREAKFAST&date=${dailyRecord.date}`}
                            >
                              <PlusIcon className="mr-1 h-3 w-3" />
                              記録
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {dailyRecord.lunch ? (
                        <Link
                          to={`/residents/${params.uid}/food-records/${dailyRecord.lunch.uid}`}
                          className="block p-3 -m-2 rounded-lg transition-all hover:bg-muted/50 border border-transparent hover:border-muted hover:shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Croissant className="h-3.5 w-3.5 text-amber-600" />
                                  <span>主食</span>
                                </div>
                                <Badge
                                  className={getPercentageColor(
                                    dailyRecord.lunch.mainCoursePercentage
                                  )}
                                >
                                  {dailyRecord.lunch.mainCoursePercentage}%
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`${getProgressColor(
                                    dailyRecord.lunch.mainCoursePercentage
                                  )} h-1.5 rounded-full`}
                                  style={{
                                    width: `${dailyRecord.lunch.mainCoursePercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                  <UtensilsCrossed className="h-3.5 w-3.5 text-green-600" />
                                  <span>副食</span>
                                </div>
                                <Badge
                                  className={getPercentageColor(
                                    dailyRecord.lunch.sideDishPercentage
                                  )}
                                >
                                  {dailyRecord.lunch.sideDishPercentage}%
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`${getProgressColor(
                                    dailyRecord.lunch.sideDishPercentage
                                  )} h-1.5 rounded-full`}
                                  style={{
                                    width: `${dailyRecord.lunch.sideDishPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Soup className="h-3.5 w-3.5 text-orange-600" />
                                  <span>汁物</span>
                                </div>
                                <Badge
                                  className={getPercentageColor(
                                    dailyRecord.lunch.soupPercentage
                                  )}
                                >
                                  {dailyRecord.lunch.soupPercentage}%
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`${getProgressColor(
                                    dailyRecord.lunch.soupPercentage
                                  )} h-1.5 rounded-full`}
                                  style={{
                                    width: `${dailyRecord.lunch.soupPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm pt-1 border-t">
                              <div className="flex items-center gap-1.5">
                                <Coffee className="h-3.5 w-3.5 text-blue-600" />
                                <span>飲み物</span>
                              </div>
                              <span className="text-sm font-medium">
                                {getBeverageTypeLabel(
                                  dailyRecord.lunch.beverageType
                                )}
                                {dailyRecord.lunch.beverageVolume}ml
                              </span>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-center h-[100px]">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <Link
                              to={`/residents/${params.uid}/food-records/new?mealTime=LUNCH&date=${dailyRecord.date}`}
                            >
                              <PlusIcon className="mr-1 h-3 w-3" />
                              記録
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {dailyRecord.dinner ? (
                        <Link
                          to={`/residents/${params.uid}/food-records/${dailyRecord.dinner.uid}`}
                          className="block p-3 -m-2 rounded-lg transition-all hover:bg-muted/50 border border-transparent hover:border-muted hover:shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Croissant className="h-3.5 w-3.5 text-amber-600" />
                                  <span>主食</span>
                                </div>
                                <Badge
                                  className={getPercentageColor(
                                    dailyRecord.dinner.mainCoursePercentage
                                  )}
                                >
                                  {dailyRecord.dinner.mainCoursePercentage}%
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`${getProgressColor(
                                    dailyRecord.dinner.mainCoursePercentage
                                  )} h-1.5 rounded-full`}
                                  style={{
                                    width: `${dailyRecord.dinner.mainCoursePercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                  <UtensilsCrossed className="h-3.5 w-3.5 text-green-600" />
                                  <span>副食</span>
                                </div>
                                <Badge
                                  className={getPercentageColor(
                                    dailyRecord.dinner.sideDishPercentage
                                  )}
                                >
                                  {dailyRecord.dinner.sideDishPercentage}%
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`${getProgressColor(
                                    dailyRecord.dinner.sideDishPercentage
                                  )} h-1.5 rounded-full`}
                                  style={{
                                    width: `${dailyRecord.dinner.sideDishPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Soup className="h-3.5 w-3.5 text-orange-600" />
                                  <span>汁物</span>
                                </div>
                                <Badge
                                  className={getPercentageColor(
                                    dailyRecord.dinner.soupPercentage
                                  )}
                                >
                                  {dailyRecord.dinner.soupPercentage}%
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className={`${getProgressColor(
                                    dailyRecord.dinner.soupPercentage
                                  )} h-1.5 rounded-full`}
                                  style={{
                                    width: `${dailyRecord.dinner.soupPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm pt-1 border-t">
                              <div className="flex items-center gap-1.5">
                                <Coffee className="h-3.5 w-3.5 text-blue-600" />
                                <span>飲み物</span>
                              </div>
                              <span className="text-sm font-medium">
                                {getBeverageTypeLabel(
                                  dailyRecord.dinner.beverageType
                                )}
                                {dailyRecord.dinner.beverageVolume}ml
                              </span>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-center h-[100px]">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <Link
                              to={`/residents/${params.uid}/food-records/new?mealTime=DINNER&date=${dailyRecord.date}`}
                            >
                              <PlusIcon className="mr-1 h-3 w-3" />
                              記録
                            </Link>
                          </Button>
                        </div>
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
