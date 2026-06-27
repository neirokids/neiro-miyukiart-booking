"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Lesson } from "@/lib/types";

export default function CompleteContent({ lesson }: { lesson: Lesson }) {
  const params = useSearchParams();
  const isWaitlisted = params.get("waitlisted") === "1";
  const childName = params.get("childName") ?? "";

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0F5FC] text-2xl">
        {isWaitlisted ? "⏳" : "✅"}
      </div>

      <h1 className="mt-4 text-xl font-bold text-gray-900">
        {isWaitlisted ? "キャンセル待ちで受け付けました" : "ご予約を受け付けました"}
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        {childName && <>{childName} さんのご予約、ありがとうございます。</>}
        <br />
        {isWaitlisted
          ? "定員に達しているため、現在はキャンセル待ちとなっています。空きが出ましたら個別にご連絡いたします。"
          : "確認のご連絡は追ってメールにてお送りいたします。"}
      </p>

      <div className="mt-6 rounded-xl bg-[#F0F5FC] px-5 py-4 text-left text-sm">
        <p className="font-semibold text-gray-900">{lesson.title}</p>
        <p className="mt-2 text-gray-600">日時：{lesson.dateLabel}</p>
        <p className="text-gray-600">場所：{lesson.location}</p>
        {lesson.locationAddress && (
          <p className="text-gray-600">住所：{lesson.locationAddress}</p>
        )}
        {lesson.locationMapUrl && (
          <a
            href={lesson.locationMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-medium text-[#1560BD] hover:underline"
          >
            地図で見る →
          </a>
        )}
        <p className="mt-1 text-gray-600">料金：{lesson.price}</p>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block text-sm font-medium text-[#1560BD] hover:underline"
      >
        トップページに戻る
      </Link>
    </div>
  );
}
