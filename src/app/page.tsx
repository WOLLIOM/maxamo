import { Hero } from "@/sections/Hero";
import { Awards } from "@/sections/Awards";
import { Certificates } from "@/sections/Certificates";
import { Story } from "@/sections/Story";
import { Signature } from "@/sections/Signature";
import { GuitarPlayground } from "@/sections/GuitarPlayground";
import { Music } from "@/sections/Music";
import { ProjectLinks } from "@/sections/ProjectLinks";
import { HomeExperience } from "@/sections/HomeExperience";
import { GalleryPreview } from "@/sections/GalleryPreview";
import { Testimonials } from "@/sections/Testimonials";
import { Newsletter } from "@/sections/Newsletter";
import { FAQ } from "@/sections/FAQ";
import { TextMarquee } from "@/components/ui/TextMarquee";
import { faqs } from "@/lib/faq";
import { faqSchema } from "@/lib/schema";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <Hero />
      <GalleryPreview />
      <Awards />
      <Certificates />
      <Story />
      <TextMarquee />
      <Signature />
      <GuitarPlayground />
      <Music />
      <ProjectLinks />
      <HomeExperience />
      <Testimonials />
      <Newsletter />
      <FAQ />
    </>
  );
}
