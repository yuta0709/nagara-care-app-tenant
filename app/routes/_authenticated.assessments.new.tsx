import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";

export default function NewAssessment() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>アセスメントシート作成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>相談日</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>来所方法</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visit">来所</SelectItem>
                      <SelectItem value="phone">電話</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>把握経路</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">介護予防検診</SelectItem>
                      <SelectItem value="2">本人からの相談</SelectItem>
                      <SelectItem value="3">家族からの相談</SelectItem>
                      <SelectItem value="4">非該当</SelectItem>
                      <SelectItem value="5">新予防からの移行</SelectItem>
                      <SelectItem value="6">関係者</SelectItem>
                      <SelectItem value="7">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>本人の状況</Label>
                  <Input placeholder="在宅・入院又は入所中" />
                </div>
              </div>
            </div>

            <Separator />

            {/* 本人情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">本人情報</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>フリガナ</Label>
                  <Input />
                </div>
                <div>
                  <Label>氏名</Label>
                  <Input />
                </div>
                <div>
                  <Label>性別</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男性</SelectItem>
                      <SelectItem value="female">女性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>住所</Label>
                  <Input />
                </div>
                <div>
                  <Label>電話番号</Label>
                  <Input type="tel" />
                </div>
              </div>
            </div>

            <Separator />

            {/* 日常生活自立度 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">日常生活自立度</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>障害高齢者の日常生活自立度</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="j1">J1</SelectItem>
                      <SelectItem value="j2">J2</SelectItem>
                      <SelectItem value="a1">A1</SelectItem>
                      <SelectItem value="a2">A2</SelectItem>
                      <SelectItem value="b1">B1</SelectItem>
                      <SelectItem value="b2">B2</SelectItem>
                      <SelectItem value="c1">C1</SelectItem>
                      <SelectItem value="c2">C2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>認知症高齢者の日常生活自立度</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ⅰ</SelectItem>
                      <SelectItem value="2a">Ⅱa</SelectItem>
                      <SelectItem value="2b">Ⅱb</SelectItem>
                      <SelectItem value="3a">Ⅲa</SelectItem>
                      <SelectItem value="3b">Ⅲb</SelectItem>
                      <SelectItem value="4">Ⅳ</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* 住居環境 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">住居環境</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>住居形態</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">持家</SelectItem>
                      <SelectItem value="apartment">集合住宅</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>階数</Label>
                  <Input placeholder="1階・無" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>浴室</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">有</SelectItem>
                      <SelectItem value="no">無</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>便所</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="western">洋式</SelectItem>
                      <SelectItem value="japanese">和式</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>照明の状況</Label>
                <Input placeholder="市販の足元灯あり" />
              </div>

              <div>
                <Label>履物の状況</Label>
                <Input placeholder="履物側の足に装具を装着" />
              </div>
            </div>

            <Separator />

            {/* 経済状況 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">経済状況</h3>
              <div>
                <Label>収入</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pension">国民年金</SelectItem>
                    <SelectItem value="welfare">厚生年金</SelectItem>
                    <SelectItem value="disability">障害年金</SelectItem>
                    <SelectItem value="insurance">生活保護</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* 緊急連絡先 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">緊急連絡先</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>氏名</Label>
                  <Input />
                </div>
                <div>
                  <Label>続柄</Label>
                  <Input />
                </div>
                <div>
                  <Label>連絡先</Label>
                  <Input type="tel" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
