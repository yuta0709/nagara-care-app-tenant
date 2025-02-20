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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

export default function NewAssessment() {
  return (
    <div className="space-y-6">
      {/* 基本情報カード */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
        </CardContent>
      </Card>

      {/* 本人情報カード */}
      <Card>
        <CardHeader>
          <CardTitle>本人情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
        </CardContent>
      </Card>

      {/* 主訴・希望カード */}
      <Card>
        <CardHeader>
          <CardTitle>主訴・希望</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>本人の希望</Label>
              <Textarea placeholder="杖を使って歩き、家の近くの友人に遊びに行きたい。" />
            </div>
            <div>
              <Label>家族の希望</Label>
              <Textarea placeholder="本人が疲れない程度にリハビリをしてもらい、自分でできることを増やしてもらいたい。" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ADLカード */}
      <Card>
        <CardHeader>
          <CardTitle>ADL（日常生活動作）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label>移乗</Label>
              <div className="flex items-center gap-4 mt-2">
                <RadioGroup className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="transfer-self" />
                    <Label htmlFor="transfer-self">自立</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="watch" id="transfer-watch" />
                    <Label htmlFor="transfer-watch">見守り</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="transfer-partial" />
                    <Label htmlFor="transfer-partial">一部介助</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="transfer-full" />
                    <Label htmlFor="transfer-full">全介助</Label>
                  </div>
                </RadioGroup>
              </div>
              <Textarea
                className="mt-2"
                placeholder="麻痺側の足に装具を装着し、健側の足で立ち上がり車椅子・ベッドなどの移乗可能。"
              />
            </div>
            <div>
              <Label>移動</Label>
              <div className="flex items-center gap-4 mt-2">
                <RadioGroup className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="movement-self" />
                    <Label htmlFor="movement-self">自立</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="watch" id="movement-watch" />
                    <Label htmlFor="movement-watch">見守り</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="movement-partial" />
                    <Label htmlFor="movement-partial">一部介助</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="movement-full" />
                    <Label htmlFor="movement-full">全介助</Label>
                  </div>
                </RadioGroup>
              </div>
              <Textarea
                className="mt-2"
                placeholder="短距離は杖などを使用し歩行可能。リハビリ時は付き添い歩いて50m歩行可能。歩行時にフラツキもあるため、普段は安全のために車椅子移動している。"
              />
            </div>
            <div>
              <Label>食事</Label>
              <div className="flex items-center gap-4 mt-2">
                <RadioGroup className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="meal-self" />
                    <Label htmlFor="meal-self">自立</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="watch" id="meal-watch" />
                    <Label htmlFor="meal-watch">見守り</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="meal-partial" />
                    <Label htmlFor="meal-partial">一部介助</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="meal-full" />
                    <Label htmlFor="meal-full">全介助</Label>
                  </div>
                </RadioGroup>
              </div>
              <Textarea
                className="mt-2"
                placeholder="健側の手で自力摂取可能。食べこぼしなく食べられる。（鶏アレルギーあり）"
              />
            </div>
            <div>
              <Label>排泄</Label>
              <div className="flex items-center gap-4 mt-2">
                <RadioGroup className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="toilet-self" />
                    <Label htmlFor="toilet-self">自立</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="watch" id="toilet-watch" />
                    <Label htmlFor="toilet-watch">見守り</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="toilet-partial" />
                    <Label htmlFor="toilet-partial">一部介助</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="toilet-full" />
                    <Label htmlFor="toilet-full">全介助</Label>
                  </div>
                </RadioGroup>
              </div>
              <Textarea
                className="mt-2"
                placeholder="車椅子でトイレまで移動し、自力でされているも、間に合わず失禁してしまうことがある。紙パンツ＋尿取りパット使用中。"
              />
            </div>
            <div>
              <Label>入浴</Label>
              <div className="flex items-center gap-4 mt-2">
                <RadioGroup className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="bath-self" />
                    <Label htmlFor="bath-self">自立</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="watch" id="bath-watch" />
                    <Label htmlFor="bath-watch">見守り</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="bath-partial" />
                    <Label htmlFor="bath-partial">一部介助</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="bath-full" />
                    <Label htmlFor="bath-full">全介助</Label>
                  </div>
                </RadioGroup>
              </div>
              <Textarea
                className="mt-2"
                placeholder="週2回デイケア利用時入浴。シャワーチェアーにてリフト浴。洗身、洗髪ともに手の届く範囲は自力で洗える。背中や臀部などは介助が必要。"
              />
            </div>
            <div>
              <Label>起き上がり</Label>
              <div className="flex items-center gap-4 mt-2">
                <RadioGroup className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="getup-self" />
                    <Label htmlFor="getup-self">自立</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="watch" id="getup-watch" />
                    <Label htmlFor="getup-watch">見守り</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="getup-partial" />
                    <Label htmlFor="getup-partial">一部介助</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="getup-full" />
                    <Label htmlFor="getup-full">全介助</Label>
                  </div>
                </RadioGroup>
              </div>
              <Textarea
                className="mt-2"
                placeholder="健側の手でベッド柵をもつことで可能。"
              />
            </div>
            <div>
              <Label>立ち上がり</Label>
              <div className="flex items-center gap-4 mt-2">
                <RadioGroup className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="standup-self" />
                    <Label htmlFor="standup-self">自立</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="watch" id="standup-watch" />
                    <Label htmlFor="standup-watch">見守り</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="standup-partial" />
                    <Label htmlFor="standup-partial">一部介助</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="standup-full" />
                    <Label htmlFor="standup-full">全介助</Label>
                  </div>
                </RadioGroup>
              </div>
              <Textarea
                className="mt-2"
                placeholder="介助バーを使用することで可能。"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 生活環境カード */}
      <Card>
        <CardHeader>
          <CardTitle>生活環境</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>居住環境</Label>
              <Textarea placeholder="長男夫婦と同居中。長男夫婦ともに自営業のため朝8時から夜19時まで就労されている。" />
            </div>
            <div>
              <Label>社会環境</Label>
              <Textarea placeholder="自宅から30mの距離に友人宅があり、70年ほど近所づきあいをしている。友人は現在就労していない。順調堂の後遺症のため左片麻痺になった本人を心配している様子。地域のボランティア等に見守りなどを依頼すると快く承諾してくださる。" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 健康・受診状況カード */}
      <Card>
        <CardHeader>
          <CardTitle>健康・受診状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>この1年、市の健康教室へ参加していますか</Label>
                <RadioGroup className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="health-yes" />
                    <Label htmlFor="health-yes">はい</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="health-no" />
                    <Label htmlFor="health-no">いいえ</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>
                  この1年、公民館・婦人会・老人クラブ活動等に参加していますか
                </Label>
                <RadioGroup className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="club-yes" />
                    <Label htmlFor="club-yes">はい</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="club-no" />
                    <Label htmlFor="club-no">いいえ</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>この1年、講座や各種教室に参加していますか</Label>
                <RadioGroup className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="lecture-yes" />
                    <Label htmlFor="lecture-yes">はい</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="lecture-no" />
                    <Label htmlFor="lecture-no">いいえ</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 移動手段カード */}
      <Card>
        <CardHeader>
          <CardTitle>移動手段</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>日用品を買う店まで</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">徒歩</SelectItem>
                  <SelectItem value="2">セニアカー</SelectItem>
                  <SelectItem value="3">自転車</SelectItem>
                  <SelectItem value="4">バイク・自転車</SelectItem>
                  <SelectItem value="5">バス・JR</SelectItem>
                  <SelectItem value="6">タクシー・知人の自動車</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>病院等に行くときは</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">徒歩</SelectItem>
                  <SelectItem value="2">セニアカー</SelectItem>
                  <SelectItem value="3">自転車</SelectItem>
                  <SelectItem value="4">バイク・自転車</SelectItem>
                  <SelectItem value="5">バス・JR</SelectItem>
                  <SelectItem value="6">タクシー・知人の自動車</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 生活スタイルカード */}
      <Card>
        <CardHeader>
          <CardTitle>生活スタイル</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>1日誰と過ごすことが多いか</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">家族</SelectItem>
                  <SelectItem value="2">友人・知人</SelectItem>
                  <SelectItem value="3">ほとんど一人</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>1週間に外出する頻度（通院以外）</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">3回以上</SelectItem>
                  <SelectItem value="2">1～2回</SelectItem>
                  <SelectItem value="3">あまり外出しない</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>1週間に親戚・友人が来る頻度</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">3回以上</SelectItem>
                  <SelectItem value="2">1～2回</SelectItem>
                  <SelectItem value="3">あまり来ない</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>歩行</Label>
              <RadioGroup className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="walk-yes" />
                  <Label htmlFor="walk-yes">はい</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="walk-no" />
                  <Label htmlFor="walk-no">いいえ</Label>
                </div>
              </RadioGroup>
              <div className="text-sm text-muted-foreground mt-1">
                物につかまって歩いたり、杖を使用したりしていますか
              </div>
            </div>
            <div>
              <Label>食事の準備</Label>
              <RadioGroup className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="meal-yes" />
                  <Label htmlFor="meal-yes">はい</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="meal-no" />
                  <Label htmlFor="meal-no">いいえ</Label>
                </div>
              </RadioGroup>
              <div className="text-sm text-muted-foreground mt-1">
                毎日、調理が自分で出来ていますか
              </div>
            </div>
            <div>
              <Label>買い物</Label>
              <RadioGroup className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="shopping-yes" />
                  <Label htmlFor="shopping-yes">はい</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="shopping-no" />
                  <Label htmlFor="shopping-no">いいえ</Label>
                </div>
              </RadioGroup>
              <div className="text-sm text-muted-foreground mt-1">
                生活に必要なものを自分で買い行けますか
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 精神面カード */}
      <Card>
        <CardHeader>
          <CardTitle>精神面</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>身の回りの乱れや汚れを気にしなくなりましたか</Label>
              <RadioGroup className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="hygiene-yes" />
                  <Label htmlFor="hygiene-yes">はい</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="hygiene-no" />
                  <Label htmlFor="hygiene-no">いいえ</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>外出や食事の準備が難しくなりましたか</Label>
              <RadioGroup className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="activity-yes" />
                  <Label htmlFor="activity-yes">はい</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="activity-no" />
                  <Label htmlFor="activity-no">いいえ</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>
                金銭管理（日々の支払い行為等含む）が難しくなってきましたか
              </Label>
              <RadioGroup className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="money-yes" />
                  <Label htmlFor="money-yes">はい</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="money-no" />
                  <Label htmlFor="money-no">いいえ</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>情緒が不安定になることが増えてきましたか</Label>
              <RadioGroup className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="emotion-yes" />
                  <Label htmlFor="emotion-yes">はい</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="emotion-no" />
                  <Label htmlFor="emotion-no">いいえ</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>一人暮り（になりそている）ことが不安ですか</Label>
              <RadioGroup className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="lonely-yes" />
                  <Label htmlFor="lonely-yes">はい</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="lonely-no" />
                  <Label htmlFor="lonely-no">いいえ</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
