import { supabase } from "./supabase";
import { createCalendarEvent } from "./googleCalendar";
import type { Lesson, Reservation, ReservationInput, ReservationStatus } from "./types";

// ─────────────────────────────────────────
// レッスン情報（今後複数開催に対応しやすいよう配列で保持）
// ─────────────────────────────────────────
export const LESSONS: Lesson[] = [
  {
    id: "lesson-2026-07-26",
    title: "アート×英語コラボレッスン",
    dateLabel: "2026年7月26日（日）16:30〜",
    date: "2026-07-26T16:30:00+09:00",
    durationMinutes: 60,
    location: "みゆきアートラボ",
    locationAddress: "〒862-0903 熊本県熊本市東区若葉１丁目１４−１２ ＴＫビル２階",
    locationMapUrl: "https://maps.app.goo.gl/pvQwyJRdKjuu2D6j6",
    price: "5,500円",
    capacity: 20,
    description:
      "まるで外国のアートスクールに来たような、異国空間で自己表現を思いきり楽しみながら、英語のシャワーをあびるスペシャルな時間。アートと英語を組み合わせた、子どもたちの「感じる・つくる・伝える」を育むコラボレッスンです。アート作品をつくりながら、自然に英語のフレーズや表現に親しんでいきます。",
    highlights: [
      "まるで海外のアートスクールに来たような、異国空間での非日常体験",
      "アートでの自由な表現と、英語でのコミュニケーションを同時に楽しめる",
      "「正解」を決めない、子どものペースを大切にしたレッスン",
      "経験豊富な講師による、年齢に合わせたサポート",
    ],
  },
];

export function getCurrentLesson(): Lesson {
  // 今後複数開催になった場合はここで「次回」を判定するロジックに変更
  return LESSONS[0];
}

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

// ─────────────────────────────────────────
// 予約データ（Supabase データベースに永続化）
// ─────────────────────────────────────────

// データベースの行（スネークケース）を、アプリ内で使う型（キャメルケース）に変換
function rowToReservation(row: Record<string, unknown>): Reservation {
  return {
    id: row.id as string,
    lessonId: row.lesson_id as string,
    parentName: row.parent_name as string,
    memberType: row.member_type as Reservation["memberType"],
    childName: row.child_name as string,
    childNameKana: row.child_name_kana as string,
    childAge: row.child_age as string,
    hasSibling: row.has_sibling as boolean,
    siblingName: (row.sibling_name as string) ?? "",
    siblingNameKana: (row.sibling_name_kana as string) ?? "",
    siblingAge: (row.sibling_age as string) ?? "",
    email: row.email as string,
    phone: row.phone as string,
    note: (row.note as string) ?? "",
    status: row.status as ReservationStatus,
    calendarSynced: row.calendar_synced as boolean,
    lineNotified: row.line_notified as boolean,
    createdAt: row.created_at as string,
  };
}

export async function readReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("予約一覧の取得に失敗しました:", error.message);
    return [];
  }

  return (data ?? []).map(rowToReservation);
}

