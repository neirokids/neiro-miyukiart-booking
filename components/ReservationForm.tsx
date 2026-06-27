"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReservationForm({
  remainingSeats,
}: {
  remainingSeats: number;
}) {
  const router = useRouter();
  const isFull = remainingSeats <= 0;

  const [form, setForm] = useState({
    parentName: "",
    memberType: "" as "" | "neiro" | "miyuki" | "new",
    childName: "",
    childNameKana: "",
    childAge: "",
    hasSibling: false,
    siblingName: "",
    siblingNameKana: "",
    siblingAge: "",
    email: "",
    phone: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "予約の送信に失敗しました。");
        setSubmitting(false);
        return;
      }

      const params = new URLSearchParams({
        waitlisted: data.wasWaitlisted ? "1" : "0",
        childName: form.childName,
      });
      router.push(`/complete?${params.toString()}`);
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isFull && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          現在満席のため、この申し込みは「キャンセル待ち」として受け付けられます。
        </div>
      )}

      <Field label="保護者氏名" required>
        <input
          required
          type="text"
          value={form.parentName}
          onChange={(e) => update("parentName", e.target.value)}
          className={inputClass}
          placeholder="山田 花子"
        />
      </Field>

      <Field label="ご登録区分" required>
        <select
          required
          value={form.memberType}
          onChange={(e) =>
            update("memberType", e.target.value as typeof form.memberType)
          }
          className={inputClass}
        >
          <option value="" disabled>
            選択してください
          </option>
          <option value="neiro">NEIRO Language House 会員</option>
          <option value="miyuki">みゆきアートラボ 会員</option>
          <option value="new">新規の方</option>
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="お子様の氏名" required>
          <input
            required
            type="text"
            value={form.childName}
            onChange={(e) => update("childName", e.target.value)}
            className={inputClass}
            placeholder="山田 太郎"
          />
        </Field>
        <Field label="お子様の氏名（ふりがな）" required>
          <input
            required
            type="text"
            value={form.childNameKana}
            onChange={(e) => update("childNameKana", e.target.value)}
            className={inputClass}
            placeholder="やまだ たろう"
          />
        </Field>
      </div>

      <Field label="お子様の年齢・学年" required>
        <input
          required
          type="text"
          value={form.childAge}
          onChange={(e) => update("childAge", e.target.value)}
          className={inputClass}
          placeholder="例：6歳・年長"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={form.hasSibling}
          onChange={(e) => update("hasSibling", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#1560BD] focus:ring-[#1560BD]/30"
        />
        兄弟姉妹も同時に参加する
      </label>

      {form.hasSibling && (
        <div className="space-y-4 rounded-xl bg-[#F7F8FA] p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ご兄弟の氏名" required>
              <input
                required
                type="text"
                value={form.siblingName}
                onChange={(e) => update("siblingName", e.target.value)}
                className={inputClass}
                placeholder="山田 次郎"
              />
            </Field>
            <Field label="ご兄弟の氏名（ふりがな）" required>
              <input
                required
                type="text"
                value={form.siblingNameKana}
                onChange={(e) => update("siblingNameKana", e.target.value)}
                className={inputClass}
                placeholder="やまだ じろう"
              />
            </Field>
          </div>
          <Field label="ご兄弟の年齢・学年" required>
            <input
              required
              type="text"
              value={form.siblingAge}
              onChange={(e) => update("siblingAge", e.target.value)}
              className={inputClass}
              placeholder="例：4歳・年中"
            />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="メールアドレス" required>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            placeholder="example@email.com"
          />
        </Field>
        <Field label="電話番号" required>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="090-0000-0000"
          />
        </Field>
      </div>

      <Field label="その他伝達事項">
        <textarea
          value={form.note}
          onChange={(e) => update("note", e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="アレルギーや配慮事項など、お気軽にご記入ください"
        />
      </Field>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#1560BD] px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#104A99] disabled:opacity-50"
      >
        {submitting
          ? "送信中..."
          : isFull
            ? "キャンセル待ちで申し込む"
            : "予約を確定する"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 outline-none transition focus:border-[#1560BD] focus:ring-2 focus:ring-[#1560BD]/20";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-[#1560BD]">*</span>}
      </span>
      {children}
    </label>
  );
}
