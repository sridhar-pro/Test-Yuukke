"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ColourfulText } from "../components/ui/colourful-text";
import { useAuth } from "@/app/utils/AuthContext";
import TrackingResult from "./TrackingResult";

const TrackOrder = () => {
  const [trackBy, setTrackBy] = useState("Order Id");
  const [inputValue, setInputValue] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { getValidToken } = useAuth();

  const handleTrackOrder = async () => {
    if (!inputValue.trim()) {
      setError("Please enter a valid tracking value.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const token = await getValidToken();

      const body = {
        order_id: trackBy === "Order Id" ? inputValue.trim() : "",
        awb: trackBy === "AWB" ? inputValue.trim() : "",
        mobile_number:
          trackBy === "Phone Number" && inputValue.trim()
            ? inputValue.trim()
            : "",
      };
      const res = await fetch("/api/orderTracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok)
        throw new Error("Tracking not found. Please check your details.");

      const data = await res.json();
      console.log("response", data);
      setTrackingData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while tracking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center px-4 py-12 font-odop">
      <div className="max-w-6xl w-full">
        {!trackingData ? (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Section */}
            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Track Your Order <br />
                <span className="bg-gradient-to-r from-blue-800 to-[#a00300] bg-clip-text text-transparent">
                  <ColourfulText text="In Real Time" />
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Enter your AWB number, Order ID, or Phone Number to track your
                package's journey.
              </p>
              <div className="mt-8">
                <Image
                  src="/tracking.png"
                  alt="Package tracking illustration"
                  width={350}
                  height={250}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Right Section - Tracking Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-800">
                  Order Tracking
                </h2>
                <p className="text-gray-500">Enter your tracking details</p>
              </div>

              {/* Track By Options */}
              <div className="space-y-3">
                <label className="block font-medium text-gray-700">
                  Track By:
                </label>
                <div className="flex flex-wrap gap-3">
                  {["Order Id", "AWB", "Phone Number"].map((option) => (
                    <button
                      key={option}
                      onClick={() => setTrackBy(option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        trackBy === option
                          ? "bg-[#a00300] text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Field */}
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  {trackBy === "AWB"
                    ? "Airway Bill Number (AWB)"
                    : trackBy === "Order Id"
                    ? "Order ID"
                    : "Phone Number"}
                </label>
                <input
                  type={trackBy === "Phone Number" ? "tel" : "text"}
                  placeholder={
                    trackBy === "AWB"
                      ? "e.g. ABC123456789"
                      : trackBy === "Order Id"
                      ? "e.g. SALE/2025/00/0000"
                      : "e.g. 9876543210"
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                onClick={handleTrackOrder}
                disabled={loading}
                className="w-full bg-[#a00300] text-gray-100 py-3.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {loading ? "Tracking..." : "Track Order"}
              </button>
            </div>
          </div>
        ) : (
          <TrackingResult trackingData={trackingData} />
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
