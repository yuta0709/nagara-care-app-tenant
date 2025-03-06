import { useParams, useNavigate } from "react-router";
import {
  useGetThread,
  useCreateMessage,
  useUpdateThread,
  useDeleteThread,
} from "~/api/nagaraCareAPI";
import type {
  ThreadOutputDto,
  MessageCreateInputDto,
  ThreadUpdateInputDto,
  MessageOutputDto,
} from "~/api/nagaraCareAPI";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Pencil, Trash2, Send, Loader2 } from "lucide-react";

export type Route = {
  ComponentProps: {
    loaderData: any;
  };
  LoaderArgs: {
    params: {
      uid: string;
    };
  };
};

export default function ChatDetailPage() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: threadData,
    isLoading,
    error,
    refetch,
  } = useGetThread(uid || "");

  const createMessageMutation = useCreateMessage({
    mutation: {
      onSuccess: () => {
        setMessage("");
        refetch();
      },
    },
  });

  const updateThreadMutation = useUpdateThread({
    mutation: {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        refetch();
      },
    },
  });

  const deleteThreadMutation = useDeleteThread({
    mutation: {
      onSuccess: () => {
        navigate("/chats");
      },
    },
  });

  // チャットを一番下までスクロールする関数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // threadDataが変更されたとき（新しいメッセージが追加されたとき）に自動スクロール
  useEffect(() => {
    if (threadData?.messages?.length) {
      scrollToBottom();
    }
  }, [threadData?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !uid) return;

    const messageData: MessageCreateInputDto = {
      content: message.trim(),
    };

    createMessageMutation.mutate({
      uid,
      data: messageData,
    });
  };

  const handleEditTitle = () => {
    if (!newTitle.trim() || !uid) return;

    const titleData: ThreadUpdateInputDto = {
      title: newTitle.trim(),
    };

    updateThreadMutation.mutate({
      uid,
      data: titleData,
    });
  };

  const handleDeleteThread = () => {
    if (!uid) return;

    deleteThreadMutation.mutate({
      uid,
    });
  };

  const openEditDialog = () => {
    if (threadData) {
      setNewTitle(threadData.title || "");
    }
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        エラーが発生しました。再度お試しください。
      </div>
    );
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">
              チャット {threadData?.title || uid?.substring(0, 8)}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={openEditDialog}
              title="タイトルを編集"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              title="チャットを削除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/chats")}>
              一覧に戻る
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[calc(100vh-16rem)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!threadData?.messages || threadData.messages.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              メッセージがありません。下のフォームからメッセージを送信してください。
            </div>
          ) : (
            threadData.messages.map((msg: MessageOutputDto, index: number) => {
              const isUser = msg.role === "USER";
              return (
                <div
                  key={msg.uid || index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] ${isUser ? "ml-auto" : "mr-auto"}`}
                  >
                    <Card
                      className={`
                      ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }
                    `}
                    >
                      <CardContent className="p-3">
                        <div className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })
          )}
          {/* スクロール位置を指定するための空のdiv */}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1"
              disabled={createMessageMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!message.trim() || createMessageMutation.isPending}
            >
              {createMessageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  送信
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>

      {/* タイトル編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>チャットタイトルの編集</DialogTitle>
            <DialogDescription>
              新しいチャットタイトルを入力してください。
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="新しいタイトル"
            className="mt-4"
          />
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleEditTitle}
              disabled={!newTitle.trim() || updateThreadMutation.isPending}
            >
              {updateThreadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>チャットの削除</DialogTitle>
            <DialogDescription>
              このチャットを削除してもよろしいですか？この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteThread}
              disabled={deleteThreadMutation.isPending}
            >
              {deleteThreadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  削除中...
                </>
              ) : (
                "削除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
