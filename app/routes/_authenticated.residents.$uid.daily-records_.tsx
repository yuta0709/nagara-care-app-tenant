import { Link, useNavigate, useParams } from "react-router";
import type { Route } from "./+types/_authenticated.residents.$uid.daily-records_";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  getDailyRecords,
  getResident,
  type DailyRecordDto,
} from "~/api/nagaraCareAPI";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { uid } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");

  const resident = await getResident(uid, uid);
  const dailyRecords = await getDailyRecords(uid);

  return {
    resident,
    dailyRecords,
  };
}

export default function ResidentDailyRecordsPage({
  loaderData,
}: Route.ComponentProps) {
  const { resident, dailyRecords } = loaderData;
  const navigate = useNavigate();
  const params = useParams();

  const handleBack = () => {
    navigate(`/residents/${params.uid}`);
  };

  // 日常の状態に応じたバッジの色とラベルを取得する関数
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NORMAL":
        return {
          label: "普通",
          variant: "outline" as const,
        };
      case "WARNING":
        return {
          label: "注意",
          variant: "secondary" as const,
        };
      case "ALERT":
        return {
          label: "警告",
          variant: "destructive" as const,
        };
      default:
        return {
          label: "不明",
          variant: "outline" as const,
        };
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center text-muted-foreground"
          onClick={handleBack}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          戻る
        </Button>
        <Button
          size="sm"
          className="flex items-center"
          onClick={() => navigate(`/residents/${params.uid}/daily-records/new`)}
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          新規記録
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {resident.familyName} {resident.givenName}さんの日常記録
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>日常記録一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyRecords.items.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              日常記録がありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">日時</TableHead>
                  <TableHead className="w-[120px]">状態</TableHead>
                  <TableHead>メモ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyRecords.items.map((record: DailyRecordDto) => {
                  const statusBadge = getStatusBadge(record.dailyStatus);
                  return (
                    <TableRow key={record.uid}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/residents/${params.uid}/daily-records/${record.uid}`}
                          className="hover:underline"
                        >
                          {format(
                            new Date(record.recordedAt),
                            "yyyy/MM/dd HH:mm",
                            {
                              locale: ja,
                            }
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {record.notes}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
