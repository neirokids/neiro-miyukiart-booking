import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import CompleteContent from "@/components/CompleteContent";
import { getCurrentLesson } from "@/lib/data";

export default function CompletePage() {
  const lesson = getCurrentLesson();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <Suspense fallback={null}>
          <CompleteContent lesson={lesson} />
        </Suspense>
      </main>
    </>
  );
}
