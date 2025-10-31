"use client";
import React, { useRef, useEffect, useState } from "react";

const registrationSteps = [
  {
    title: "Registration",
    desc: 'Register as a "Seller" through the website.',
    icon: "/sellerregister-icons/registration.png",
    position: "right",
  },
  {
    title: "Login",
    desc: "Login credentials are sent to your registered email ID. Use these credentials to log in via the seller login page.",
    icon: "/sellerregister-icons/login.png",
    position: "left",
  },
  {
    title: "Setup Payment Gateway",
    desc: "Setup your payment gateway with your bank account details.",
    icon: "/sellerregister-icons/payments.png",
    position: "right",
  },
  {
    title: "Add Products",
    desc: "Upload your product/service details.",
    icon: "/sellerregister-icons/add products.png",
    position: "left",
  },
  {
    title: "Approval",
    desc: "Approval of your Products by Marketplace Admin.",
    icon: "/sellerregister-icons/approval.png",
    position: "right",
  },
  {
    title: "Homepage Listing",
    desc: "Approved products will be added to the Marketplace Homepage.",
    icon: "/sellerregister-icons/listing.png",
    position: "left",
  },
];

const RegistrationSection = () => {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoverProgress, setHoverProgress] = useState(null); // 💡 new state for hover

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = rect.top - windowHeight;
      const end = rect.bottom;
      const total = end - start;
      const scrolled = windowHeight - rect.top;
      const progress = Math.min(Math.max(scrolled / total, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🧠 Combine scroll and hover progress
  const effectiveProgress =
    hoverProgress !== null ? hoverProgress : scrollProgress;

  return (
    <section
      ref={sectionRef}
      className="py-16 bg-white relative overflow-hidden"
    >
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-2">
        REGISTRATION PROCESS
      </h2>
      <div className="w-16 h-[3px] bg-[#A00300] mx-auto mb-12"></div>

      <div className="relative max-w-5xl mx-auto px-6">
        {/* 🩶 Base Gray Line (hidden on mobile) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-gray-200 hidden md:block"></div>

        {/* ❤️ Scroll + Hover Progress Line (hidden on mobile) */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 border-l-4 border-[#A00300] transition-all duration-300 ease-in-out hidden md:block"
          style={{
            height: `${effectiveProgress * 100}%`,
            boxShadow: "0 0 12px 0px rgba(0, 0, 0, 0.6)",
          }}
        ></div>

        {registrationSteps.map((step, index) => (
          <div
            key={index}
            onMouseEnter={() =>
              setHoverProgress((index + 1) / registrationSteps.length)
            }
            onMouseLeave={() => setHoverProgress(null)}
            className={`mb-12 flex flex-col md:flex-row items-center relative cursor-pointer ${
              step.position === "right" ? "md:justify-end" : "md:justify-start"
            }`}
          >
            {/* Card */}
            <div
              className={`bg-gray-50 rounded-xl shadow-sm p-6 w-full md:w-[45%] transition-transform duration-300 hover:scale-[1.03] relative ${
                step.position === "right"
                  ? "md:ml-10 text-center"
                  : "md:mr-10 text-center"
              }`}
            >
              {/* 📱 Icon — moves inside the box on mobile */}
              <div className="absolute md:hidden top-4 left-4 bg-white border-2 border-[#A00300] rounded-full p-2 w-12 h-12 flex items-center justify-center">
                <img
                  src={step.icon}
                  alt={step.title}
                  className="w-8 h-8 object-contain"
                />
              </div>

              <h3 className="text-xl font-semibold mb-2 mt-14 md:mt-0">
                {step.title}
              </h3>
              <p className="text-gray-600 text-md leading-relaxed">
                {step.desc}
              </p>
            </div>

            {/* 🖥️ Icon (centered on desktop only) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bg-white border-2 border-[#A00300] rounded-full p-4 z-10 transition-transform duration-300 hover:scale-110 hidden md:flex">
              <img
                src={step.icon}
                alt={step.title}
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RegistrationSection;
