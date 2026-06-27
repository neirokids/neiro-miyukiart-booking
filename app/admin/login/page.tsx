"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "ログインに失敗しました。");
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-sm flex-1 px-5 py-16">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">管理画面ログイン</h1>
          <p className="mt-1 text-sm text-gray-500">
            パスワードを入力してください。
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none transition focus:border-[#1560BD] focus:ring-2 focus:ring-[#1560BD]/20"
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#1560BD] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#104A99] disabled:opacity-50"
            >
              {submitting ? "確認中..." : "ログイン"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
