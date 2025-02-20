import type { Route } from "./+types/_authenticated.tenants_";
import { Link, useNavigate } from "react-router";
import { useGetTenants } from "~/api/nagaraCareAPI";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { format } from "date-fns";
import { PlusIcon } from "@radix-ui/react-icons";

export default function TenantsPage() {
  const { data: tenantsData, isLoading } = useGetTenants();
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      {/* ヘッダーセクション */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">テナント</h1>
          <p className="text-sm text-muted-foreground">
            テナントの一覧を管理・作成できます。
          </p>
        </div>
        <Button asChild>
          <Link to="new" className="gap-1">
            <PlusIcon className="h-4 w-4" />
            新規テナント
          </Link>
        </Button>
      </div>

      {/* メインコンテンツ */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[400px]">テナント名</TableHead>
              <TableHead className="text-right">作成日時</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? // ローディング状態
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-[350px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-5 w-[150px]" />
                    </TableCell>
                  </TableRow>
                ))
              : // データ表示
                tenantsData?.items.map((tenant) => (
                  <TableRow
                    key={tenant.uid}
                    className="group cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => navigate(tenant.uid)}
                  >
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {format(new Date(tenant.createdAt), "yyyy/MM/dd HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* 件数表示 */}
      <div className="text-sm text-muted-foreground">
        {tenantsData?.total ?? 0} 件のテナント
      </div>
    </div>
  );
}
