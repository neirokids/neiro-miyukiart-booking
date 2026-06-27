import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-[#1560BD]">
            NEIRO
          </span>
          <span className="text-sm text-gray-500">Language House</span>
        </Link>
        <span className="text-xs text-gray-400">アート×英語コラボレッスン</span>
      </div>
    </header>
  );
}
