export function validateDateRange(from: string, to: string): string {
  if (!from || !to) return "開始日と終了日を入力してください。";
  if (from > to) return "開始日は終了日以前の日付を選択してください。";
  return "";
}