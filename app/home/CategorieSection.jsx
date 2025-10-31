"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FlipWords } from "../components/ui/flip-words";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const CategoriesSection = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const hasFetched = useRef(false);
  const sliderRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const words = ["Skincare", "Stationery", "Gift Sets", "Food", "Home Decor's"];

  // ✅ Detect screen size
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // ✅ Fetch categories instantly (no skeleton)
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/homeCategory");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();

        const mapped = data.map((cat) => ({
          name: cat.name,
          image: `https://marketplace.yuukke.com/assets/uploads/thumbs/${cat.image}`,
          slug: cat.slug,
          offer_lable: cat.offer_lable,
        }));

        setCategories(mapped);
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Auto-scroll (only desktop)
  useEffect(() => {
    if (!sliderRef.current || isMobile || categories.length === 0) return;

    const slider = sliderRef.current;
    let frameId;
    const speed = 0.5;

    const step = () => {
      if (!isHovering) {
        slider.scrollLeft += speed;
        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [isHovering, categories, isMobile]);

  const scrollBy = (offset) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  const displayCategories = [...categories, ...categories];

  return (
    <section className="w-full px-4 sm:px-8 lg:px-20 py-16 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 max-w-[110rem] mx-auto">
        <div className="mb-6 sm:mb-0 relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[var(--primary-color)]" />
            <span className="text-xs font-medium text-[var(--primary-color)] tracking-widest uppercase">
              {t("Shop by Category")}
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-medium text-neutral-800">
            {t("Explore our")}{" "}
            <span className="italic" translate="no">
              <FlipWords words={words} />
            </span>
          </div>
          <div className="absolute -bottom-4 left-0 h-0.5 w-24 bg-gradient-to-r from-[var(--primary-color)] to-transparent"></div>
        </div>

        <Link
          href="/products"
          className="flex items-center gap-2 text-sm font-medium group relative overflow-hidden px-1"
        >
          <span className="relative z-10">{t("Discover All Categories")}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--primary-color)] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        </Link>
      </div>

      {/* Slider */}
      {categories.length > 0 && (
        <div className="relative">
          {isMobile && (
            <>
              <button
                onClick={() => scrollBy(-200)}
                className="absolute left-0 top-[134px] -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-md rounded-full p-1 z-20"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={() => scrollBy(200)}
                className="absolute right-0 top-[134px] -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-md rounded-full p-1 z-20"
              >
                <ArrowRight className="h-6 w-6 text-gray-700" />
              </button>
            </>
          )}

          <div
            className="overflow-x-auto scrollbar-hide cursor-grab"
            ref={sliderRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex gap-8 sm:gap-10 select-none w-max">
              {displayCategories.map((category, index) => (
                <motion.div
                  key={index + category.slug}
                  className="group flex-shrink-0 w-[110px] sm:w-[130px] md:w-[160px] flex flex-col items-center"
                  custom={index}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Link
                    href={`/products/category/${category.slug}`}
                    aria-label={`Explore ${category.name} category`}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="relative w-28 h-28 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-xl bg-white p-2 shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3">
                      {category.offer_lable &&
                        category.offer_lable.trim() !== "" && (
                          <div className="absolute bottom-0 left-3 md:left-4 w-full z-10 flex justify-center">
                            <div className="relative w-[120px] md:w-[160px] h-[32px] md:h-[40px] flex items-center justify-center">
                              <Image
                                src="/badge.png"
                                alt="Offer badge"
                                fill
                                sizes="(max-width: 768px) 40px, (max-width: 1200px) 60px, 80px"
                                className="object-contain pointer-events-none select-none"
                                priority
                              />
                              <span className="absolute text-white text-xs md:text-[15px] mt-1 font-bold uppercase font-odop tracking-wide text-center">
                                {category.offer_lable}
                              </span>
                            </div>
                          </div>
                        )}

                      <div className="w-full h-full rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center p-2">
                        <motion.div
                          className="relative w-20 h-20 sm:w-20 sm:h-20 md:w-24 md:h-24"
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Image
                            src={category.image}
                            alt={`Shop ${category.name}`}
                            fill
                            sizes="(max-width: 768px) 40px, (max-width: 1200px) 60px, 80px"
                            className="object-contain drop-shadow-md"
                            quality={100}
                          />
                        </motion.div>
                      </div>
                    </div>

                    <div className="h-[3.5rem] sm:h-[3.75rem] flex items-center justify-center text-center mt-2 md:mt-0">
                      <h3 className="text-sm sm:text-base font-bold text-gray-800 hover:text-[var(--primary-color)] capitalize">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoriesSection;
