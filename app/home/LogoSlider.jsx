"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../utils/AuthContext";
import Link from "next/link";
import { fetchWithAuthGlobal } from "../utils/fetchWithAuth";

const LogoSlider = () => {
  const [logos, setLogos] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const { getValidToken } = useAuth();
  const hasFetched = useRef(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchLogos = async () => {
      try {
        const data = await fetchWithAuthGlobal(
          "/api/vendorlogo",
          {},
          getValidToken
        );
        console.log("Logo data:", data);

        if (!data || !Array.isArray(data)) {
          throw new Error("No logo data received.");
        }

        const logoUrls = data.map((vendor) => ({
          id: vendor.id,
          slug: vendor.slug,
          logo: `https://marketplace.yuukke.com/assets/uploads/thumbs/${vendor.store_logo}`,
        }));

        setLogos(logoUrls);
      } catch (error) {
        console.error("⚠️ Error fetching logos:", error);
      }
    };

    fetchLogos();
  }, [getValidToken]);

  return (
    <div className="relative w-full overflow-hidden py-8 bg-white mb-16 mt-16">
      <div className="mx-auto px-8 max-w-[1400px]">
        <div
          className={`relative w-full ${
            isMobile ? "overflow-x-auto" : "overflow-hidden"
          }`}
        >
          <div
            className={`flex gap-16 md:gap-40 w-max ${
              !isMobile ? "logo-slider-track" : ""
            }`}
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          >
            {[...logos, ...logos, ...logos].map((vendor, idx) => (
              <div key={`logo-${idx}`} className="flex-shrink-0 w-32 h-20">
                <Link
                  href={{
                    pathname: "/products",
                    query: { warehouses_id: vendor.slug }, // pass slug here
                  }}
                  passHref
                >
                  <img
                    src={vendor.logo}
                    alt={`logo-${vendor.slug}`}
                    className="w-full h-full object-contain cursor-pointer"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar for WebKit browsers */}
      <style jsx global>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
        .logo-slider-track {
          animation: slide 120s linear infinite;
        }
        .logo-slider-track:hover {
          animation-play-state: paused !important;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default LogoSlider;
