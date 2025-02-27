import { Link, useParams, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Plus as PlusIcon, ChevronLeft } from "lucide-react";
import { getBathRecords, getResident } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.residents.$uid.bath-records_";
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
import { DateDisplay } from "~/components/DateDisplay";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { uid } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");

  const resident = await getResident(uid, uid);
  const bathRecords = await getBathRecords(uid);

  return {
    resident,
    bathRecords,
  };
}

export default function ResidentBathRecordsPage({
  loaderData,
}: Route.ComponentProps) {
  const { resident, bathRecords } = loaderData;
  const params = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/residents/${params.uid}`);
  };

  // 日付ごとに入浴記録をグループ化
  const groupedRecords = bathRecords.items.reduce((acc, record) => {
    const date = record.recordedAt.split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, typeof bathRecords.items>);

  // 日付の降順でソート
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="p-4">
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {resident.familyName} {resident.givenName}さんの入浴記録
        </h1>
        <Button asChild>
          <Link to={`/residents/${params.uid}/bath-records/new`}>
            <PlusIcon className="mr-2 h-4 w-4" />
            新規記録
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>入浴記録一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {bathRecords.items.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              入浴記録がありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">日時</TableHead>
                  <TableHead>入浴方法</TableHead>
                  <TableHead className="w-[200px]">備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDates.map((date) => (
                  <>
                    {groupedRecords[date].map((record) => (
                      <TableRow
                        key={record.uid}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          navigate(
                            `/residents/${params.uid}/bath-records/${record.uid}`
                          )
                        }
                      >
                        <TableCell className="font-medium">
                          {format(
                            new Date(record.recordedAt),
                            "yyyy/MM/dd HH:mm",
                            { locale: ja }
                          )}
                        </TableCell>
                        <TableCell>{record.bathMethod}</TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {record.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
