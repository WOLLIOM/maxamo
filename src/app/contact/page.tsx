import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contact — Simon Maxam",
  description:
    "Get in touch about projects, collaborations, freelance work, or music performances. Based in Calgary, Alberta.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: site.url },
              { name: "Contact", url: `${site.url}/contact` },
            ]),
          ),
        }}
      />
      <PageHero
        kicker="Say hello"
        title="Get in touch"
        lede="Have a project, collaboration idea, or just want to talk shop about games, architecture, music or code? Send a message."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />

      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 pb-28 md:grid-cols-[1fr_1fr] md:gap-20 md:px-10">
        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal delay={1}>
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-6">
              {site.email && (
                <div>
                  <p className="kicker mb-2">Email</p>
                  <a href={`mailto:${site.email}`} className="text-lg text-ink hover:text-accent">
                    {site.email}
                  </a>
                </div>
              )}
              <div>
                <p className="kicker mb-2">Based in</p>
                <p className="text-sm text-muted">Calgary, Alberta, Canada</p>
              </div>
              {Object.values(site.social).some(Boolean) && (
                <div>
                  <p className="kicker mb-2">Follow</p>
                  <div className="flex flex-col gap-1">
                    {Object.entries(site.social)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <a
                          key={k}
                          href={v}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm capitalize text-muted hover:text-accent"
                        >
                          {k}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-muted">
              I usually reply within a few days. For project inquiries, a
              short description of what you're building and your timeline
              helps me respond faster.
            </p>
          </div>
        </Reveal>
      </div>
    </>
  );
}
