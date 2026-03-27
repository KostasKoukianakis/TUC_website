import { Hero } from "@/components/Hero";
import { HomeEthosSection } from "@/components/HomeEthosSection";
import { HomeFocusSection } from "@/components/HomeFocusSection";
import { HomeResearchSection } from "@/components/HomeResearchSection";

export default function HomePage() {
  return (
    <>
      <Hero />

      <HomeEthosSection />

      <HomeFocusSection />

      <HomeResearchSection />
    </>
  );
}
