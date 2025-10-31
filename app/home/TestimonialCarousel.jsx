"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight, User } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Mashrath Fathima",
    text: "Word spread through the village of Lila’s magical paintings. People came from far and wide, hoping her art could heal their hearts.",
    rating: 5,
  },
  {
    id: 2,
    name: "Rohan Kumar",
    text: "Every brushstroke seemed alive with emotion. People said her paintings whispered to their souls.",
    rating: 4,
  },
  {
    id: 3,
    name: "Priya Das",
    text: "Her gift wasn’t just in painting—it was in seeing beauty in others and helping them see it too.",
    rating: 5,
  },
  {
    id: 4,
    name: "Aman Sharma",
    text: "The colors she used seemed to pull people into a world of warmth and nostalgia.",
    rating: 4,
  },
  {
    id: 5,
    name: "Sara Khan",
    text: "Lila’s art transformed not only her village but also her own heart. Her happiness came from giving.",
    rating: 5,
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  const handleNext = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () =>
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const getTestimonial = (offset) => {
    const newIndex =
      (index + offset + testimonials.length) % testimonials.length;
    return testimonials[newIndex];
  };

  const visibleCards = [
    getTestimonial(-1),
    getTestimonial(0),
    getTestimonial(1),
  ];

  return (
    <div className="w-full h-auto flex flex-col items-center justify-center py-0 md:py-16 bg-white overflow-hidden font-odop">
      {/* Title Section */}
      <div className="text-center mb-0 md:mb-14">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl md:text-5xl font-bold text-[#960B39]"
        >
          What Our Customers Say
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-gray-600 text-base md:text-lg mt-3"
        >
          Real stories from real people who found joy through our work.
        </motion.p>

        <div className="flex justify-center mt-4">
          <div className="w-24 h-[3px] bg-gradient-to-r from-[#960B39] via-[#b30f47] to-[#d91e63] rounded-full"></div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative flex items-center justify-center w-full md:w-[80%] lg:w-[70%] h-[420px]">
        {visibleCards.map((t, i) => {
          const isCenter = i === 1;
          const xOffset = (i - 1) * 400; // 💥 Increased space between cards
          const scale = isCenter ? 1.1 : 0.9;
          const zIndex = isCenter ? 20 : 10;
          const opacity = isCenter ? 1 : 0.85;

          return (
            <motion.div
              key={t.id}
              className={`absolute flex flex-col justify-between items-center p-5 rounded-2xl shadow-lg border transition-all duration-500 ${
                isCenter
                  ? "bg-[#960B39] text-white"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
              animate={{
                x: xOffset,
                scale,
                zIndex,
                opacity,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              style={{
                width: isCenter ? 360 : 280,
                height: isCenter ? 350 : 320,
              }}
            >
              <p
                className={`text-base md:text-lg leading-relaxed text-center ${
                  isCenter ? "mt-14 text-base md:text-xl" : ""
                }`}
              >
                {t.text}
              </p>
              <div className="flex flex-col items-center mt-4">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full border-2 ${
                    isCenter
                      ? "border-white bg-white/20"
                      : "border-gray-300 bg-gray-100"
                  }`}
                >
                  <User
                    className={`${isCenter ? "text-white" : "text-gray-600"}`}
                    size={24}
                  />
                </div>
                <h3
                  className={`font-semibold mt-2 ${
                    isCenter ? "text-white" : "text-black"
                  }`}
                >
                  {t.name}
                </h3>
                <div className="flex mt-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Image
                      key={i}
                      src="/star.png"
                      alt="Star"
                      width={16}
                      height={16}
                      className="mr-1"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation + Pagination Section */}
      <div className="relative w-full flex items-center justify-between mt-12 px-10 md:px-[28rem]">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition shadow-sm"
        >
          <ArrowLeft className="text-gray-700" size={18} />
        </button>

        {/* Pagination Dots — perfectly centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-2">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-[#960B39]"
                  : "w-4 bg-gray-300 hover:bg-gray-400"
              }`}
            ></div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="w-10 h-10 flex items-center justify-center bg-[#960B39] text-white rounded-full hover:bg-[#7c092f] transition shadow-sm"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
