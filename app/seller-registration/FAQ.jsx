"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "What can I sell on Yuukke Marketplace?",
    answer:
      "You can sell handmade, vintage, craft supplies, antiques, collectibles, art, clothing, accessories — anything except prohibited items we outline in our policies.",
  },
  {
    question: "How long does seller approval take?",
    answer:
      "After signing up, seller accounts are typically approved within 1 business day as long as all requirements are met. We'll notify you via email once approved.",
  },
  {
    question: "How do I get paid for my sales?",
    answer:
      "You can choose to get paid either through direct bank deposit. Funds are disbursed on a weekly basis once the buyer receives the order.",
  },
  {
    question: "What are Yuukke's seller policies?",
    answer:
      "We encourage reviewing our seller policies before signing up. Key policies cover prohibited items, returns, shipping, fees, quality standards, etc.",
  },
  {
    question: "Do you provide shipping services?",
    answer:
      "Yuukke has negotiated discounted pricing from popular shipping companies, which you can avail from your account.",
  },
  {
    question: "What marketing tools do you offer?",
    answer:
      "We provide seller education, email marketing, social promotions, ad credits, and more! Check our seller benefits list for details.",
  },
  {
    question: "How can I get help if I have questions?",
    answer:
      "Our seller support team is available 7 days a week via live chat, email, phone, and social media to assist you!",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-2">
          FAQ
        </h2>
        <div className="w-16 h-[3px] bg-[#A00300] mx-auto mb-12"></div>

        {/* FAQ Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <ul>
            {faqs.map((item, index) => (
              <li key={index} className="border-b border-gray-100">
                {/* Header */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between gap-4 py-5 px-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#A00300] text-white text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-800 text-sm md:text-base">
                      {item.question}
                    </p>
                  </div>

                  <div
                    className={`transition-transform duration-300 ${
                      openIndex === index
                        ? "rotate-180 text-[#A00300]"
                        : "text-gray-500"
                    }`}
                  >
                    {openIndex === index ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </button>

                {/* Answer with smooth height animation */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden bg-gray-50 px-14 ${
                    openIndex === index ? "max-h-40 py-4" : "max-h-0 py-0"
                  }`}
                >
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
