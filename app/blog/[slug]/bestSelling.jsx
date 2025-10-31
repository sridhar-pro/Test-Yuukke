"use client";
import React from "react";
import { motion } from "framer-motion";

export default function HampersSection() {
  const hampers = [
    {
      text: "The Signature Conscious Selection Hamper is where luxury meets responsibility.",
      btn: "View Hamper",
      img: "/blog/ham1.png",
      link: "https://gift.yuukke.com/product-list/signature-consicious",
    },
    {
      text: "The Gratitude Box is a heartfelt way to say thank you.",
      btn: "View Hamper",
      img: "/blog/ham6.png",
      link: "https://gift.yuukke.com/product-list/gratitude-box",
    },
    {
      text: "The Conscious Luxe Corporate Hamper blends premium cork-base work",
      btn: "View Hamper",
      img: "/blog/ham3.jpg",
      link: "https://gift.yuukke.com/product-list/the-conscious-luxe-corporate-hamper",
    },
  ];

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="mt-24 text-center font-odop">
      <motion.h2
        className="text-3xl md:text-5xl font-bold text-[#8b0035] mb-8"
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        Best Selling Hampers
      </motion.h2>

      <section className="w-full py-12 flex justify-center">
        <motion.div
          className="max-w-7xl w-full bg-gradient-to-r from-[#6b002d] to-[#8b0035] grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4 mx-auto py-12 mt-0 md:mt-16 h-auto md:h-96"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {hampers.map((hamper, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center md:-translate-y-40"
              variants={item}
            >
              {/* Image above content */}
              <img
                src={hamper.img}
                alt={`Hamper ${i + 1}`}
                className="mb-4 w-80 h-80 object-cover rounded border-8 border-white"
              />

              <p className="text-white text-sm md:text-base mb-6 max-w-xs">
                {hamper.text}
              </p>

              <a href={hamper.link} target="_blank" rel="noopener noreferrer">
                <button className="bg-white text-[#8b0035] font-semibold px-6 py-2 rounded shadow hover:bg-gray-100 transition">
                  {hamper.btn}
                </button>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
