import { NextRequest, NextResponse } from "next/server";
import { updateReservationStatus } from "@/lib/data";
import type { ReservationStatus } from "@/lib/types";

const VALID_STATUSES: ReservationStatus[] = [
  "pending",
  "approved",
  "waitlist",
  "cancelled",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const status = body.status as ReservationStatus;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "不正なステータスです" }, { status: 400 });
  }

  const updated = await updateReservationStatus(id, status);

  if (!updated) {
    return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ reservation: updated });
}
