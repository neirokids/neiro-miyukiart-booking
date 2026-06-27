import SiteHeader from "@/components/SiteHeader";
import AdminTable from "@/components/AdminTable";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { getCurrentLesson, getRemainingSeats, readReservations } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const lesson = getCurrentLesson();
  const [remainingSeats, reservations] = await Promise.all([
    getRemainingSeats(lesson.id),
    readReservations(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">予約管理</h1>
            <p className="mt-1 text-sm text-gray-500">
              {lesson.title} ／ {lesson.dateLabel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white px-4 py-2 text-sm shadow-sm">
              残り席数：
              <span className="ml-1 font-semibold text-[#1560BD]">
                {remainingSeats} / {lesson.capacity}
              </span>
            </div>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="mt-6">
          <AdminTable initialReservations={reservations} />
        </div>
      </main>
    </>
  );
}
