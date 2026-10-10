import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal — Simon Maxam",
  description: "Privacy policy, cookies and terms of use for this website.",
  alternates: { canonical: "/legal" },
};

const blocks = [
  {
    id: "privacy",
    title: "Privacy Policy",
    body: "This site collects no accounts and no tracking profiles. If you send a message through the contact form, it is used only to reply to you and is not sold or shared.",
  },
  {
    id: "cookies",
    title: "Use of Cookies",
    body: "No advertising cookies. Your chosen colour theme may be remembered in your browser's local storage so the site looks the same next time.",
  },
  {
    id: "terms",
    title: "Terms of Use",
    body: "Everything on this site (design, code, images, music, 3D work) belongs to its creator unless stated otherwise. Please ask before reusing it. The site is provided as-is.",
  },
];

export default function LegalPage() {
  return (
    <>
      <PageHero
        kicker="Legal"
        title="Legal"
        lede="Short and plain."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Legal", href: "/legal" },
        ]}
      />
      <div className="mx-auto max-w-[760px] px-5 pb-28 md:px-10">
        {blocks.map((b) => (
          <section key={b.id} id={b.id} className="scroll-mt-24 border-t border-line/60 py-8">
            <h2 className="font-serif text-2xl text-ink">{b.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{b.body}</p>
          </section>
        ))}
        <p className="border-t border-line/60 pt-8 text-sm text-muted">
          Questions? {site.email ? <a className="text-accent" href={`mailto:${site.email}`}>{site.email}</a> : <a className="text-accent" href="/contact">Get in touch</a>}.
        </p>
      </div>
    </>
  );
}
