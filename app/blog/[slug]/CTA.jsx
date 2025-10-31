import Image from "next/image";
import { motion } from "framer-motion";
import PopupForm from "@/app/components/PopupForm";
import { useState } from "react";

const fadeLeft = {
  hidden: { opacity: 0, x: -80 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 80 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function BulkOrdersCTA() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const closePopup = () => {
    setIsPopupOpen(false);
  };
  return (
    <section className="relative w-full max-w-7xl mx-auto my-12 rounded-2xl overflow-hidden shadow-lg font-odop">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/blog/bulk.jpg"
          alt="Bulk Orders"
          fill
          className="object-cover" // ✅ removed mirror flip
          priority
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#A00300]/70 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-6 md:px-12 py-10">
        {/* Left: Text */}
        <motion.div
          className="text-left text-white max-w-xl order-1"
          variants={fadeLeft}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold leading-snug">
            Looking for Bulk Orders or <br /> Custom Hampers?
          </h2>
          <p className="mt-3 text-base md:text-lg text-white/90">
            Whether it’s 10 or 1000, we make bulk gifting simple and special.
            Let us tailor hampers to fit your style and budget.
          </p>
        </motion.div>

        {/* Right: Enquire Button */}
        <motion.div
          className="order-2"
          variants={fadeRight}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* ⬇️ Popup Form */}
          <PopupForm isOpen={isPopupOpen} onClose={closePopup} />

          <button
            onClick={() => setIsPopupOpen(true)} // 🔹 Open the popup instead of opening a new tab
            className="bg-[#A00335] hover:bg-[#80022B] text-white font-semibold text-lg px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
          >
            Enquire Now
          </button>
        </motion.div>
      </div>
    </section>
  );
}
