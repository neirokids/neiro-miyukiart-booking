import type { Lesson } from "@/lib/types";

export default function LessonInfo({
  lesson,
  remainingSeats,
}: {
  lesson: Lesson;
  remainingSeats: number;
}) {
  const isFull = remainingSeats <= 0;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-medium text-[#1560BD]">次回のレッスン</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
        {lesson.title}
      </h1>

      <dl className="mt-6 space-y-3 text-sm sm:text-base">
        <Row label="日時" value={lesson.dateLabel} />
        <Row
          label="場所"
          value={lesson.location}
          sub={lesson.locationAddress}
          mapUrl={lesson.locationMapUrl}
        />
        <Row label="料金" value={lesson.price} />
        <Row label="定員" value={`${lesson.capacity}名`} />
      </dl>

      <div className="mt-6 rounded-xl bg-[#F0F5FC] px-4 py-3">
        {isFull ? (
          <p className="font-medium text-amber-600">
            現在満席です。お申し込みはキャンセル待ちとして承ります。
          </p>
        ) : (
          <p className="font-medium text-[#1560BD]">
            残り {remainingSeats} 席（定員 {lesson.capacity} 名）
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-900">
          このレッスンの魅力
        </h2>
        <p className="mt-2 leading-relaxed text-gray-600">{lesson.description}</p>
        <ul className="mt-4 space-y-2">
          {lesson.highlights.map((h, i) => (
            <li key={i} className="flex gap-2 text-gray-700">
              <span className="text-[#1560BD]">●</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  sub,
  mapUrl,
}: {
  label: string;
  value: string;
  sub?: string;
  mapUrl?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <dt className="w-16 shrink-0 text-gray-400">{label}</dt>
      <dd className="text-gray-800">
        {value}
        {sub && <span className="ml-1 block text-xs text-gray-400">{sub}</span>}
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-xs font-medium text-[#1560BD] hover:underline"
          >
            地図で見る →
          </a>
        )}
      </dd>
    </div>
  );
}
