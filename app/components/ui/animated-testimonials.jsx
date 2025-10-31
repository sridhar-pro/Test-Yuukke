"use client";
import {
  IconArrowLeft,
  IconArrowRight,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

export const AnimatedTestimonials = ({ testimonials, autoplay = true }) => {
  const [active, setActive] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleNext = useCallback(() => {
    setIsVideoPlaying(false); // Pause when changing testimonials
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setIsVideoPlaying(false); // Pause when changing testimonials
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const toggleVideoPlay = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  useEffect(() => {
    if (!autoplay) return;
    if (isVideoPlaying) return;

    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext, isVideoPlaying]);

  return (
    <div className="relative pb-10 px-4 md:px-6 lg:px-6 bg-white dark:from-[var(--primary-color)]/10 dark:to-gray-900 transition-colors">
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="contents"
          >
            {/* Video Section */}
            <div className="relative h-96 w-full group">
              <motion.div
                className="absolute inset-0 shadow-xl rounded-3xl overflow-hidden bg-black"
                initial={{ opacity: 0, scale: 0.92, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.92, rotate: -5 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Video element that serves as both thumbnail and player */}
                <iframe
                  src={`${testimonials[active].src}${
                    isVideoPlaying
                      ? "?autoplay=1&mute=1"
                      : "&autoplay=0&mute=1&loop=0&controls=0"
                  }`}
                  className={`w-full h-full ${
                    !isVideoPlaying ? "pointer-events-none" : ""
                  }`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={testimonials[active].name}
                />

                {/* Play button overlay - only shown when not playing */}
                {!isVideoPlaying && (
                  <button
                    onClick={toggleVideoPlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300"
                  >
                    <div className="bg-white/90 hover:bg-white transition-all duration-300 p-4 rounded-full shadow-lg">
                      <IconPlayerPlay className="h-8 w-8 text-[var(--primary-color)] fill-[var(--primary-color)]" />
                    </div>
                  </button>
                )}
              </motion.div>
            </div>

            {/* Text Content Section */}
            <div className="flex flex-col justify-between h-full">
              <div>
                <h3 className="text-3xl font-bold text-[var(--primary-color)] dark:text-[var(--primary-color)] mb-1">
                  {testimonials[active].name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
                  {testimonials[active].designation}
                </p>

                <blockquote className="relative pl-6 border-l-4 border-[var(--primary-color)] text-gray-700 text-lg italic space-y-2">
                  {testimonials[active].quote.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.015,
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </blockquote>

                {/* <a
                  href={testimonials[active].button.link}
                  className="mt-8 inline-block px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors duration-300 shadow-md"
                >
                  {testimonials[active].button.text}
                </a> */}
              </div>

              <div className="flex items-center justify-between mt-10">
                <div className="flex gap-3">
                  <button
                    onClick={handlePrev}
                    className="rounded-full bg-white p-2 shadow-md hover:bg-[var(--primary-color)]/10 dark:hover:bg-[var(--primary-color)]/20 transition"
                  >
                    <IconArrowLeft className="h-5 w-5 text-[var(--primary-color)] " />
                  </button>
                  <button
                    onClick={handleNext}
                    className="rounded-full bg-white  p-2 shadow-md hover:bg-[var(--primary-color)]/10 dark:hover:bg-[var(--primary-color)]/20 transition"
                  >
                    <IconArrowRight className="h-5 w-5 text-[var(--primary-color)] " />
                  </button>
                </div>

                <div className="flex gap-2 items-center">
                  {testimonials.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        index === active
                          ? "bg-[var(--primary-color)] scale-125"
                          : "bg-[var(--primary-color)]/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
