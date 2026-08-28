"use client";

import dynamic from "next/dynamic";
import { DeferredSection } from "@/components/ui/DeferredSection";

const Experience = dynamic(
  () => import("@/sections/Experience").then((m) => m.Experience),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[480px] border-y border-line/60 bg-surface/20" aria-hidden />
    ),
  },
);

export function HomeExperience() {
  return (
    <DeferredSection minHeight="min-h-[72svh]">
      <Experience />
    </DeferredSection>
  );
}
