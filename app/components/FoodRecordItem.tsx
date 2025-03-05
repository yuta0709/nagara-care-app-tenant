import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Coffee,
  UtensilsCrossed,
  Soup,
  Croissant,
  Plus as PlusIcon,
} from "lucide-react";

type FoodRecordItemProps = {
  record: any;
  date: string;
  mealTime: "BREAKFAST" | "LUNCH" | "DINNER";
  residentUid: string;
  linkPrefix: string;
};

export function FoodRecordItem({
  record,
  date,
  mealTime,
  residentUid,
  linkPrefix,
}: FoodRecordItemProps) {
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

  if (record) {
    return (
      <Link
        to={`${linkPrefix}/${residentUid}/food-records/${record.uid}`}
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
                className={getPercentageColor(record.mainCoursePercentage)}
              >
                {record.mainCoursePercentage}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`${getProgressColor(
                  record.mainCoursePercentage
                )} h-1.5 rounded-full`}
                style={{
                  width: `${record.mainCoursePercentage}%`,
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
              <Badge className={getPercentageColor(record.sideDishPercentage)}>
                {record.sideDishPercentage}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`${getProgressColor(
                  record.sideDishPercentage
                )} h-1.5 rounded-full`}
                style={{
                  width: `${record.sideDishPercentage}%`,
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
              <Badge className={getPercentageColor(record.soupPercentage)}>
                {record.soupPercentage}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`${getProgressColor(
                  record.soupPercentage
                )} h-1.5 rounded-full`}
                style={{
                  width: `${record.soupPercentage}%`,
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
              {getBeverageTypeLabel(record.beverageType)}
              {record.beverageVolume}ml
            </span>
          </div>
        </div>
      </Link>
    );
  } else {
    return (
      <div className="flex items-center justify-center h-[100px]">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link
            to={`/food-records/new?residentUid=${residentUid}&mealTime=${mealTime}&date=${date}`}
          >
            <PlusIcon className="mr-1 h-3 w-3" />
            記録
          </Link>
        </Button>
      </div>
    );
  }
}
