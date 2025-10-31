"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info, ArrowRight, Leaf, Heart, Truck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignUpStep from "./steps/SignUpStep";
import ProfileStep from "./steps/ProfileStep";
import PaymentStep from "./steps/PaymentStep";
import StepIndicator from "./StepIndicator";
import { useTranslation } from "react-i18next";

const steps = ["Sign Up", "Profile", "Payment"];

const MultiStepForm = () => {
  const { t } = useTranslation();

  const [showWhy, setShowWhy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hideStepIndicator, setHideStepIndicator] = useState(false);

  const modalRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowWhy(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    sessionStorage.removeItem("reset-reloaded");
  }, []);

  const [currentStep, setCurrentStep] = useState(-1); // -1 means pre-start

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isMobile = window.innerWidth < 640;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <SignUpStep nextStep={nextStep} />;
      case 1:
        return <ProfileStep nextStep={nextStep} prevStep={prevStep} />;
      case 2:
        return (
          <PaymentStep
            prevStep={prevStep}
            onComplete={() => setHideStepIndicator(true)} // 🎯 this hides stepper
          />
        );
      default:
        return (
          <>
            <div className="font-odop  relative flex items-center justify-center h-[38rem] md:min-h-screen bg-white overflow-hidden  -translate-y-0 md:-translate-y-16 ">
              {/* 🍃 Decorative Leaves with Motion */}
              {[
                { top: "top-24", left: "left-[0rem]" },
                { top: "top-56", left: "left-[6rem]" },
                { top: "top-16", right: "right-[4rem]" },
                { top: "top-40", right: "right-[3rem]" },
              ].map((pos, idx) => (
                <motion.div
                  key={idx}
                  className={`absolute bounce-opacity ${pos.top} ${
                    pos.left || pos.right
                  } text-[#6B1D1D]`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2, duration: 0.6 }}
                >
                  <Leaf size={22} />
                </motion.div>
              ))}

              {/* 🎯 Hero Text */}
              <motion.div
                className="text-center p-6 space-y-4 z-10 md:-translate-y-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-[2rem] md:text-[3rem] font-bold text-[#411111]">
                  {t("Welcome to")}{" "}
                  <span className="text-[#6B1D1D]">Yuukke</span>
                </h1>
                <h4 className="text-[1.5rem] md:text-[1.875rem] font-semibold text-[#3F1F1F]">
                  {t("The Marketplace for Conscious Sellers")}
                </h4>
                <p className="text-gray-500 text-[1rem] md:text-[1.25rem]">
                  {t(
                    "Reach conscious buyers and grow your sustainable business effortlessly."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:justify-center mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextStep}
                    className="bg-[#6B1D1D] hover:bg-[#551414] text-white px-6 py-3 cursor-pointer rounded-xl font-medium w-full sm:w-auto flex items-center justify-center gap-2 transition"
                  >
                    <ArrowRight size={18} />
                    <span>{t("Start Onboarding")}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowWhy(!showWhy)}
                    className="bg-transparent hover:bg-gray-100 text-black px-6 py-3 cursor-pointer rounded-xl font-medium w-full sm:w-auto flex items-center justify-center gap-2 transition"
                  >
                    <Info size={18} className="text-gray-700" />
                    <span>{t("Why Sell on Yuukke?")}</span>
                  </motion.button>
                </div>

                <p className="text-sm text-gray-500">
                  {t("Trusted by 1,000+ sustainable brands")}
                </p>
              </motion.div>

              {/* 🚪 Modal: Onboarding */}
              {showModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
                >
                  <motion.div
                    ref={modalRef}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                  >
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setCurrentStep(1);
                      }}
                      className="absolute top-4 right-4 text-[#6B1D1D] hover:text-[#551414] transition border rounded-full p-1 bg-white"
                    >
                      <X size={16} className="text-gray-900" />
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* 🌿 Modal: Why Yuukke */}
            </div>
            {showWhy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
              >
                <motion.div
                  ref={modalRef}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                >
                  <button
                    onClick={() => setShowWhy(false)}
                    className="absolute top-4 right-4 text-[#6B1D1D] hover:text-[#551414] transition border rounded-full p-1 bg-white"
                  >
                    <X size={16} className="text-gray-900" />
                  </button>

                  <h2 className="text-2xl font-bold mb-6 text-[#6B1D1D] text-center">
                    Why Choose Yuukke?
                  </h2>

                  <ul className="space-y-6 text-gray-700 text-left">
                    {[
                      {
                        icon: <Heart className="text-[#6B1D1D]" size={20} />,
                        title: "Marketing Promotions",
                        text: "Get Promoted as part of the Stronger Women Circle!",
                      },
                      {
                        icon: <Leaf className="text-[#6B1D1D]" size={20} />,
                        title: "Seller Support",
                        text: "Our Dedicated Seller Support Team is available via phone, email, chat, and social media.",
                      },
                      {
                        icon: <Truck className="text-[#6B1D1D]" size={20} />,
                        title: "Yuukke Growth Tools",
                        text: "Yuukke Marketplace Sellers get access to mentorship, webinars, community access.",
                      },
                    ].map((item, idx) => (
                      <motion.li
                        key={idx}
                        className="flex items-start gap-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 }}
                      >
                        <div className="bg-red-100 rounded-full p-2">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#160909]">
                            {item.title}
                          </h4>
                          <p>{item.text}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-auto md:min-h-screen px-4 pt-10 pb-6">
      {/* Step Indicator */}
      {!hideStepIndicator && currentStep >= 0 && (
        <StepIndicator currentStep={currentStep} />
      )}

      {/* Step Content */}
      <div className="w-full mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MultiStepForm;
