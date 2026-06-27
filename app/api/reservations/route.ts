import { NextRequest, NextResponse } from "next/server";
import {
  createReservation,
  getCurrentLesson,
  getRemainingSeats,
  readReservations,
} from "@/lib/data";
import type { ReservationInput } from "@/lib/types";

// 予約一覧取得（管理画面用）
export async function GET() {
  const reservations = await readReservations();
  return NextResponse.json({ reservations });
}

// 新規予約作成
export async function POST(req: NextRequest) {
  const body = await req.json();

  const lesson = getCurrentLesson();

  const requiredFields: (keyof ReservationInput)[] = [
    "parentName",
    "memberType",
    "childName",
    "childNameKana",
    "childAge",
    "email",
    "phone",
  ];

  for (const field of requiredFields) {
    if (!body[field] || String(body[field]).trim() === "") {
      return NextResponse.json(
        { error: `必須項目が入力されていません: ${field}` },
        { status: 400 }
      );
    }
  }

  if (body.hasSibling) {
    const siblingFields = ["siblingName", "siblingNameKana", "siblingAge"];
    for (const field of siblingFields) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json(
          { error: `兄弟姉妹の情報が入力されていません: ${field}` },
          { status: 400 }
        );
      }
    }
  }

  const input: ReservationInput = {
    lessonId: lesson.id,
    parentName: body.parentName,
    memberType: body.memberType,
    childName: body.childName,
    childNameKana: body.childNameKana,
    childAge: body.childAge,
    hasSibling: Boolean(body.hasSibling),
    siblingName: body.hasSibling ? body.siblingName : "",
    siblingNameKana: body.hasSibling ? body.siblingNameKana : "",
    siblingAge: body.hasSibling ? body.siblingAge : "",
    email: body.email,
    phone: body.phone,
    note: body.note ?? "",
  };

  const remainingBefore = await getRemainingSeats(lesson.id);
  const reservation = await createReservation(input);

  return NextResponse.json({
    reservation,
    wasWaitlisted: remainingBefore <= 0,
  });
}
