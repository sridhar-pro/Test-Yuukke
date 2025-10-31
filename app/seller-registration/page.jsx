import React from "react";
import RegistrationSection from "./RegistrationSection";
import OurAdvantages from "./OurAdvantages";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import Footer from "./Footer";
import VerifyPhoneSection from "./VerifyPhoneSection";

const Page = () => {
  return (
    <div className="w-full font-odop">
      {/* 🎥 Intro Video */}
      <video
        src="/intro.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-auto"
      />

      <OurAdvantages />
      <RegistrationSection />
      <Pricing />
      <FAQ />
      <VerifyPhoneSection />
      <Footer />
    </div>
  );
};

export default Page;
