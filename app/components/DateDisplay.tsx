import { format } from "date-fns";
import { ja } from "date-fns/locale";

type DateDisplayProps = {
  date: string;
  className?: string;
};

export function DateDisplay({ date, className = "" }: DateDisplayProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span>
        {format(new Date(date), "yyyy年MM月dd日", {
          locale: ja,
        })}
      </span>
      <span className="text-xs text-muted-foreground">
        {format(new Date(date), "(E)", {
          locale: ja,
        })}
      </span>
    </div>
  );
}
