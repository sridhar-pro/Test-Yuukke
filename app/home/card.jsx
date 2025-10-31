"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WobbleCard } from "@/app/components/ui/wobble-card";
import Image from "next/image";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import CategoriesSection from "./CategorieSection";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "../utils/AuthContext";
import { fetchWithAuthGlobal } from "../utils/fetchWithAuth";

export function WobbleCardDemo() {
  const { t } = useTranslation();
  const { getValidToken } = useAuth();
  const hasFetched = useRef(false);

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchNewArrivals = async () => {
      try {
        const data = await fetchWithAuthGlobal(
          "/api/newarrival",
          {},
          getValidToken
        );
        if (!data) return;

        const getShortDescription = (htmlText, wordLimit = 20) => {
          if (!htmlText) return "";

          const text = htmlText.replace(/<[^>]*>/g, "").trim();
          const words = text.split(/\s+/);
          if (words.length <= wordLimit) return text;

          let snippet = words.slice(0, wordLimit).join(" ");
          const extraWords = words.slice(wordLimit, wordLimit + 5).join(" ");
          const fullStopIndex = extraWords.indexOf(".");
          snippet +=
            fullStopIndex !== -1
              ? extraWords.slice(0, fullStopIndex + 1)
              : "...";

          return snippet;
        };

        const idsToIgnore = ["1179", "1165"]; // ❌ must be strings

        const mappedSlides = data
          .filter((item) => !idsToIgnore.includes(item.id)) // ✅ now it will work
          .map((item) => ({
            title: item.name,
            description: getShortDescription(item.product_details),
            shortDescription: getShortDescription(item.product_details),
            image: `https://marketplace.yuukke.com/assets/uploads/${item.image}`,
            link: item.slug,
          }));

        setSlides(mappedSlides);
      } catch (error) {
        console.error("❌ Error fetching new arrivals:", error);
      }
    };

    fetchNewArrivals();
  }, [getValidToken]);

  // Slide autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (slides.length ? (prev + 1) % slides.length : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, [slides]);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const activeSlide = slides[index] || {};

  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <>
      <CategoriesSection />

      <div className="flex flex-col lg:flex-row gap-10 w-full mt-0 md:mt-6 px-4 sm:px-6 md:px-10 lg:px-20">
        {/* Left Card - 65% width */}
        <div className="w-full lg:w-[65%] relative" translate="no">
          <Link href={`/products/${activeSlide.link}`} passHref>
            <WobbleCard containerClassName="min-h-[400px] max-h-[600px] md:max-h-[400px] h-full relative overflow-hidden cursor-pointer">
              <div className="flex flex-col md:flex-row justify-between items-center h-full w-full p-4 gap-6">
                <AnimatePresence mode="wait">
                  {slides.length > 0 && (
                    <motion.div
                      key={index}
                      variants={fadeVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.6 }}
                      className="flex flex-col md:flex-row justify-between items-center w-full gap-6"
                    >
                      {/* Text Section */}
                      <div className="flex flex-col justify-center items-start w-full md:w-1/2">
                        <span className="text-sm text-[var(--primary-color)] font-semibold uppercase">
                          New Arrival !
                        </span>
                        <h2 className="mt-2 text-2xl md:text-2xl lg:text-3xl font-bold text-black text-justify md:text-left">
                          {activeSlide.title.split(" ").slice(0, 10).join(" ") +
                            (activeSlide.title.split(" ").length > 10
                              ? "..."
                              : "")}
                        </h2>

                        {/* Mobile Description */}
                        <p className="mt-4 text-sm sm:text-base text-neutral-400 text-justify tracking-tight md:hidden">
                          {activeSlide.shortDescription}
                        </p>

                        {/* Desktop / Tablet Description */}
                        <p className="mt-4 text-sm sm:text-base text-neutral-400 text-justify tracking-tight hidden md:block">
                          {activeSlide.description}
                        </p>
                      </div>

                      {/* Image Section */}
                      <div className="w-full md:w-1/2 flex justify-center relative h-[200px] sm:h-[240px] md:h-[280px] lg:h-[340px]">
                        {activeSlide.image && (
                          <Image
                            src={activeSlide.image}
                            alt={activeSlide.title}
                            fill
                            className="rounded-xl object-contain"
                            sizes="(max-width: 768px) 200px, (max-width: 1024px) 280px, 340px"
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Arrows */}
              <div className="absolute bottom-6 left-4 sm:left-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // ⛔ prevent Link navigation
                    e.preventDefault();
                    handlePrev();
                  }}
                  className="bg-white hover:bg-neutral-100 text-black p-2 rounded-full shadow-lg transition-all duration-300 border border-neutral-200"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-6 right-4 sm:right-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // ⛔ prevent Link navigation
                    e.preventDefault();
                    handleNext();
                  }}
                  className="bg-white hover:bg-neutral-100 text-black p-2 rounded-full shadow-lg transition-all duration-300 border border-neutral-200"
                >
                  <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
            </WobbleCard>
          </Link>
        </div>

        {/* Right Card */}
        <div className="w-full lg:w-[30%]">
          <WobbleCard containerClassName=" h-full p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-left text-lg sm:text-xl font-semibold text-black">
                {t("DISCOVER TOP DEALS ACROSS ALL CATEGORIES!")}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-500">
                {t(
                  "From fashion to gadgets, home decor to wellness — explore handpicked deals every day and enjoy unbeatable prices."
                )}
              </p>
            </div>
            <Link href="/products/offers">
              <button className="mt-6 mx-auto text-white bg-[var(--primary-color)] cursor-pointer hover:bg-white hover:text-[var(--primary-color)] font-semibold text-sm px-5 py-2 rounded-full transition">
                {t("Browse All Offers")}
              </button>
            </Link>
          </WobbleCard>
        </div>
      </div>
    </>
  );
}
