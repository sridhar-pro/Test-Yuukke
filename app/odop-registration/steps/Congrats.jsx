"use client";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Leaf,
  ArrowBigDownDash,
  BadgeCheck,
  X,
  Heart,
  Truck,
  TrendingUp,
  Camera,
  BookOpenText,
  Package,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const CongratsCard = ({ Icon, title, desc, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    className="bg-[#faf7f7] p-6  text-black text-md space-y-1 rounded-2xl border border-[#cab6b6]"
  >
    <Icon className="w-8 h-8 mx-auto mb-2 text-[#6B1D1D]" />
    <p className="font-semibold text-center">{title}</p>
    <p className="text-xs text-gray-500 text-center">{desc}</p>
  </motion.div>
);

const Congratulations = () => {
  const { t } = useTranslation();
  const name =
    typeof window !== "undefined" ? localStorage.getItem("userName") : "User";

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="font-odop w-full max-w-3xl mx-auto mt-10 px-4 py-10 bg-white text-center space-y-8 -translate-y-24"
    >
      {/* Check Icon */}
      <motion.div
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      >
        <CheckCircle className="w-20 h-20 mx-auto bg-[#6B1D1D] text-white p-5 shadow-xl rounded-full" />
      </motion.div>

      {/* Title and Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-black mb-2">
          🎉 {t("Congratulations")}, {name || t("Seller")}!
        </h1>
        <p className="text-gray-600 mt-2">
          {t("You're officially a Yuukke Eco Seller!")}
        </p>
        <p className="text-gray-600 mt-2">
          {t("Welcome to the sustainable marketplace revolution")}
        </p>
      </motion.div>

      {/* Feature Cards with Staggered Animation */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <CongratsCard
          Icon={Leaf}
          title={t("Hand Crafted")}
          desc={t("Hand crafted products")}
          delay={0.4}
        />
        <CongratsCard
          Icon={TrendingUp}
          title={t("Ready to Sell")}
          desc={t("Ready to list the products")}
          delay={0.6}
        />
        <CongratsCard
          Icon={BadgeCheck}
          title={t("Verification")}
          desc={t("Standard processing")}
          delay={0.8}
        />
      </motion.div>

      <button
        className="bg-[#6B1D1D] px-32 py-2 text-white rounded-xl hover:opacity-90"
        onClick={() => {
          localStorage.removeItem("bankAccount");
          localStorage.removeItem("upiId");
          localStorage.removeItem("userName");
          localStorage.removeItem("phoneNumber");

          const token = localStorage.getItem("Token");
          if (!token) {
            alert("⚠️ Token not found. Please login again.");
            return;
          }

          const dashboardUrl = `https://marketplace.yuukke.com/Oauth/ne_r_login/${token}`;
          window.location.href = dashboardUrl;
        }}
      >
        {t("Go to Dashboard")}
      </button>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-md border border-gray-200 w-full max-w-3xl px-4 sm:px-6 md:px-8 py-8 sm:py-10 mx-auto"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-[#6B1D1D] text-center mb-2">
          {t("Get Seller Tips")}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-8 sm:mb-10 max-w-md mx-auto">
          {t(
            "Boost your store's success with these sustainable selling strategies"
          )}
        </p>

        <ul className="space-y-6 sm:space-y-8 text-gray-800">
          {[
            {
              icon: <Camera className="text-[#6B1D1D]" size={20} />,
              title: "Snap with Style",
              text: "Use natural lighting and neutral backgrounds to let your products do the talking — no fancy studio needed.",
            },
            {
              icon: <Users className="text-[#6B1D1D]" size={20} />,
              title: "Engage Your Buyers",
              text: "Respond promptly, ask for reviews, and build a loyal community that keeps coming back.",
            },
            {
              icon: <Package className="text-[#6B1D1D]" size={20} />,
              title: "Smart & Safe Packaging",
              text: "Eco-conscious, sturdy, and pretty packaging wins hearts and keeps your product safe in transit.",
            },
          ].map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="flex items-start gap-3 sm:gap-4"
            >
              <div className="bg-[#f5eeee] rounded-full p-2 sm:p-3">
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-base sm:text-lg text-[#160909] text-left">
                  {t(item.title)}
                </h4>
                <p className="text-sm sm:text-base text-gray-600 mt-1 text-left">
                  {t(item.text)}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default Congratulations;
