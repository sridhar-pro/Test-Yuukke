"use client";
import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { X, Gift, Copy, RefreshCcw } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../utils/AuthContext";
import Lottie from "lottie-react";
import confettiAnimation from "@/public/Confetti.json";
import { ColourfulText } from "./ui/colourful-text";
import useZoomLevel from "../hooks/useZoomLevel";
import { fetchWithAuthGlobal } from "../utils/fetchWithAuth";

const SpinnerWheel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(null); // null = not spun yet
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);
  const [canSpin, setCanSpin] = useState(true); // ✅ New state
  const { getValidToken } = useAuth();

  const { zoom, isDesktop } = useZoomLevel();

  const [spinReady, setSpinReady] = useState(false);

  useEffect(() => {
    const lastSpin = localStorage.getItem("lastSpinTime");
    if (lastSpin) {
      const hoursPassed =
        (Date.now() - parseInt(lastSpin, 10)) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        setCanSpin(false);
      }
    }
    setSpinReady(true); // ✅ now we know spin eligibility
  }, []);

  // ⏰ Check last spin time
  useEffect(() => {
    const lastSpin = localStorage.getItem("lastSpinTime");
    if (lastSpin) {
      const hoursPassed =
        (Date.now() - parseInt(lastSpin, 10)) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        setCanSpin(false);
      }
    }
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuthGlobal(
        "/api/spin_wheel",
        { method: "POST", body: {} },
        getValidToken
      );

      if (!data?.coupons) throw new Error("No coupons returned");

      setCoupons(data.coupons.slice(0, 8));
      setMeta({
        title: data.title,
        desc: data.desc,
      });
    } catch (err) {
      console.error(err);
      toast.error("Unable to load wheel options.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCoupons();
  }, [isOpen]);

  const handleSpinClick = () => {
    if (!canSpin) {
      toast.info("⏳ You can spin again after 24 hours!");
      return;
    }
    if (!mustSpin && coupons.length > 0) {
      const newPrizeNumber = Math.floor(Math.random() * coupons.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);

      // ⏰ Save spin time
      localStorage.setItem("lastSpinTime", Date.now().toString());
      setCanSpin(false);
    }
  };

  // 🪄 Format: insert \n every 2 words
  const formatOptionText = (text) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    return words
      .reduce((acc, word, idx) => {
        const sep = (idx + 1) % 2 === 0 && idx + 1 < words.length ? "\n" : " ";
        return acc + word + sep;
      }, "")
      .trim();
  };

  // 🎟️ Format slices
  const slices = coupons.map((c) => ({
    option: formatOptionText(
      c.coupon_desc.toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase()) // Capitalize each word
    ),
  }));
  const winningCoupon = prizeNumber !== null ? coupons[prizeNumber] : null;

  const handleCopy = () => {
    if (winningCoupon?.coupon_code) {
      navigator.clipboard.writeText(winningCoupon.coupon_code);
      toast.success("Coupon code copied!");
    }
  };

  return (
    <>
      {/* Floating Button */}
      {/* Desktop toggle (unchanged) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex fixed top-1/2 right-0 z-[100] transform -translate-y-1/2
    bg-gradient-to-b from-blue-800 via-red-700 to-red-600
    h-14 md:h-32 w-14 md:w-16 rounded-l-3xl flex-col items-center justify-center
    shadow-2xl hover:scale-105 transition-transform duration-300"
        >
          <Gift size={28} className="text-white mb-2" />
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 relative w-full max-w-lg fixed-size-box">
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black"
            >
              <X size={24} />
            </button>

            {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-[#FF4D4D] rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Step 1: Show wheel if spinning hasn't finished */}
                {prizeNumber === null || mustSpin ? (
                  <div className="flex flex-col items-center space-y-8 relative font-odop">
                    {/* 🎯 Title & Description */}
                    {meta && (
                      <div className="text-center max-w-xl mb-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                          {meta.title}
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-gray-600">
                          {meta.desc}
                        </p>
                      </div>
                    )}

                    {/* 🎡 Wheel Container with subtle shadow */}
                    <div className="relative bg-white rounded-full p-6 flex items-center justify-center shadow-xl">
                      <div className="relative inline-block">
                        {/* Outer red border */}
                        <div className="absolute inset-0 rounded-full border-6 border-[#FF4D4D]"></div>

                        {/* Inner white border */}
                        <div className="absolute inset-2 rounded-full border-8 border-white"></div>

                        {/* Wheel itself */}
                        <Wheel
                          mustStartSpinning={mustSpin}
                          prizeNumber={prizeNumber ?? 0}
                          data={slices}
                          onStopSpinning={() => {
                            setMustSpin(false);
                          }}
                          backgroundColors={[
                            "#FF6B6B",
                            "#FF8787",
                            "#FFB6B9",
                            "#FFD6D6",
                            "#FFA6A6",
                            "#FF7B7B",
                          ]}
                          textColors={["#000000"]}
                          outerBorderColor="#FF4D4D" // can keep this same for Wheel internal border
                          outerBorderWidth={6}
                          innerBorderColor="#FFFFFF"
                          innerBorderWidth={4}
                          radiusLineColor="#FFFFFF"
                          radiusLineWidth={1}
                          fontSize={16}
                          textDistance={53}
                          fontStyle="italic"
                          fontWeight={600}
                        />
                      </div>

                      {/* Center glowing hub */}
                      <div className="absolute w-8 h-8 bg-white rounded-full border-2 border-[#FF4D4D] shadow-[0_0_25px_rgba(255,77,77,0.6)] z-50" />
                    </div>

                    {/* ✨ Glowing Spin Button */}
                    <button
                      onClick={handleSpinClick}
                      disabled={!canSpin || mustSpin || slices.length === 0}
                      className={`relative px-14 py-3 rounded-xl font-bold text-white shadow-lg transition-transform duration-300 font-odop
    ${
      !canSpin || mustSpin
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-red-900 via-red-800 to-red-600 hover:scale-105"
    }`}
                    >
                      {!mustSpin && canSpin && (
                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 blur-xl opacity-60 animate-pulse"></span>
                      )}
                      <span className="relative z-10 text-lg tracking-wide">
                        {slices.length === 0 || loading
                          ? "Loading..."
                          : !spinReady
                          ? "Checking..."
                          : !canSpin
                          ? "Spinned"
                          : mustSpin
                          ? "Spinning..."
                          : "Spin Now"}
                      </span>
                    </button>
                  </div>
                ) : (
                  // Step 2: Show winning coupon after spin
                  winningCoupon && (
                    <>
                      {/* 🎉 Confetti Blast if coupon_code > 0 */}
                      {winningCoupon.coupon_code !== "0" &&
                        winningCoupon.coupon_code !== 0 && (
                          <div className="absolute inset-0 z-50 pointer-events-none">
                            <Lottie
                              animationData={confettiAnimation}
                              loop={false} // play once
                              autoplay={true}
                              style={{ width: "100%", height: "100%" }}
                            />
                          </div>
                        )}

                      <div className="mt-8 w-full max-w-md mx-auto p-6 bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl flex flex-col items-center text-center shadow-2xl animate-fadeIn font-odop">
                        {/* Coupon Image */}
                        {winningCoupon.coupon_image && (
                          <img
                            src={`https://marketplace.yuukke.com/assets/uploads/${winningCoupon.coupon_image}`}
                            alt="Coupon"
                            className="w-60 h-60 object-contain mb-6"
                          />
                        )}

                        {/* Gradient Text version */}
                        <span className="bg-gradient-to-r from-blue-800 to-[#a00300] bg-clip-text text-transparent text-4xl font-bold mb-4">
                          <ColourfulText text={winningCoupon.coupon_desc} />
                        </span>

                        {/* Try again message for coupon_code 0 */}
                        {(winningCoupon.coupon_code === "0" ||
                          winningCoupon.coupon_code === 0) && (
                          <p className="mt-2 text-sm sm:text-base text-gray-600 flex items-center space-x-2 mb-4">
                            <RefreshCcw className="w-4 h-4 text-gray-600 " />
                            <span>Try again tomorrow</span>
                          </p>
                        )}

                        {/* Coupon Code & Copy Button */}
                        {winningCoupon.coupon_code !== "0" &&
                          winningCoupon.coupon_code !== 0 && (
                            <>
                              <div className="flex items-center space-x-3 mb-4">
                                <span className="font-mono text-xl sm:text-2xl bg-gray-200 px-4 py-2 rounded-lg shadow-inner select-all capitalize">
                                  {winningCoupon.coupon_code}
                                </span>
                                <button
                                  onClick={handleCopy}
                                  className="px-4 py-2 bg-gradient-to-b from-blue-800 via-red-700 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-200"
                                >
                                  <Copy size={18} />
                                </button>
                              </div>

                              <p className="mt-2 text-sm sm:text-base text-gray-500 mb-4">
                                Use this code at checkout to redeem your prize
                                🎉
                              </p>
                            </>
                          )}

                        {/* ✅ Explore Products Button */}
                        <a
                          href="/products"
                          className="mt-4 px-6 py-3 bg-gradient-to-r from-[#a00300] to-red-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
                        >
                          Explore Products
                        </a>
                      </div>
                    </>
                  )
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SpinnerWheel;
