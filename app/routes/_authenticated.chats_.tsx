import { Link, useNavigate } from "react-router";
import { useGetThreads, useCreateThread } from "~/api/nagaraCareAPI";
import type { ThreadListOutputDto } from "~/api/nagaraCareAPI";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Loader2, Plus } from "lucide-react";

export default function ChatsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetThreads();
  const createThreadMutation = useCreateThread({
    mutation: {
      onSuccess: (data) => {
        // 新しいスレッドが作成されたら、そのスレッドの詳細ページに遷移
        navigate(`/chats/${data.uid}`);
      },
    },
  });

  const handleCreateThread = async () => {
    createThreadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        エラーが発生しました。再度お試しください。
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">チャット</CardTitle>
          <Button
            onClick={handleCreateThread}
            disabled={createThreadMutation.isPending}
          >
            {createThreadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                作成中...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                新規チャット
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          チャットを選択するか、新規チャットを作成してください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!data?.items || data.items.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            チャットがありません。「新規チャット」ボタンをクリックして新しいチャットを開始してください。
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((thread) => (
              <Link
                key={thread.uid}
                to={`/chats/${thread.uid}`}
                className="block"
              >
                <Card className="h-full hover:bg-gray-50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      チャット {thread.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      クリックして会話を続ける
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
