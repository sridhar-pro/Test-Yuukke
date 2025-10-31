// components/FullScreenLoader.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import animationData from "@/public/loader.json";

const FullScreenLoader = ({ visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          initial={{ opacity: 1 }} // always visible
          animate={{ opacity: 1 }} // no fade-in
          exit={{ opacity: 0 }} // fade-out only
          transition={{ duration: 0.6 }} // fade out duration
        >
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ height: 100, width: 100 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenLoader;
