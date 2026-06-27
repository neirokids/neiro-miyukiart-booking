// レッスン（ワークショップ）情報
export type Lesson = {
  id: string;
  title: string;
  dateLabel: string; // 表示用日時 例: "2026年7月26日（日）16:30〜"
  date: string; // ISO日時 例: "2026-07-26T16:30:00+09:00"
  durationMinutes: number;
  location: string;
  locationAddress?: string;
  locationMapUrl?: string;
  price: string; // 未定の場合は "未定" 等の文字列も許容
  capacity: number;
  description: string;
  highlights: string[]; // レッスンの魅力（箇条書き）
};

export type ReservationStatus = "pending" | "approved" | "waitlist" | "cancelled";

export type MemberType = "neiro" | "miyuki" | "new";

export type Reservation = {
  id: string;
  lessonId: string;
  parentName: string; // 保護者氏名
  memberType: MemberType; // NEIRO会員 / みゆきアートラボ会員 / 新規
  childName: string; // お子様氏名
  childNameKana: string; // お子様氏名（ふりがな）
  childAge: string; // 年齢・学年
  hasSibling: boolean; // 兄弟同時参加の有無
  siblingName?: string; // 兄弟氏名
  siblingNameKana?: string; // 兄弟氏名（ふりがな）
  siblingAge?: string; // 兄弟の年齢・学年
  email: string;
  phone: string;
  note?: string; // その他伝達事項
  status: ReservationStatus;
  calendarSynced: boolean; // Googleカレンダー同期済みか（スタブ）
  lineNotified: boolean; // LINE通知済みか（スタブ）
  createdAt: string; // ISO日時
};

export type ReservationInput = Omit<
  Reservation,
  "id" | "status" | "calendarSynced" | "lineNotified" | "createdAt"
>;
