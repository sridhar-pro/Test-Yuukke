"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarDemo } from "./sidebardemo";

export default function OrdersPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // ✅ Ensure this runs only on client
    if (typeof window !== "undefined") {
      const companyId = localStorage.getItem("company_id");
      const userId = localStorage.getItem("user_id");
      const accessToken = localStorage.getItem("access_token");

      // ✅ If any crucial session value missing → redirect to login
      if (!companyId || !userId || !accessToken) {
        console.warn("⚠️ Missing session data, redirecting to login...");
        router.replace("/login");
      } else {
        setIsLoggedIn(true);
      }

      setIsChecking(false);
    }
  }, [router]);
  // ⏳ Show loader while checking login
  if (isChecking) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#a00300] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ❌ If not logged in → don't render content
  if (!isLoggedIn) return null;

  // ✅ If logged in → render sidebar & orders content
  return (
    <>
      <SidebarDemo />
    </>
  );
}
