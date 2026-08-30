import { Hero } from "@/sections/Hero";
import { Awards } from "@/sections/Awards";
import { Certificates } from "@/sections/Certificates";
import { Story } from "@/sections/Story";
import { ProcessSpectrum } from "@/sections/ProcessSpectrum";
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
      <Story />
      <GalleryPreview />
      <Awards />
      <Certificates />
      <ProcessSpectrum />
      <TextMarquee text="THE ANSWER IS YES WE DO IT · THE ANSWER IS YES WE DO IT ·" />
      <Signature />
      <GuitarPlayground />
      <Music />
      <ProjectLinks />
      <HomeExperience />
      <TextMarquee />
      <Testimonials />
      <Newsletter />
      <FAQ />
    </>
  );
}
