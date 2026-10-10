import { Hero } from "@/sections/Hero";
import { GuitarPlayground } from "@/sections/GuitarPlayground";
import { Music } from "@/sections/Music";
import { Awards } from "@/sections/Awards";
import { Certificates } from "@/sections/Certificates";
import { PizzaShowcase } from "@/sections/PizzaShowcase";
import { Story } from "@/sections/Story";
import { ProcessSpectrum } from "@/sections/ProcessSpectrum";
import { GalleryPreview } from "@/sections/GalleryPreview";
import { GeometryDashSection } from "@/sections/GeometryDashSection";
import { ScrollThemer } from "@/components/experience/ScrollThemer";

/** Zero-height markers that drive the scroll theme journey (see ScrollThemer). */
function Scene({ theme }: { theme: string }) {
  return <span aria-hidden data-scene-theme={theme} className="block h-0 w-0" />;
}

// Feature flags — toggle sections on/off via code. Control with chat: "toggle off Certificates" etc.
const FEATURE_FLAGS = {
  story: true,
  gallery: true,
  awards: true,
  processSpectrum: false,
  signature: true,
  certificates: true,
  pizza: true,
  homeExperience: true,
  projectLinks: true,
  testimonials: true,
  newsletter: true,
  faq: true,
};

export default function HomePage() {
  return (
    <>
      <ScrollThemer />
      {/* Scroll journey: Vivid (top) → Monochrome (everything below) */}
      <Scene theme="vivid" />
      <Hero />
      {FEATURE_FLAGS.story && <Story />}
      <Scene theme="mono" />
      {FEATURE_FLAGS.certificates && <Certificates />}
      {FEATURE_FLAGS.gallery && <GalleryPreview />}
      {FEATURE_FLAGS.awards && <Awards />}
      {FEATURE_FLAGS.pizza && <PizzaShowcase />}
      {FEATURE_FLAGS.processSpectrum && <ProcessSpectrum />}
      <GuitarPlayground />
      <Music />
      <GeometryDashSection />
    </>
  );
}
