// ─────────────────────────────────────────
// Googleカレンダー連携
// OAuth2のリフレッシュトークンを使い、googleapisライブラリなしで
// REST APIを直接呼び出すシンプルな実装。
// ─────────────────────────────────────────

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN ?? "";
// 予定を登録するカレンダー。未設定の場合は本人のメインカレンダー（"primary"）に登録される
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "primary";

type CalendarEventInput = {
  title: string;
  description: string;
  location: string;
  startIso: string; // 例: "2026-07-26T16:30:00+09:00"
  endIso: string;
};

// リフレッシュトークンを使って、短期間有効なアクセストークンを取得する
async function getAccessToken(): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    console.warn(
      "[Googleカレンダー] 環境変数が未設定のため連携をスキップしました（GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN）"
    );
    return null;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Googleカレンダー] アクセストークンの取得に失敗:", text);
    return null;
  }

  const data = await res.json();
  return data.access_token as string;
}

// カレンダーに予定を1件作成する
export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<{ success: boolean; eventId?: string }> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { success: false };
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    GOOGLE_CALENDAR_ID
  )}/events`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: input.title,
      description: input.description,
      location: input.location,
      start: { dateTime: input.startIso },
      end: { dateTime: input.endIso },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Googleカレンダー] 予定の作成に失敗:", text);
    return { success: false };
  }

  const data = await res.json();
  return { success: true, eventId: data.id };
}
