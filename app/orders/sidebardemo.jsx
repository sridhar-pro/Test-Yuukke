"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconHeart,
  IconMapPin,
  IconMessage,
  IconUser,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Package } from "lucide-react";
import { useSession } from "../context/SessionContext";
import { useSearchParams } from "next/navigation";
import MyOrders from "./myOrders";
import Addresses from "./Addresses";
import Wishlist from "./Wishlist";
import EnquiryDetails from "./EnquiryDetails";
import Profile from "./Profile"; // ✅ New import

export function SidebarDemo() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  // 👇 Pick tab from URL or fallback to "MyOrders"
  const initialTab = searchParams.get("tab") || "MyOrders";
  const [activePage, setActivePage] = useState(initialTab);

  const { handleLogout } = useSession();

  // ✅ Sidebar Links with active indicator styles
  const links = [
    {
      label: "My Orders",
      onClick: () => setActivePage("MyOrders"),
      isActive: activePage === "MyOrders",
      icon: (
        <IconBrandTabler
          className={`h-5 w-5 shrink-0 ${
            activePage === "MyOrders" ? "text-[#a00300]" : "text-neutral-700"
          }`}
        />
      ),
    },
    // {
    //   label: "Profile",
    //   onClick: () => setActivePage("Profile"),
    //   isActive: activePage === "Profile",
    //   icon: (
    //     <IconUser
    //       className={`h-5 w-5 shrink-0 ${
    //         activePage === "Profile" ? "text-[#a00300]" : "text-neutral-700"
    //       }`}
    //     />
    //   ),
    // },
    {
      label: "Enquiries",
      onClick: () => setActivePage("Enquiries"),
      isActive: activePage === "Enquiries",
      icon: (
        <IconMessage
          className={`h-5 w-5 shrink-0 ${
            activePage === "Enquiries" ? "text-[#a00300]" : "text-neutral-700"
          }`}
        />
      ),
    },
    {
      label: "Addresses",
      onClick: () => setActivePage("Addresses"),
      isActive: activePage === "Addresses",
      icon: (
        <IconMapPin
          className={`h-5 w-5 shrink-0 ${
            activePage === "Addresses" ? "text-[#a00300]" : "text-neutral-700 "
          }
          }`}
        />
      ),
    },
    {
      label: "Wishlist",
      onClick: () => setActivePage("Wishlist"),
      isActive: activePage === "Wishlist",
      icon: (
        <IconHeart
          className={`h-5 w-5 shrink-0 ${
            activePage === "Wishlist" ? "text-[#a00300]" : "text-neutral-700"
          }`}
        />
      ),
    },
    {
      label: "Logout",
      icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 " />,
      onClick: () => {
        handleLogout();
      },
    },
  ];

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row ",
        "min-h-screen h-auto font-odop"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    link.onClick();
                    if (window.innerWidth < 768) setOpen(false); // close only on mobile
                  }}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    link.isActive
                      ? "bg-red-100 text-black font-medium"
                      : "hover:bg-gray-200"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </div>
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      {/* Conditional Rendering */}

      {activePage === "MyOrders" && <MyOrders />}
      {/* {activePage === "Profile" && <Profile />} */}
      {activePage === "Enquiries" && <EnquiryDetails />}
      {activePage === "Addresses" && <Addresses />}
      {activePage === "Wishlist" && <Wishlist />}
    </div>
  );
}

// Logo Components
export const Logo = () => (
  <a
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <Package className="h-8 w-8" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 font-medium text-xl whitespace-pre text-black"
    >
      Dashboard
    </motion.span>
  </a>
);

export const LogoIcon = () => (
  <a
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <Package className="h-8 w-8" />
  </a>
);
