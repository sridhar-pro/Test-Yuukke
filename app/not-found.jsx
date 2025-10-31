"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/products"); // ⏩ Smooth redirect after a quick moment
    }, 600); // just enough time for skeleton to appear, adjust as needed
    return () => clearTimeout(timer);
  }, [router]);

  return <LoadingFallback count={8} />; // show skeletons while redirecting
}

// 💀 Skeleton Loader (your provided code slightly formatted)
const LoadingFallback = ({ count = 6 }) => (
  <div className="p-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="rounded-lg p-4 shadow-sm bg-white animate-pulse"
      >
        <Skeleton height={180} />
        <Skeleton height={20} className="mt-4" />
        <Skeleton height={20} width="80%" />
        <Skeleton height={30} width="60%" className="mt-4" />
      </div>
    ))}
  </div>
);
