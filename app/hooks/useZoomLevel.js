import { useState, useEffect } from "react";

export default function useZoomLevel() {
  const [zoom, setZoom] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkZoom = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);

      // Create a hidden div to measure true zoom ratio
      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.visibility = "hidden";
      div.style.height = "1in"; // 1 inch in CSS units
      document.body.appendChild(div);

      // The actual number of pixels per inch changes when zooming
      const dpi = div.offsetHeight;
      document.body.removeChild(div);

      // 96 is the standard DPI for 100% zoom
      const zoomRatio = dpi / 96;
      setZoom(zoomRatio);
    };

    checkZoom();

    window.addEventListener("resize", checkZoom);
    window.addEventListener("orientationchange", checkZoom);

    return () => {
      window.removeEventListener("resize", checkZoom);
      window.removeEventListener("orientationchange", checkZoom);
    };
  }, []);

  return { zoom, isDesktop };
}
