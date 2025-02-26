import { Link, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { getResident } from "~/api/nagaraCareAPI";
import type { Route } from "./+types/_authenticated.residents.$uid_";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Utensils } from "lucide-react";

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { uid } = params;
  if (!uid) throw new Error("利用者IDが指定されていません");

  const resident = await getResident(uid, uid);
  return {
    resident,
  };
}

export default function ResidentDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { resident } = loaderData;
  const params = useParams();

  // 年齢を計算する関数
  const calculateAge = (dateOfBirth: string) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {resident.familyName} {resident.givenName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {resident.familyNameFurigana} {resident.givenNameFurigana}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium">年齢</dt>
                <dd>{calculateAge(resident.dateOfBirth)}歳</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">性別</dt>
                <dd>{resident.gender === "MALE" ? "男性" : "女性"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">生年月日</dt>
                <dd>
                  {format(new Date(resident.dateOfBirth), "yyyy年MM月dd日", {
                    locale: ja,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">入所日</dt>
                <dd>
                  {format(new Date(resident.admissionDate), "yyyy年MM月dd日", {
                    locale: ja,
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>記録</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild variant="outline" className="w-full">
                <Link to={`/residents/${params.uid}/food-records`}>
                  <Utensils className="mr-2 h-4 w-4" />
                  食事記録
                </Link>
              </Button>
              {/* 他の記録へのリンクをここに追加 */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
