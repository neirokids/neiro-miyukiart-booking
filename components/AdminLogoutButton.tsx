"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin-login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm transition hover:text-red-600"
    >
      ログアウト
    </button>
  );
}
