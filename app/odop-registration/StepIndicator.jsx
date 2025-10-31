"use client";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StepIndicator = ({ currentStep }) => {
  const steps = ["Sign Up", "Profile", "Payment"];

  return (
    <div className="font-odop flex justify-center items-center gap-12 md:gap-16 mb-12">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex flex-col items-center relative">
            {/* Animated Circle */}
            <motion.div
              initial={false}
              animate={{
                backgroundColor:
                  isActive || isCompleted ? "#6B1D1D" : "#E5E7EB", // Tailwind's gray-200
                color: isActive || isCompleted ? "#ffffff" : "#111827", // Tailwind's gray-900
              }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base z-10"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isCompleted ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.span
                    key={`step-${index}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {index + 1}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Label */}
            <div className="mt-3 text-sm font-medium text-center text-gray-600 w-24">
              {step}
            </div>

            {/* Animated Horizontal connector line */}
            {index < steps.length - 1 && (
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: index < currentStep ? "#6B1D1D" : "#D1D5DB", // gray-300
                }}
                transition={{ duration: 0.3 }}
                className="absolute top-[50px] right-[-5rem] md:right-[-5.8rem] w-24 md:w-28 h-0.5 z-0"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
