"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const fadeLeft = {
  hidden: { opacity: 0, x: -100 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 100 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const blogHam = () => {
  const [showMore1, setShowMore1] = useState(false);
  const [showMore2, setShowMore2] = useState(false);
  const [showHiddenSections, setShowHiddenSections] = useState(false);

  // Data for hidden sections — alternating layout
  const extraSections = [
    {
      id: 3,
      title: 'The "Thank You for Changing My Life" Box',
      subtitle: "The Gratitude Box",
      desc: "Perfect for clients, mentors, or loved ones. Our Gratitude Box isn't just a gift—it's a love letter to those who saw potential when we couldn't see it ourselves.",
      more: 'Each artisanal piece whispers: "Because of you, I am more',
      img: "/blog/ham6.png",
      reverse: false,
      link: "https://gift.yuukke.com/product-list/gratitude-box",
    },
    {
      id: 4,
      title: "Elite Desk Hamper",
      subtitle: "Corporate Gifting Made Special",
      desc: "Show appreciation to your team or clients with this premium desk hamper, designed to blend elegance and functionality.",
      more: "Includes high-quality office essentials, gourmet treats, and customizable branding options to make every desk feel special.",
      img: "/blog/ham7.jpg",
      reverse: true,
      link: "https://gift.yuukke.com/product-list/elite-desk-hamper",
    },
    {
      id: 5,
      title: "Signature Conscious Selection Hamper",
      subtitle: "Festive Vibes Packed",
      desc: "Celebrate special occasions sustainably with this thoughtfully curated hamper, full of joy and eco-conscious products.",
      more: "Featuring artisanal goodies, sustainable packaging, and eco-friendly selections that make your gifting meaningful and memorable.",
      img: "/blog/ham1.png",
      reverse: false,
      link: "https://gift.yuukke.com/product-list/signature-consicious",
    },
    {
      id: 6,
      title: "The Conscious Luxe Corporate Hamper",
      subtitle: "Gift of Health & Care",
      desc: "Elevate corporate gifting with a wellness-focused hamper, perfect for promoting health, balance, and productivity.",
      more: "Packed with organic snacks, calming essentials, and premium self-care items to inspire well-being and appreciation.",
      img: "/blog/ham3.jpg",
      reverse: true,
      link: "https://gift.yuukke.com/product-list/the-conscious-luxe-corporate-hamper",
    },
    {
      id: 1,
      title: "Eco-Luxe Selection Hamper",
      subtitle: "Sustainable Luxury Gifting",
      desc: "Indulge in eco-conscious luxury with a carefully curated selection of sustainable goodies that delight and inspire.",
      more: "Featuring artisanal treats, eco-friendly products, and elegant packaging that makes gifting both thoughtful and responsible.",
      img: "/blog/ham8.jpg", // Replace with actual image path
      reverse: false,
      link: "https://gift.yuukke.com/product-list/eco-luxe",
    },
    {
      id: 2,
      title: "Eco-Excellence Kit",
      subtitle: "Green Gifting Made Elegant",
      desc: "Celebrate eco-conscious living with this premium kit filled with sustainable products designed to impress and inspire.",
      more: "Includes organic snacks, eco-friendly essentials, and a curated selection of items that reflect care for both recipient and planet.",
      img: "/blog/ham10.jpeg", // Replace with actual image path
      reverse: true,
      link: "https://gift.yuukke.com/product-list/eco-excellence-kit",
    },
    {
      id: 9,
      title: "The Prosperity Box",
      subtitle: "Abundance & Celebration",
      desc: "Share joy and prosperity with a luxurious hamper that blends festive treats, thoughtful gifts, and elegant presentation.",
      more: "Packed with gourmet goodies, premium selections, and celebratory items to make every occasion memorable and abundant.",
      img: "/blog/ham9.png", // Replace with actual image path
      reverse: false,
      link: "https://gift.yuukke.com/product-list/the-prosperity-box",
    },
  ];

  return (
    <>
      <div className="hidden md:block">
        {/* First Section */}
        <section className="relative w-full bg-white py-16 px-6 md:px-12 lg:px-20 font-odop ">
          <div className="max-w-7xl mx-auto ml-28 flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-0">
            {/* Left Content */}
            <motion.div
              className="w-full lg:w-1/2 relative flex flex-col justify-center z-20"
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="relative">
                <div className="bg-[#A30838]/80 text-white px-6 py-4 rounded-md shadow-lg max-w-[120%] lg:absolute lg:right-[-140px] lg:top-0 z-30">
                  <p className="text-xs font-medium uppercase opacity-80 tracking-wide">
                    Eco-Friendly Gift Sets
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold leading-snug mt-1">
                    The{" "}
                    <span className="font-extrabold italic">
                      "Future Generations Will Thank You"
                    </span>
                  </h2>
                </div>
              </div>

              <p className="text-gray-700 text-base md:text-lg leading-relaxed mt-6 lg:mt-40 ml-0 md:ml-20">
                You know that person who always carries a reusable water bottle
                and actually reads the labels? Our{" "}
                <span className="font-semibold">Bamboo Luxe Hamper</span> speaks
                their language.
                <br />
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mt-4 text-[#a00300] font-semibold text-sm hover:text-[#7d0025] transition"
                  onClick={() => setShowMore1(!showMore1)}
                >
                  {showMore1 ? "Read Less" : "Read More"}
                </motion.button>
              </p>

              {showMore1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-4 ml-0 md:ml-20 text-gray-700 text-base md:text-lg leading-relaxed"
                >
                  <p>
                    It's for those quiet heroes who believe small choices create
                    big changes—and reminds them they're not alone in caring.
                  </p>
                </motion.div>
              )}

              <motion.div
                className="flex items-center gap-4 mt-6 ml-0 md:ml-20"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Link
                  href="https://gift.yuukke.com/product-list/the-bamboo-luxe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#A30838] hover:bg-[#8e0630] transition-all duration-300 text-white font-semibold px-6 py-3 rounded-md shadow-md"
                >
                  View Hamper
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Product Image */}
            <motion.div
              className="w-full lg:w-1/2 relative flex justify-center z-10"
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="w-[380px] h-[380px] bg-gradient-to-r from-[#7d0431] to-[#af164a] absolute top-28 right-4 shadow-xl"></div>
              <div className="relative z-10 border-[16px] border-white overflow-hidden scale-105">
                <Image
                  src="/blog/ham4.jpg"
                  alt="Bamboo Luxe Hamper"
                  width={380}
                  height={380}
                  className="object-cover w-full h-auto transition-transform duration-500 hover:scale-105"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Second Section */}
        <section className="relative w-full bg-white py-16 px-6 md:px-12 lg:px-20 font-odop">
          <div className="max-w-7xl mr-28 mx-auto flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-0">
            {/* Right: Image */}
            <motion.div
              className="w-full lg:w-1/2 relative flex justify-center z-10"
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="w-[380px] h-[380px] bg-gradient-to-r from-[#7d0431] to-[#af164a] absolute top-28 left-4 shadow-xl"></div>
              <div className="relative z-10 border-[16px] border-white overflow-hidden scale-105">
                <Image
                  src="/blog/ham5.png"
                  alt="Mini Treasures Hamper"
                  width={380}
                  height={380}
                  className="object-cover w-full h-auto transition-transform duration-500 hover:scale-105"
                />
              </div>
            </motion.div>

            {/* Left: Content */}
            <motion.div
              className="w-full lg:w-1/2 relative flex flex-col justify-center z-20"
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="relative">
                <div className="bg-[#A30838]/80 text-white px-6 py-4 rounded-md shadow-lg max-w-[120%] lg:absolute lg:left-[-140px] lg:top-0 z-30">
                  <p className="text-xs font-medium uppercase opacity-80 tracking-wide">
                    Mini Hampers
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold leading-snug mt-1">
                    The{" "}
                    <span className="font-extrabold italic">
                      "Just Because You Matter" Box
                    </span>
                  </h2>
                </div>
              </div>

              <p className="text-gray-700 text-base md:text-lg leading-relaxed mt-6 lg:mt-32 mr-0 md:mr-20">
                Sometimes the most powerful words are "I was thinking of you."
                <span className="font-semibold"> Mini Treasures Hamper</span> is
                perfect for those "thank you for existing" moments.
                <br />
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mt-4 text-[#a00300] font-semibold text-sm hover:text-[#7d0025] transition"
                  onClick={() => setShowMore2(!showMore2)}
                >
                  {showMore2 ? "Read Less" : "Read More"}
                </motion.button>
              </p>

              {showMore2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-4 mr-0 md:mr-44 text-gray-700 text-base md:text-lg leading-relaxed"
                >
                  <p>
                    Yuukke’s Mini Treasures Hamper proves small gifts can still
                    make a big impact.
                  </p>
                </motion.div>
              )}

              <motion.div
                className="flex items-center gap-4 mt-6 mr-0 md:mr-44"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Link
                  href="https://gift.yuukke.com/product-list/mini-treasures"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#A30838] hover:bg-[#8e0630] transition-all duration-300 text-white font-semibold px-6 py-3 rounded-md shadow-md"
                >
                  View Hamper
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Hidden Sections */}
        <AnimatePresence>
          {showHiddenSections && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6 }}
              className="space-y-24" // ✅ Proper spacing between hidden sections
            >
              {extraSections.map((section, index) => {
                const isOdd = index % 2 == 0; // ✅ Alternate layout
                return (
                  <section
                    key={section.id}
                    className="relative w-full bg-white py-16 px-6 md:px-12 lg:px-20 font-odop"
                  >
                    <div
                      className={`max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-0 ${
                        isOdd ? "lg:flex-row-reverse lg:ml-28" : "lg:mr-28"
                      }`}
                    >
                      {/* Image Section */}
                      <motion.div
                        className="w-full lg:w-1/2 relative flex justify-center z-10"
                        variants={fadeRight}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                      >
                        {/* Gradient Background */}
                        <div
                          className={`w-[380px] h-[380px] bg-gradient-to-r from-[#7d0431] to-[#af164a] absolute top-28 shadow-xl ${
                            isOdd ? "right-4" : "left-4"
                          }`}
                        ></div>

                        {/* Product Image */}
                        <div className="relative z-10 border-[16px] border-white overflow-hidden scale-105">
                          <Image
                            src={section.img}
                            alt={section.title}
                            width={380}
                            height={380}
                            className="object-cover w-full h-auto transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      </motion.div>

                      {/* Content Section */}
                      <motion.div
                        className="w-full lg:w-1/2 relative flex flex-col justify-center z-20"
                        variants={fadeLeft}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                      >
                        {/* Title Box */}
                        <div className="relative">
                          <div
                            className={`bg-[#A30838]/80 text-white px-6 py-4 rounded-md shadow-lg max-w-[120%] lg:absolute lg:top-0 z-30 ${
                              isOdd ? "lg:right-[-140px]" : "lg:left-[-140px]"
                            }`}
                          >
                            <p className="text-xs font-medium uppercase opacity-80 tracking-wide">
                              {section.subtitle}
                            </p>
                            <h2 className="text-2xl md:text-3xl font-bold leading-snug mt-1">
                              {section.title}
                            </h2>
                          </div>
                        </div>

                        {/* Description */}
                        <p
                          className={`text-gray-700 text-base md:text-lg leading-relaxed mt-6 lg:mt-40 ${
                            isOdd ? "ml-0 md:ml-20" : "mr-0 md:mr-20"
                          }`}
                        >
                          {section.desc}
                        </p>

                        {/* Extra Paragraph */}
                        <p
                          className={`mt-4 text-gray-700 text-base md:text-lg leading-relaxed ${
                            isOdd ? "ml-0 md:ml-20" : "mr-0 md:mr-20"
                          }`}
                        >
                          {section.more}
                        </p>

                        {/* View Hamper Button */}
                        <motion.div
                          className={`flex items-center gap-4 mt-6 ${
                            isOdd ? "ml-0 md:ml-20" : "mr-0 md:mr-44"
                          }`}
                          variants={fadeUp}
                          initial="hidden"
                          whileInView="show"
                          viewport={{ once: true, amount: 0.2 }}
                        >
                          <Link
                            href={section.link || "https://gift.yuukke.com/"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#A30838] hover:bg-[#8e0630] transition-all duration-300 text-white font-semibold px-6 py-3 rounded-md shadow-md"
                          >
                            View Hamper
                          </Link>
                        </motion.div>
                      </motion.div>
                    </div>
                  </section>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* mob */}
      <div className="block md:hidden">
        {/* First Section */}
        <section className="relative w-full bg-white py-16 px-6 md:px-12 lg:px-20 font-odop">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
            {/* Content Section - Now First on Desktop */}
            <motion.div
              className="w-full lg:w-1/2 relative flex flex-col justify-center z-20"
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="relative">
                <div className="bg-[#A30838]/80 text-white px-6 py-4 rounded-md shadow-lg max-w-full lg:max-w-[400px] lg:absolute lg:left-0 lg:top-0 z-30">
                  <p className="text-xs font-medium uppercase opacity-80 tracking-wide">
                    Eco-Friendly Gift Sets
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold leading-snug mt-1">
                    The{" "}
                    <span className="font-extrabold italic">
                      "Future Generations Will Thank You"
                    </span>
                  </h2>
                </div>
              </div>

              <p className="text-gray-700 text-base md:text-lg leading-relaxed mt-6 lg:mt-32">
                You know that person who always carries a reusable water bottle
                and actually reads the labels? Our{" "}
                <span className="font-semibold">Bamboo Luxe Hamper</span> speaks
                their language.
                <br />
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mt-4 text-[#a00300] font-semibold text-sm hover:text-[#7d0025] transition"
                  onClick={() => setShowMore1(!showMore1)}
                >
                  {showMore1 ? "Read Less" : "Read More"}
                </motion.button>
              </p>

              {showMore1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-4 text-gray-700 text-base md:text-lg leading-relaxed"
                >
                  <p>
                    It's for those quiet heroes who believe small choices create
                    big changes—and reminds them they're not alone in caring.
                  </p>
                </motion.div>
              )}

              <motion.div
                className="flex items-center gap-4 mt-6"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Link
                  href="https://gift.yuukke.com/product-list/eco-luxe-workdaykit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#A30838] hover:bg-[#8e0630] transition-all duration-300 text-white font-semibold px-6 py-3 rounded-md shadow-md"
                >
                  View Hamper
                </Link>
              </motion.div>
            </motion.div>

            {/* Product Image - Now Second on Desktop */}
            <motion.div
              className="w-full lg:w-1/2 relative flex justify-center z-10"
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="w-64 sm:w-72 md:w-80 lg:w-[380px] aspect-square bg-gradient-to-r from-[#7d0431] to-[#af164a] absolute top-16 lg:top-28 left-0 lg:left-4 shadow-xl rounded-full"></div>
              <div className="relative z-10 border-8 md:border-12 lg:border-16 border-white overflow-hidden rounded-xl">
                <Image
                  src="/blog/ham4.jpg"
                  alt="Bamboo Luxe Hamper"
                  width={380}
                  height={380}
                  className="object-cover w-full h-auto transition-transform duration-500 hover:scale-105"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Second Section */}
        <section className="relative w-full bg-white py-16 px-6 md:px-12 lg:px-20 font-odop">
          <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Content */}
            <motion.div
              className="w-full lg:w-1/2 relative flex flex-col justify-center z-20 order-2 lg:order-1"
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="relative">
                <div className="bg-[#A30838]/80 text-white px-6 py-4 rounded-md shadow-lg max-w-full lg:max-w-[400px] lg:absolute lg:left-0 lg:top-0 z-30">
                  <p className="text-xs font-medium uppercase opacity-80 tracking-wide">
                    Mini Hampers
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold leading-snug mt-1">
                    The{" "}
                    <span className="font-extrabold italic">
                      "Just Because You Matter" Box
                    </span>
                  </h2>
                </div>
              </div>

              <p className="text-gray-700 text-base md:text-lg leading-relaxed mt-6 lg:mt-32">
                Sometimes the most powerful words are "I was thinking of you."{" "}
                <span className="font-semibold">Mini Treasures Hamper</span> is
                perfect for those "thank you for existing" moments.
                <br />
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mt-4 text-[#a00300] font-semibold text-sm hover:text-[#7d0025] transition"
                  onClick={() => setShowMore2(!showMore2)}
                >
                  {showMore2 ? "Read Less" : "Read More"}
                </motion.button>
              </p>

              {showMore2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-4 text-gray-700 text-base md:text-lg leading-relaxed"
                >
                  <p>
                    Yuukke’s Mini Treasures Hamper proves small gifts can still
                    make a big impact.
                  </p>
                </motion.div>
              )}

              <motion.div
                className="flex items-center gap-4 mt-6"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <Link
                  href="https://gift.yuukke.com/product-list/eco-luxe-workdaykit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#A30838] hover:bg-[#8e0630] transition-all duration-300 text-white font-semibold px-6 py-3 rounded-md shadow-md"
                >
                  View Hamper
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Product Image */}
            <motion.div
              className="w-full lg:w-1/2 relative flex justify-center z-10 order-1 lg:order-2"
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="w-64 sm:w-72 md:w-80 lg:w-[380px] aspect-square bg-gradient-to-r from-[#7d0431] to-[#af164a] absolute top-16 lg:top-28 left-0 lg:left-4 shadow-xl rounded-full"></div>
              <div className="relative z-10 border-8 md:border-12 lg:border-16 border-white overflow-hidden rounded-xl">
                <Image
                  src="/blog/ham5.png"
                  alt="Mini Treasures Hamper"
                  width={380}
                  height={380}
                  className="object-cover w-full h-auto transition-transform duration-500 hover:scale-105"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Hidden Sections */}
        <AnimatePresence>
          {showHiddenSections && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              {extraSections.map((section, index) => {
                const isOdd = index % 2 === 0;

                return (
                  <section
                    key={section.id}
                    className="relative w-full bg-white py-16 px-6 md:px-12 lg:px-20 font-odop"
                  >
                    <div
                      className={`max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16 ${
                        isOdd ? "lg:flex-row-reverse" : ""
                      }`}
                    >
                      {/* Image Section */}
                      <motion.div
                        className="w-full lg:w-1/2 relative flex justify-center z-10"
                        variants={fadeRight}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                      >
                        {/* Product Image */}
                        <div className="relative z-10 border-8 md:border-12 lg:border-16 border-white overflow-hidden rounded-xl">
                          <Image
                            src={section.img}
                            alt={section.title}
                            width={380}
                            height={380}
                            className="object-cover w-full h-auto transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      </motion.div>

                      {/* Content Section */}
                      <motion.div
                        className="w-full lg:w-1/2 relative flex flex-col justify-center z-20"
                        variants={fadeLeft}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                      >
                        {/* Title Box */}
                        <div className="relative">
                          <div
                            className={`bg-[#A30838]/80 text-white px-6 py-4 rounded-md shadow-lg max-w-full lg:max-w-[400px] lg:absolute lg:top-0 z-30 ${
                              isOdd ? "lg:right-0" : "lg:left-0"
                            }`}
                          >
                            <p className="text-xs font-medium uppercase opacity-80 tracking-wide">
                              {section.subtitle}
                            </p>
                            <h2 className="text-2xl md:text-3xl font-bold leading-snug mt-1">
                              {section.title}
                            </h2>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-base md:text-lg leading-relaxed mt-6 lg:mt-32">
                          {section.desc}
                        </p>

                        {/* Extra Paragraph */}
                        <p className="mt-4 text-gray-700 text-base md:text-lg leading-relaxed">
                          {section.more}
                        </p>

                        {/* View Hamper Button */}
                        <motion.div
                          className="flex items-center gap-4 mt-6"
                          variants={fadeUp}
                          initial="hidden"
                          whileInView="show"
                          viewport={{ once: true, amount: 0.2 }}
                        >
                          <Link
                            href={section.link || "https://gift.yuukke.com/"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#A30838] hover:bg-[#8e0630] transition-all duration-300 text-white font-semibold px-6 py-3 rounded-md shadow-md"
                          >
                            View Hamper
                          </Link>
                        </motion.div>
                      </motion.div>
                    </div>
                  </section>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View All Hampers Button */}
      <motion.div
        className="w-full flex justify-center mt-0 md:mt-28 font-odop"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <button
          onClick={() => setShowHiddenSections((prev) => !prev)}
          className="transition-all duration-300 text-[#A30838] font-semibold px-8 py-3 uppercase"
        >
          {showHiddenSections ? "Hide Hampers" : "View All Hampers"}
        </button>
      </motion.div>
    </>
  );
};

export default blogHam;
