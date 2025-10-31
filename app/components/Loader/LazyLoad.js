"use client";

import React, { Suspense } from "react";
import { useInView } from "react-intersection-observer";
import Skeleton from "react-loading-skeleton";

export default function LazyLoad({ children, fallbackHeight = 300 }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "100px",
  });

  return (
    <div ref={ref}>
      <Suspense fallback={<Skeleton height={fallbackHeight} />}>
        {inView ? children : <Skeleton height={fallbackHeight} />}
      </Suspense>
    </div>
  );
}