// レッスンごとの「承認済み・未承認」件数（定員カウント対象）
export async function getApprovedCount(lessonId: string): Promise<number> {
  const { count, error } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .eq("lesson_id", lessonId)
    .in("status", ["approved", "pending"]);

  if (error) {
    console.error("予約件数の取得に失敗しました:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getRemainingSeats(lessonId: string): Promise<number> {
  const lesson = getLessonById(lessonId);
  if (!lesson) return 0;
  const used = await getApprovedCount(lessonId);
  return Math.max(lesson.capacity - used, 0);
}

export async function createReservation(
  input: ReservationInput
): Promise<Reservation> {
  const remaining = await getRemainingSeats(input.lessonId);
  const status: ReservationStatus = remaining > 0 ? "pending" : "waitlist";

  const id = `res-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      id,
      lesson_id: input.lessonId,
      parent_name: input.parentName,
      member_type: input.memberType,
      child_name: input.childName,
      child_name_kana: input.childNameKana,
      child_age: input.childAge,
      has_sibling: input.hasSibling,
      sibling_name: input.siblingName || null,
      sibling_name_kana: input.siblingNameKana || null,
      sibling_age: input.siblingAge || null,
      email: input.email,
      phone: input.phone,
      note: input.note || null,
      status,
      calendar_synced: false,
      line_notified: false,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`予約の作成に失敗しました: ${error?.message}`);
  }

  const newReservation = rowToReservation(data);

  // 予約受付時の連携処理：待機（キャンセル待ち）以外は即時カレンダー登録する
  // Vercel等のサーバーレス環境では、応答を返した後にバックグラウンド処理が
  // 途中で打ち切られてしまうことがあるため、ここで完了を待つ。
  if (newReservation.status !== "waitlist") {
    const synced = await syncToGoogleCalendar(newReservation);
    if (synced) {
      newReservation.calendarSynced = true;
      await supabase
        .from("reservations")
        .update({ calendar_synced: true })
        .eq("id", newReservation.id);
    }
  }
  void notifyLine(newReservation);

  return newReservation;
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<Reservation | undefined> {
  const { data: existing, error: fetchError } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    console.error("予約の取得に失敗しました:", fetchError?.message);
    return undefined;
  }

  const { data, error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("予約の更新に失敗しました:", error?.message);
    return undefined;
  }

  let updated = rowToReservation(data);

  // 承認に変わった場合、まだカレンダー未登録ならここで登録する
  if (status === "approved" && !updated.calendarSynced) {
    const synced = await syncToGoogleCalendar(updated);
    if (synced) {
      const { data: refreshed } = await supabase
        .from("reservations")
        .update({ calendar_synced: true })
        .eq("id", id)
        .select()
        .single();
      if (refreshed) {
        updated = rowToReservation(refreshed);
      }
    }
  }

  return updated;
}

// ─────────────────────────────────────────
// Googleカレンダー連携
// 予約が承認されたタイミングで、レッスンの予定をカレンダーに登録する。
// 環境変数（GOOGLE_CLIENT_ID等）が未設定の場合は自動的にスキップされる。
// ─────────────────────────────────────────
async function syncToGoogleCalendar(reservation: Reservation): Promise<boolean> {
  const lesson = getLessonById(reservation.lessonId);
  if (!lesson) return false;

  const startDate = new Date(lesson.date);
  const endDate = new Date(startDate.getTime() + lesson.durationMinutes * 60 * 1000);

  const result = await createCalendarEvent({
    title: `【予約確定】${lesson.title}（${reservation.childName}様）`,
    description: [
      `保護者氏名: ${reservation.parentName}`,
      `お子様氏名: ${reservation.childName}（${reservation.childNameKana}）`,
      `年齢・学年: ${reservation.childAge}`,
      reservation.hasSibling
        ? `ご兄弟: ${reservation.siblingName}（${reservation.siblingNameKana}・${reservation.siblingAge}）`
        : null,
      `連絡先: ${reservation.email} / ${reservation.phone}`,
      reservation.note ? `伝達事項: ${reservation.note}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    location: lesson.location,
    startIso: startDate.toISOString(),
    endIso: endDate.toISOString(),
  });

  if (result.success) {
    console.log(
      `[Googleカレンダー] 登録成功: 予約ID=${reservation.id} イベントID=${result.eventId}`
    );
  } else {
    console.error(`[Googleカレンダー] 登録失敗: 予約ID=${reservation.id}`);
  }

  return result.success;
}

// ─────────────────────────────────────────
// 公式LINE連携（スタブ実装）
// 本番接続時は LINE Messaging API の push message を実装する
// ─────────────────────────────────────────
async function notifyLine(reservation: Reservation): Promise<void> {
  // TODO: 本番実装
  // 1. 環境変数 LINE_CHANNEL_ACCESS_TOKEN を用意
  // 2. https://api.line.me/v2/bot/message/push にPOSTして
  //    管理者向け通知 or 保護者向け自動応答（LINEログイン連携時）を送信
  console.log(
    `[stub] LINE通知（未実装）: 予約ID=${reservation.id} ステータス=${reservation.status}`
  );
}
