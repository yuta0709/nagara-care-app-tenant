import { Link, useParams, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Plus as PlusIcon, ChevronLeft } from "lucide-react";
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
    navigate(`/food-records`);
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
                        linkPrefix="/food-records/residents"
                      />
                    </TableCell>
                    <TableCell>
                      <FoodRecordItem
                        record={dailyRecord.lunch}
                        date={dailyRecord.date}
                        mealTime="LUNCH"
                        residentUid={params.uid || ""}
                        linkPrefix="/food-records/residents"
                      />
                    </TableCell>
                    <TableCell>
                      <FoodRecordItem
                        record={dailyRecord.dinner}
                        date={dailyRecord.date}
                        mealTime="DINNER"
                        residentUid={params.uid || ""}
                        linkPrefix="/food-records/residents"
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
