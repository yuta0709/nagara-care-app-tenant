import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Plus as PlusIcon } from "lucide-react";
import { getMe, findQaSessionsByUser } from "~/api/nagaraCareAPI";
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
import type { Route } from "./+types/_authenticated.qa-sessions_";

export async function clientLoader() {
  const me = await getMe();
  const qaSessions = await findQaSessionsByUser();
  return {
    me,
    qaSessions,
  };
}

export default function QaSessionsPage({ loaderData }: Route.ComponentProps) {
  const { me, qaSessions } = loaderData;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>質疑応答セッション</CardTitle>
            <Button asChild>
              <Link to="/qa-sessions/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                新規作成
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {qaSessions.items.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              質疑応答セッションがありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>作成日時</TableHead>
                  <TableHead>質問数</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qaSessions.items.map((session, index) => (
                  <TableRow key={`${session.userUid}-${index}`}>
                    <TableCell>
                      {format(new Date(session.createdAt), "yyyy/MM/dd HH:mm")}
                    </TableCell>
                    <TableCell>{session.questionAnswers.length}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="ml-2"
                      >
                        <Link to={`/qa-sessions/${session.uid}`}>詳細</Link>
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
