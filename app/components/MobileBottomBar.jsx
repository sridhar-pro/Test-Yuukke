"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, Gift, ShoppingBag, Tag, LogOut } from "lucide-react";
import { useSession } from "../context/SessionContext";

const MobileBottomBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, handleLogout } = useSession();

  // ❌ Hide on specific route(s)
  const hiddenRoutes = ["/odop-registration"];
  if (hiddenRoutes.includes(pathname)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white shadow-[0_-1px_6px_rgba(0,0,0,0.05)] border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center py-3">
        {/* Products */}
        <button
          onClick={() => router.push("/products")}
          className="flex flex-col items-center text-xs text-[#A00300] gap-1"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={2} />
          <span className="text-black">Products</span>
        </button>

        {/* Gifts */}
        <button
          onClick={() => router.push("https://gift.yuukke.com/")}
          className="flex flex-col items-center text-xs text-[#A00300] gap-1"
        >
          <Gift className="w-5 h-5" strokeWidth={2} />
          <span className="text-black">Gifts</span>
        </button>

        {/* Offers */}
        <button
          onClick={() => router.push("/products/offers")}
          className="flex flex-col items-center text-xs text-[#A00300] gap-1"
        >
          <Tag className="w-5 h-5" strokeWidth={2} />
          <span className="text-black">Offers</span>
        </button>

        {/* Orders OR Login */}
        {!isLoggedIn ? (
          <button
            onClick={() => router.push("/login")}
            className="flex flex-col items-center text-xs text-[#A00300] gap-1"
          >
            <User className="w-5 h-5" strokeWidth={2} />
            <span className="text-black">Login</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => router.push("/orders")}
              className="flex flex-col items-center text-xs text-[#A00300] gap-1"
            >
              <User className="w-5 h-5" strokeWidth={2} />
              <span className="text-black">Orders</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center text-xs text-red-600 gap-1"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
              <span className="text-black">Logout</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileBottomBar;
