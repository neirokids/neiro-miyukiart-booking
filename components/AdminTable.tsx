"use client";

import { useState } from "react";
import type { MemberType, Reservation, ReservationStatus } from "@/lib/types";

const MEMBER_TYPE_LABEL: Record<MemberType, string> = {
  neiro: "NEIRO会員",
  miyuki: "みゆき会員",
  new: "新規",
};

const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "未承認",
  approved: "承認済み",
  waitlist: "キャンセル待ち",
  cancelled: "キャンセル",
};

const STATUS_STYLE: Record<ReservationStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  approved: "bg-green-100 text-green-700",
  waitlist: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function AdminTable({
  initialReservations,
}: {
  initialReservations: Reservation[];
}) {
  const [reservations, setReservations] = useState(initialReservations);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function changeStatus(id: string, status: ReservationStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? data.reservation : r))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (reservations.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
        まだ予約がありません。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-black/5 bg-white shadow-sm">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <Th>申込日時</Th>
            <Th>保護者氏名</Th>
            <Th>区分</Th>
            <Th>お子様氏名（ふりがな）</Th>
            <Th>年齢・学年</Th>
            <Th>兄弟姉妹</Th>
            <Th>連絡先</Th>
            <Th>伝達事項</Th>
            <Th>カレンダー</Th>
            <Th>LINE</Th>
            <Th>ステータス</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reservations.map((r) => (
            <tr key={r.id} className="align-top">
              <Td>{new Date(r.createdAt).toLocaleString("ja-JP")}</Td>
              <Td>{r.parentName}</Td>
              <Td>{MEMBER_TYPE_LABEL[r.memberType]}</Td>
              <Td>
                {r.childName}
                <div className="text-xs text-gray-400">{r.childNameKana}</div>
              </Td>
              <Td>{r.childAge}</Td>
              <Td>
                {r.hasSibling ? (
                  <>
                    {r.siblingName}
                    <div className="text-xs text-gray-400">
                      {r.siblingNameKana}（{r.siblingAge}）
                    </div>
                  </>
                ) : (
                  "—"
                )}
              </Td>
              <Td>
                <div>{r.email}</div>
                <div className="text-xs text-gray-400">{r.phone}</div>
              </Td>
              <Td className="max-w-[160px] truncate" title={r.note}>
                {r.note || "—"}
              </Td>
              <Td>{r.calendarSynced ? "✅ 同期済" : "—"}</Td>
              <Td>{r.lineNotified ? "✅ 送信済" : "—"}</Td>
              <Td>
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.status]}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1.5">
                  <ActionButton
                    disabled={updatingId === r.id || r.status === "approved"}
                    onClick={() => changeStatus(r.id, "approved")}
                    color="green"
                  >
                    承認
                  </ActionButton>
                  <ActionButton
                    disabled={updatingId === r.id || r.status === "cancelled"}
                    onClick={() => changeStatus(r.id, "cancelled")}
                    color="red"
                  >
                    キャンセル
                  </ActionButton>
                  <ActionButton
                    disabled={updatingId === r.id || r.status === "waitlist"}
                    onClick={() => changeStatus(r.id, "waitlist")}
                    color="amber"
                  >
                    待機に戻す
                  </ActionButton>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={`px-4 py-3 text-gray-700 ${className}`} title={title}>
      {children}
    </td>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color: "green" | "red" | "amber";
}) {
  const colorClass = {
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  }[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${colorClass}`}
    >
      {children}
    </button>
  );
}
