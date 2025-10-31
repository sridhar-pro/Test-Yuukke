import React from "react";

const advantages = [
  {
    icon: "/sellerregister-icons/marketingpromotion.png",
    title: "Marketing Promotions",
    desc: "Get Promoted as part of the Stronger Women Circle! Stand alongside us, your journey to growth starts here!",
    border: "border-red-300",
  },
  {
    icon: "/sellerregister-icons/sellersupport.png",
    title: "Seller Support",
    desc: "Our Dedicated Seller Support Team is available via phone, email, chat, and social media to help resolve any questions or issues 7 days a week.",
    border: "border-blue-300",
  },
  {
    icon: "/sellerregister-icons/lowplatformcharges.png",
    title: "Low Platform Charges",
    desc: "Yuukee has a competitive commission fee starting at just 5% per transaction, lower than many other marketplaces. No monthly fee or signup costs.",
    border: "border-yellow-300",
  },
  {
    icon: "/sellerregister-icons/expandedreach.png",
    title: "Expanded Reach",
    desc: "Joining Yuukke gives you instant access to our large buyer base. We invest heavily in marketing to drive new buyers to the marketplace.",
    border: "border-gray-300",
  },
  {
    icon: "/sellerregister-icons/yuukkegrowthtool.png",
    title: "Yuukke Growth Tools",
    desc: "Yuukke Marketplace Sellers get access to mentorship, webinars, community access and more on our Yuukke Platform.",
    border: "border-purple-300",
  },
  {
    icon: "/sellerregister-icons/discountedmembership.png",
    title: "Discounted Membership",
    desc: "Get discounts for participating and displaying your products in Yuukke events like expos, conferences and premium membership.",
    border: "border-red-300",
  },
];

const OurAdvantages = () => {
  return (
    <>
      {/*  Our Advantages Section */}
      <section className="py-16 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
          OUR ADVANTAGES
        </h2>
        <div className="w-16 h-[3px] bg-[#A00300] mx-auto mb-12"></div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {advantages.map((item, index) => (
            <div
              key={index}
              className={`p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-l-4 ${item.border}`}
            >
              <img
                src={item.icon}
                alt={item.title}
                className="w-20 h-20 mx-auto mb-6 transition-transform duration-300 group-hover:scale-110"
              />
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-600 text-md leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default OurAdvantages;
