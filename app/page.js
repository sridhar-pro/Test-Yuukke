"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ImagesSliderDemo } from "./home/slider";
import { WobbleCardDemo } from "./home/card";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ⏳ Product card skeleton loader
const LoadingFallback = ({ count = 6 }) => (
  <div className="p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="rounded-lg p-4 shadow-sm bg-white animate-pulse"
      >
        <Skeleton height={180} />
        <Skeleton height={20} style={{ marginTop: "1rem" }} />
        <Skeleton height={20} width={"80%"} />
        <Skeleton height={30} width={"60%"} style={{ marginTop: "1rem" }} />
      </div>
    ))}
  </div>
);

const LogoSlider = dynamic(() => import("./home/LogoSlider"), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

const Products = dynamic(() => import("./home/Products/Page"), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

const Testimonial = dynamic(() => import("./home/TestimonialCarousel"), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

// ✅ Lazy load SpinnerWheel too
const SpinnerWheel = dynamic(() => import("./components/SpinnerWheel"), {
  ssr: false,
  loading: () => <div className="flex justify-center"> </div>,
});

export default function Home() {
  return (
    <>
      <ImagesSliderDemo />

      {/* 🌀 Lazy-loaded spinner wheel */}
      <SpinnerWheel />

      {/* 🧩 Lazy-loaded sections with skeleton fallback */}
      <WobbleCardDemo />
      <Products />
      {/* <Testimonial /> */}
      <LogoSlider />
    </>
  );
}
