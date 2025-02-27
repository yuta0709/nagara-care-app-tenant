import { Link, useParams, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Plus as PlusIcon, ChevronLeft } from "lucide-react";
import { getEliminationRecords, getResident } from "~/api/nagaraCareAPI";

import type { Route } from "./+types/_authenticated.residents.$uid.elimination-records_";
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
  const eliminationRecords = await getEliminationRecords(uid);

  return {
    resident,
    eliminationRecords,
  };
}

export default function ResidentEliminationRecordsPage({
  loaderData,
}: Route.ComponentProps) {
  const { resident, eliminationRecords } = loaderData;
  const params = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/residents/${params.uid}`);
  };

  // 日付ごとに排泄記録をグループ化
  const groupedRecords = eliminationRecords.items.reduce((acc, record) => {
    const date = record.recordedAt.split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, typeof eliminationRecords.items>);

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
          {resident.familyName} {resident.givenName}さんの排泄記録
        </h1>
        <Button asChild>
          <Link to={`/residents/${params.uid}/elimination-records/new`}>
            <PlusIcon className="mr-2 h-4 w-4" />
            新規記録
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>排泄記録一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {eliminationRecords.items.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              排泄記録がありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">日時</TableHead>
                  <TableHead>排泄方法</TableHead>
                  <TableHead>便</TableHead>
                  <TableHead>尿</TableHead>
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
                            `/residents/${params.uid}/elimination-records/${record.uid}`
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
                        <TableCell>{record.eliminationMethod}</TableCell>
                        <TableCell>
                          {record.hasFeces ? (
                            <div>
                              <div>{record.fecesAppearance}</div>
                              <div className="text-xs text-muted-foreground">
                                {record.fecesVolume}g
                                {record.fecalIncontinence && " (失禁あり)"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">なし</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.hasUrine ? (
                            <div>
                              <div>{record.urineAppearance}</div>
                              <div className="text-xs text-muted-foreground">
                                {record.urineVolume}ml
                                {record.urinaryIncontinence && " (失禁あり)"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">なし</span>
                          )}
                        </TableCell>
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
