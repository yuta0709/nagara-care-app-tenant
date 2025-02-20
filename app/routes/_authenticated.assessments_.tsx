import type { Route } from "./+types/_authenticated.assessments_";
import { Link } from "react-router";
import {
  getAssessment,
  getAssessments,
  getMe,
  getSubjects,
  type AssessmentDto,
} from "~/api/nagaraCareAPI";
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

export async function clientLoader() {
  const me = await getMe();
  const assessments = await getAssessments();
  return {
    assessments,
  };
}

export default function Assessments({ loaderData }: Route.ComponentProps) {
  const { assessments } = loaderData;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>アセスメント一覧</CardTitle>
            <Button asChild>
              <Link to="/assessments/new">新規作成</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assessments.items.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              アセスメントがありません
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>対象者</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.items.map((assessment: AssessmentDto) => (
                  <TableRow key={assessment.uid}>
                    <TableCell>
                      {assessment.subject.familyName}{" "}
                      {assessment.subject.givenName}
                    </TableCell>
                    <TableCell>
                      {new Date(assessment.createdAt).toLocaleDateString(
                        "ja-JP"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/assessments/${assessment.uid}`}>詳細</Link>
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
