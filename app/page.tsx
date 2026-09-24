import Hero from "@/components/home/Hero";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CatalogPreview from "@/components/home/CatalogPreview";
import ShareResults from "@/components/home/ShareResults";
import ComparisonTable from "@/components/home/ComparisonTable";
import FaqSection from "@/components/home/FaqSection";
import ComingSoon from "@/components/home/ComingSoon";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <CatalogPreview />
      <ShareResults />
      <ComparisonTable />
      <FaqSection />
      <ComingSoon />
      <FinalCta />
    </>
  );
}
