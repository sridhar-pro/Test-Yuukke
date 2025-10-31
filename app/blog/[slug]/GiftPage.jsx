"use client";

import Image from "next/image";
import BlogHam from "./blogHam";
import CTA from "./CTA";
import BestSellingHampers from "./bestSelling";
import { motion } from "framer-motion";
import { useState } from "react";

export default function GiftPage() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <section className="relative w-full flex flex-col md:flex-row items-stretch bg-white font-odop overflow-hidden h-[35rem] md:h-[35rem]">
        {/* Left Section (40%) with Background */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative w-full md:w-[40%] h-64 md:h-[500px]"
        >
          <Image
            src="/blog/gift-bg.jpg"
            alt="Gift Background"
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Right Section (60%) with Gradient Content */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative w-full md:w-[60%] h-64 md:h-[500px] flex"
        >
          <div className="bg-gradient-to-r from-[#7d0431] to-[#af164a] p-6 md:p-12 text-white flex flex-col justify-center w-full md:pl-[200px]">
            <motion.h2
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl md:text-3xl font-semibold mb-4"
            >
              Why Gifting Matters More Than Ever
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed max-w-full sm:max-w-xl text-justify"
            >
              Gifting has always been about more than exchanging things — it’s
              about creating connections, celebrating milestones, and showing
              gratitude. In 2025, people are moving away from generic presents
              and leaning towards gifts that carry meaning, purpose, and
              elegance.
            </motion.p>

            {/* Show Read More button ONLY when collapsed */}
            {!showMore && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                viewport={{ once: true }}
                onClick={() => setShowMore(true)}
                className="bg-white text-[#7d0431] font-semibold px-3 sm:px-4 py-2 text-xs sm:text-sm rounded hover:bg-gray-100 transition w-fit"
              >
                Read More
              </motion.button>
            )}

            {/* Extra Content */}
            {showMore && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-4 sm:mt-6 text-xs sm:text-base md:text-lg leading-relaxed max-w-full sm:max-w-xl text-white text-justify"
              >
                <p className="mb-3 sm:mb-4">
                  At Yuukke, we believe gifts should not only delight the
                  receiver but also empower the makers. That’s why our
                  collection brings together women entrepreneurs, artisans, and
                  small businesses to create hampers that are thoughtful,
                  sustainable, and timeless.
                </p>

                {/* Read Less button BELOW the extra content */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  onClick={() => setShowMore(false)}
                  className="bg-white text-[#7d0431] font-semibold px-3 sm:px-4 py-2 text-xs sm:text-sm rounded hover:bg-gray-100 transition w-fit mt-3 sm:mt-4"
                >
                  Read Less
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Overlay Foreground Image */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute top-[90%] md:top-[60%] left-[56%] md:left-[36%] -translate-x-1/2 -translate-y-1/2 z-10 w-[150px] md:w-[420px] hidden md:block"
        >
          <div className="border-[16px] border-white w-full aspect-[3/4]">
            <Image
              src="/blog/gift-overlay.jpg"
              alt="Gift Box"
              width={300}
              height={400}
              className="object-cover w-full h-full rounded-md"
            />
          </div>
        </motion.div>
      </section>

      <BlogHam />
      <CTA />
      <BestSellingHampers />
    </>
  );
}
