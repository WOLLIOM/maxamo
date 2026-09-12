import { Hero } from "@/sections/Hero";
import { GuitarPlayground } from "@/sections/GuitarPlayground";
import { Music } from "@/sections/Music";
import { Awards } from "@/sections/Awards";
import { Certificates } from "@/sections/Certificates";
import { Story } from "@/sections/Story";
import { ProcessSpectrum } from "@/sections/ProcessSpectrum";
import { Signature } from "@/sections/Signature";
import { ProjectLinks } from "@/sections/ProjectLinks";
import { HomeExperience } from "@/sections/HomeExperience";
import { GalleryPreview } from "@/sections/GalleryPreview";
import { Testimonials } from "@/sections/Testimonials";
import { Newsletter } from "@/sections/Newsletter";
import { FAQ } from "@/sections/FAQ";
import { TextMarquee } from "@/components/ui/TextMarquee";
import { PixelMarquee } from "@/components/ui/PixelMarquee";
import { faqs } from "@/lib/faq";
import { faqSchema } from "@/lib/schema";

// Feature flags — toggle sections on/off via code. Control with chat: "toggle off Certificates" etc.
const FEATURE_FLAGS = {
  story: true,
  gallery: true,
  awards: true,
  processSpectrum: true,
  signature: true,
  certificates: true,
  homeExperience: true,
  projectLinks: true,
  testimonials: true,
  newsletter: true,
  faq: true,
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <Hero />
      {FEATURE_FLAGS.story && <Story />}
      {FEATURE_FLAGS.gallery && <GalleryPreview />}
      {FEATURE_FLAGS.awards && <Awards />}
      {FEATURE_FLAGS.certificates && <Certificates />}
      {FEATURE_FLAGS.processSpectrum && <ProcessSpectrum />}
      <TextMarquee text="THE ANSWER IS YES WE DO IT · THE ANSWER IS YES WE DO IT ·" />
      {FEATURE_FLAGS.signature && <Signature />}
      <GuitarPlayground />
      <Music />
      {FEATURE_FLAGS.projectLinks && <ProjectLinks />}
      {FEATURE_FLAGS.homeExperience && <HomeExperience />}
      <TextMarquee />
      {FEATURE_FLAGS.testimonials && <Testimonials />}
      <div className="h-16 md:h-24">
        <PixelMarquee
          text="wild · i will craft more of that   "
          cell={7}
        />
      </div>
      {FEATURE_FLAGS.newsletter && <Newsletter />}
      {FEATURE_FLAGS.faq && <FAQ />}
    </>
  );
}
