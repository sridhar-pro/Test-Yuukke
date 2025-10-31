"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Add all routes where you want to hide the global footer
  const hideFooterRoutes = ["/seller-registration"];

  if (hideFooterRoutes.includes(pathname)) return null;

  return <Footer />;
}
