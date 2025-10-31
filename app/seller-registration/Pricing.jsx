"use client";
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Basic Plan",
      tag: "Standard",
      price: "Free",
      features: [
        { text: "Upload up to 5 Products", available: true },
        { text: "B2B Listing", available: false },
        { text: "Dedicated Page", available: false },
        { text: "ONDC Listing", available: false },
        { text: "International Shipping", available: false },
        { text: "Expo", available: false },
        { text: "Billing & Sales Software", available: false },
        { text: "Dedicated Support for a Month", available: true },
      ],
      tagColor: "bg-lime-400 text-gray-900",
      borderClass: "border border-gray-100",
      shadowClass: "shadow-md hover:shadow-lg",
    },
    {
      name: "Verified Plan",
      tag: "Best Plan",
      price: "₹2900",
      priceSuffix: "/ Yearly",
      features: [
        { text: "Upload up to 25 Products", available: true },
        { text: "B2B Listing (10 Products)", available: true },
        { text: "Dedicated Page", available: false },
        { text: "ONDC Listing", available: false },
        { text: "International Shipping (5 Countries)", available: true },
        { text: "2 Expo (Discounted)", available: true },
        { text: "Billing & Sales Software", available: true },
        { text: "Dedicated Support for 3 Months", available: true },
      ],
      tagColor: "bg-black text-white",
      borderClass: "border-2 border-[#A00300]",
      shadowClass: "shadow-lg",
    },
    {
      name: "Premium Plan",
      tag: "On Sale",
      price: "₹9900",
      priceSuffix: "/ Yearly",
      features: [
        { text: "Unlimited Products", available: true },
        { text: "B2B Listing (25 Products)", available: true },
        { text: "Dedicated Page", available: true },
        { text: "ONDC Listing", available: true },
        { text: "International Shipping (5 Countries)", available: true },
        { text: "5 Expo (Discounted)", available: true },
        { text: "Billing & Sales Software", available: true },
        { text: "Dedicated Support for a Year", available: true },
      ],
      tagColor: "bg-indigo-500 text-white",
      borderClass: "border border-gray-100",
      shadowClass: "shadow-md hover:shadow-lg",
    },
  ];

  return (
    <>
      {/* 💰 Pricing & Plans Section */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 uppercase">
          Pricing & Plans
        </h2>
        <div className="w-16 h-[3px] bg-[#A00300] mx-auto mb-10"></div>

        <p className="text-2xl font-semibold text-gray-900 mb-1">
          Grow Your Business
        </p>
        <p className="text-sm font-medium text-gray-700 tracking-wide mb-6 uppercase">
          By Unlocking This Opportunity
        </p>
        <p className="text-gray-600 mb-16 font-medium">
          Stand Out Among Sellers – Apply For Your Badge Today!
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl ${plan.shadowClass} transform hover:scale-105 transition ${plan.borderClass}`}
            >
              <div className="bg-white p-8 rounded-t-2xl relative">
                <span
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full ${plan.tagColor}`}
                >
                  {plan.tag}
                </span>
                <h3 className="text-xl font-semibold mt-3">{plan.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {plan.price}{" "}
                  {plan.priceSuffix && (
                    <span className="text-sm font-normal text-gray-500">
                      {plan.priceSuffix}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => {
                    const section = document.getElementById("verify-phone");
                    if (section) {
                      section.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="mt-4 bg-black text-white font-semibold py-2 px-8 rounded hover:bg-gray-800 transition"
                >
                  GET STARTED
                </button>
              </div>
              <hr className="my-4 text-gray-200" />
              <ul className="text-left px-8 pb-8 space-y-3 text-gray-700 text-sm">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center space-x-2">
                    {feature.available ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Pricing;
