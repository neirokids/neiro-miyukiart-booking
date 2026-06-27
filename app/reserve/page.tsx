import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import ReservationForm from "@/components/ReservationForm";
import { getCurrentLesson, getRemainingSeats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReservePage() {
  const lesson = getCurrentLesson();
  const remainingSeats = await getRemainingSeats(lesson.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <Link href="/" className="text-sm text-[#1560BD] hover:underline">
          ← レッスン詳細に戻る
        </Link>

        <div className="mt-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-gray-900">予約フォーム</h1>
          <p className="mt-1 text-sm text-gray-500">
            {lesson.dateLabel} ／ {lesson.location}
          </p>

          <div className="mt-6">
            <ReservationForm remainingSeats={remainingSeats} />
          </div>
        </div>
      </main>
    </>
  );
}
