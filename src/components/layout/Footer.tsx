import Link from "next/link";
import { site } from "@/lib/site";

// Minimal legal-links footer (Privacy / Cookies / Terms / Legal / Site Map), styled
// like the reference screenshot: near-black strip, small bold grey links.
const links = [
  { label: "Privacy Policy", href: "/legal#privacy" },
  { label: "Use of Cookies", href: "/legal#cookies" },
  { label: "Terms of Use", href: "/legal#terms" },
  { label: "Legal", href: "/legal" },
  { label: "Site Map", href: "/sitemap.xml" },
];

export function Footer() {
  return (
    <footer className="relative bg-[#03050d] py-10 md:py-12">
      <nav
        aria-label="Legal"
        className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-8 gap-y-1 px-5"
      >
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="inline-flex min-h-12 items-center text-sm font-semibold text-[#9aa0ad] transition-colors hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="mt-2 text-center text-[0.68rem] uppercase tracking-wider2 text-[#5d6370]">
        © {new Date().getFullYear()} {site.name} · Calgary, Alberta
      </p>
    </footer>
  );
}
