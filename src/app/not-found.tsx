import Link from "next/link";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-6 text-center">
      <span className="font-serif text-7xl text-accent">?</span>
      <h1 className="mt-6 font-serif text-fluid-h2 text-ink">Off the map</h1>
      <p className="mt-4 max-w-sm text-muted">
        This page doesn&apos;t exist. Let us guide you back to {site.name}.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-accent px-9 py-4 text-[0.72rem] uppercase tracking-wider2 text-bg transition-all duration-500 hover:brightness-110"
      >
        Return home
      </Link>
    </section>
  );
}
