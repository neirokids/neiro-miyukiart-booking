import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import LessonInfo from "@/components/LessonInfo";
import { getCurrentLesson, getRemainingSeats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const lesson = getCurrentLesson();
  const remainingSeats = await getRemainingSeats(lesson.id);
  const isFull = remainingSeats <= 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <LessonInfo lesson={lesson} remainingSeats={remainingSeats} />

        <div className="mt-8 text-center">
          <Link
            href="/reserve"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#1560BD] px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#104A99] sm:w-auto sm:px-10"
          >
            {isFull ? "キャンセル待ちで申し込む" : "このレッスンを予約する"}
          </Link>
        </div>
      </main>
      <footer className="border-t border-black/5 bg-white py-6 text-center text-xs text-gray-400">
        NEIRO Language House
      </footer>
    </>
  );
}
