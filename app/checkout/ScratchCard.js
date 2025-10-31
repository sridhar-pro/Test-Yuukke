"use client";
import { useState, useEffect } from "react";
import ScratchCard from "react-scratchcard-v2";
import { X, Gift, Copy, Check } from "lucide-react";
import Lottie from "lottie-react";
import confettiAnim from "@/public/Confetti.json";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../utils/AuthContext";

const settings = {
  width: 300,
  height: 300,
  image: "/scratchy.png",
  finishPercent: 30,
};

export default function ScratchCardPopup({ onClose }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [couponCodes, setCouponCodes] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const { getValidToken } = useAuth();

  const handleCopy = () => {
    if (selectedCoupon && selectedCoupon.coupon_code !== "0") {
      navigator.clipboard.writeText(selectedCoupon.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch coupons from API
  const fetchCoupons = async () => {
    try {
      const token = await getValidToken();
      const res = await fetch("/api/spin_wheel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Failed to fetch coupons");

      const data = await res.json();
      setCouponCodes(data.coupons);

      // Pick a random coupon immediately
      if (data.coupons.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.coupons.length);
        setSelectedCoupon(data.coupons[randomIndex]);
      }

      // console.log(
      //   "Coupon Codes:",
      //   data.coupons.map((c) => c.coupon_code)
      // );
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] font-odop"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-2xl p-8 w-[90%] max-w-lg flex flex-col items-center overflow-hidden border border-gray-200"
        >
          {revealed && selectedCoupon && selectedCoupon.coupon_code !== "0" && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <Lottie animationData={confettiAnim} loop={false} />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-lg md:text-xl font-semibold text-center mb-6 text-[#a00300] uppercase italic flex items-center gap-2">
            Scratch to reveal your reward
            <Gift className="w-6 h-6 text-[#a00300] mb-1" />
          </h2>

          <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden shadow-lg border-4 border-[#a00300]/40 animate-glow cursor-pointer">
            <ScratchCard {...settings} onComplete={() => setRevealed(true)}>
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f3e0e7] to-[#fff3f3] text-white rounded-xl">
                <p className="text-sm opacity-90 text-black">
                  Your Coupon Code
                </p>
                <h1 className="text-4xl md:text-4xl font-extrabold tracking-widest mt-3 bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-700 drop-shadow-lg text-center">
                  {selectedCoupon
                    ? selectedCoupon.coupon_code === "0"
                      ? "Better Luck Next Time"
                      : selectedCoupon.coupon_code
                    : "Loading..."}
                </h1>
              </div>
            </ScratchCard>

            {revealed &&
              selectedCoupon &&
              selectedCoupon.coupon_code !== "0" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-md flex items-center gap-2 transition z-20 ${
                    copied
                      ? "bg-black text-white"
                      : "bg-white text-[#a00300] hover:bg-gray-100"
                  }`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </motion.button>
              )}
          </div>

          {/* Footer text only if it’s a real coupon */}
          {revealed && selectedCoupon && selectedCoupon.coupon_code !== "0" && (
            <p className="text-xs text-center text-gray-600 mt-6">
              Apply this code at checkout to save on your next order 🎁
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
