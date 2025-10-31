"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/utils/AuthContext";
import { Tag, X } from "lucide-react";
import { ColourfulText } from "./ui/colourful-text";
import { fetchWithAuthGlobal } from "../utils/fetchWithAuth";

const FlashSaleOffer = () => {
  const { getValidToken, isAuthReady } = useAuth();
  const router = useRouter();
  const [offer, setOffer] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [expanded, setExpanded] = useState(false); // mobile expand toggle
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    const cleanImage = image.trim().replace(/^\/+/, "");
    if (cleanImage.startsWith("http") || cleanImage.startsWith("/"))
      return cleanImage;
    return `https://marketplace.yuukke.com/assets/uploads/${cleanImage}`;
  };

  // Fetch flash sale
  useEffect(() => {
    if (!isAuthReady) return;

    const fetchFlashSale = async () => {
      try {
        const data = await fetchWithAuthGlobal(
          "/api/flashsale",
          { method: "POST" },
          getValidToken
        );

        if (!data?.flash_sales) return;

        const offerData = data.flash_sales;
        const now = new Date().getTime();
        const start = new Date(offerData.start_time).getTime();
        const end = new Date(offerData.end_time).getTime();

        if (now >= start && now <= end) {
          setOffer(offerData);
          setVisible(true);
        }
      } catch (err) {
        console.error("Flash Sale fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSale();
  }, [getValidToken, isAuthReady]);

  // Countdown timer
  useEffect(() => {
    if (!offer) return;

    const endTime = new Date(offer.end_time).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = endTime - now;
      if (diff <= 0) {
        setRemainingTime(0);
        clearInterval(interval);
        setVisible(false);
      } else {
        setRemainingTime(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  if (loading || !offer || !visible) return null;

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Desktop View — unchanged */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-12 md:bottom-5 right-0 z-[90]"
            >
              <div className="relative bg-transparent overflow-hidden w-96 font-odop">
                <button
                  onClick={() => setVisible(false)}
                  className="absolute top-2 right-2 text-white drop-shadow-md hover:text-gray-200 transition z-20"
                >
                  <X size={18} />
                </button>

                <div
                  className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => router.push("/products/offers")}
                >
                  <img
                    src={getImageSrc(offer?.image)}
                    alt="Flash Sale"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-12 left-[170px] right-0 text-center text-[#000940] z-10 uppercase italic">
                    <p className="text-sm font-bold mt-1 drop-shadow-sm">
                      <ColourfulText text="Offer Ends in:" /> <br />
                      <span className="text-2xl" style={{ fontWeight: 950 }}>
                        {formatTime(remainingTime)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mobile View — circle toggle */}
          {isMobile && (
            <div className="fixed bottom-20 right-1 z-[100] font-odop">
              <AnimatePresence mode="wait">
                {!expanded ? (
                  // The circular teaser button
                  <motion.button
                    key="circle"
                    onClick={() => setExpanded(true)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex fixed bottom-20 right-0 z-[100] transform -translate-y-1/2
    bg-gradient-to-b from-blue-800 via-red-700 to-red-600
    h-14 w-14 rounded-l-3xl flex-col items-center justify-center
    shadow-2xl hover:scale-105 transition-transform duration-300 text-white"
                  >
                    <Tag size={26} strokeWidth={2.5} />
                  </motion.button>
                ) : (
                  // The expanded full offer
                  <motion.div
                    key="offer"
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.2, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative bg-transparent overflow-hidden w-[22rem] font-odop"
                  >
                    <button
                      onClick={() => setExpanded(false)}
                      className="absolute top-2 right-2 text-black drop-shadow-md hover:text-gray-200 transition z-20"
                    >
                      <X size={18} />
                    </button>

                    <div
                      className="relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer"
                      onClick={() => router.push("/products/offers")}
                    >
                      <img
                        src={getImageSrc(offer?.image)}
                        alt="Flash Sale"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-12 left-[168px] right-0 text-center text-[#000940] z-10 uppercase italic">
                        <p className="text-sm font-bold mt-1 drop-shadow-sm">
                          <ColourfulText text="Offer Ends in:" /> <br />
                          <span
                            className="text-2xl"
                            style={{ fontWeight: 950 }}
                          >
                            {formatTime(remainingTime)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default FlashSaleOffer;
