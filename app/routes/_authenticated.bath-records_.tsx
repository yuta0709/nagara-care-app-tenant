import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Plus as PlusIcon } from "lucide-react";
import { getMe, getResidents } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.bath-records_";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const me = await getMe();
  const residents = await getResidents(me.tenantUid);
  return {
    residents,
  };
}

export default function BathRecordsPage({ loaderData }: Route.ComponentProps) {
  const { residents } = loaderData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>入浴記録</CardTitle>
            <Button asChild>
              <Link to="/bath-records/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                新規作成
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {residents.items.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              利用者がいません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>利用者名</TableHead>
                  <TableHead>フリガナ</TableHead>
                  <TableHead>年齢</TableHead>
                  <TableHead>性別</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.items.map((resident) => (
                  <TableRow key={resident.uid}>
                    <TableCell>
                      {resident.familyName} {resident.givenName}
                    </TableCell>
                    <TableCell>
                      {resident.familyNameFurigana} {resident.givenNameFurigana}
                    </TableCell>
                    <TableCell>
                      {calculateAge(resident.dateOfBirth)}歳
                    </TableCell>
                    <TableCell>
                      {resident.gender === "MALE" ? "男性" : "女性"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/residents/${resident.uid}/bath-records`}>
                          詳細
                        </Link>
                      </Button>
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

// 年齢を計算する関数
function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
