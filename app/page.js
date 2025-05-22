import { Suspense } from 'react'

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BetaFeedback from "@/app/betaFeedback/page";
import TestimonialSection from "@/components/TestimonialSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSections";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen m-auto flex flex-col">
      <main className="flex-1 w-[95%] md:w-[85%] m-auto">
        <Header />
        <HeroSection />
        <Suspense fallback={null}>
          <BetaFeedback />
        </Suspense>
        <TestimonialSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <div className="flex-1 w-[95%] md:w-[85%] m-auto">
        <Footer />
      </div>
    </div>
  );
}

export default Index;
