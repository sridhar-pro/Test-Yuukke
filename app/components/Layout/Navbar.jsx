"use client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "../SearchBar";
import { useRouter } from "next/navigation";
import { User, Heart, ShoppingCart } from "lucide-react";
import CartSidebar from "../CartSideBar";
import { useAuth } from "@/app/utils/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import LogoutButton from "../Logout";
import { useSession } from "@/app/context/SessionContext";
import { usePathname } from "next/navigation";
import { fetchWithAuthGlobal } from "@/app/utils/fetchWithAuth";

const messages = [
  "Yuukke Anniversary Sale – Enjoy 30% OFF Sitewide • Handcrafted • Eco‑Friendly • Gift‑Ready • Limited Time Only – Shop Now!",
  "Enjoy free shipping on orders above Rs. 700!",
];

export default function Navbar() {
  const { t } = useTranslation();

  const pathname = usePathname();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isOdopOpen, setIsOdopOpen] = useState(false);

  const { getValidToken, isAuthReady } = useAuth();
  const { isLoggedIn } = useSession();
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [productCategories, setProductCategories] = useState([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const toggleCart = () => {
    const storedCart = localStorage.getItem("cart_data");
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      const cartString = JSON.stringify(cartItems);
      const newCartString = JSON.stringify(parsed);

      if (cartString !== newCartString) {
        setCartItems(parsed);
      }
    }

    setIsCartOpen((prev) => !prev);
  };

  const router = useRouter();

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
        setIsProductsOpen(false);
        setIsOdopOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/homeCategory");

        if (!res.ok) {
          const errText = await res.text();
          console.error(`❌ HTTP ${res.status}:`, errText);
          return;
        }

        const data = await res.json();
        if (!data) return;

        const mapped = data.map((cat) => ({
          name: cat.name,
          image: `https://marketplace.yuukke.com/assets/uploads/thumbs/${cat.image}`,
          slug: cat.slug,
          subcategories: cat.subcategories || [],
        }));

        setProductCategories(mapped);
      } catch (error) {
        console.error("❌ Error processing categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Marquee navigation handlers
  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % messages.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Marquee */}
      <div
        className="bg-black text-white text-[10px] md:text-sm lg:text-base h-16 md:h-10 flex items-center justify-center  relative overflow-hidden"
        translate="no"
      >
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          className="absolute left-4 bg-gray-200 text-black w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        {/* Message */}
        <div className="relative w-full max-w-[300px] md:max-w-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ x: direction === 1 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute text-center px-4"
            >
              {messages[index]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-4 bg-gray-200 text-black w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
        >
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#f9f9f959] shadow-sm px-0 lg:px-6 py-3 top-0 z-[100]">
        <div className="px-3 flex justify-around md:justify-between items-center mt-0 md:mt-5 mb-0 md:mb-5">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-[125px] h-[50px] lg:w-[170px] lg:h-[45px]">
              <Image
                src="/logo.png"
                alt="MyGiftBox Logo"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-4 text-base font-medium text-neutral-500 mr-[0rem] mt-2 tracking-wider">
            {/* Products Dropdown */}
            <div className="flex items-center space-x-8">
              {/* Products Dropdown - Updated to use group-hover like ODOP */}
              <div className="relative group">
                <Link
                  href="/products"
                  className="group transition-all flex items-center gap-1 py-2 px-1 font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                >
                  {t("Products")}
                  <ChevronDown className="w-4 h-4 mt-0.5 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div className="absolute left-0 top-full mt-1 w-[42rem] bg-white border border-gray-100 rounded-xl shadow-xl z-[100] p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out ">
                  {productCategories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                      {productCategories.map((category) => (
                        <Link
                          key={category.id || category.slug}
                          href={`/products/category/${category.slug}`}
                          className="group flex flex-col items-center hover:bg-gray-50 rounded-lg p-4 transition-all duration-200"
                        >
                          {/* 🔹 Category Image/Icon */}
                          <div className="w-16 h-16 mb-3 flex items-center justify-center rounded-full bg-gray-100 overflow-hidden">
                            <img
                              src={category.image || "/placeholder.png"}
                              alt={category.name}
                              className="w-12 h-12 object-contain"
                            />
                          </div>

                          {/* 🔹 Category Name */}
                          <span className="text-sm font-medium text-gray-800 group-hover:text-black text-center">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center py-8 space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-100"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-200"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* ODOP Dropdown (unchanged, works well) */}
              <div className="relative group">
                <Link
                  href="#"
                  className="transition-all flex items-center gap-1 py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
                >
                  {t("ODOP")}
                  <ChevronDown className="w-4 h-4 mt-0.5 transition-transform duration-200 group-hover:rotate-180" />
                </Link>
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out px-4 py-3 w-56">
                  <a
                    href="https://marketplace.yuukke.com/odop/uttar-pradesh"
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-sm rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    {t("Uttar Pradesh")}
                  </a>
                  <Link
                    href="/odop-registration"
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-sm rounded-lg transition-all duration-200 flex items-center gap-2 mt-1"
                  >
                    {t("ODOP Registration")}
                  </Link>
                </div>
              </div>

              {/* Offers Link */}
              <Link
                href={{
                  pathname: "/products/offers", // dedicated offers route
                }}
                className="transition-all py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
              >
                {t("Offers")}
              </Link>

              {/* Offers Link */}
              <Link
                href={{
                  pathname: "/products/festival-gifting", // dedicated offers route
                }}
                className="transition-all py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
              >
                {t("Festive Gifting")}
              </Link>

              {/* Gifts Link */}
              <Link
                href="https://gift.yuukke.com/"
                className="transition-all py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
              >
                {t("Gifts")}
              </Link>

              {/* Tracking Link */}
              <Link
                href="/track-order"
                className="transition-all py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
              >
                {t("Track Order")}
              </Link>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 ml-3 md:ml-0">
            <div className="hidden md:flex space-x-6">
              <SearchBar />

              {/* Profile/Login */}

              <div className="relative" ref={dropdownRef}>
                {!isLoggedIn ? (
                  <Link
                    href={
                      pathname && pathname !== "/login"
                        ? `/login?from=${encodeURIComponent(pathname)}`
                        : "/login"
                    }
                    aria-label="Profile"
                    className="rounded-full transition flex items-center justify-center w-full h-full"
                  >
                    <User className="w-5 h-5 text-black cursor-pointer" />
                  </Link>
                ) : (
                  <div className="relative flex items-center gap-2">
                    {/* Regular Profile Icon */}
                    <div className="relative">
                      <button
                        onClick={() => setOpen((prev) => !prev)}
                        className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shadow-md hover:bg-gray-300 transition"
                      >
                        <User className="w-5 h-5 text-gray-600" />
                      </button>

                      {open && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-50">
                          <Link
                            href="/orders"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
                            onClick={() => setOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <div className="border-t my-1" />
                          <div className="px-0 py-2 hover:bg-gray-100 transition">
                            <LogoutButton />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Dashboard Icon for group_id 4 */}
                    {Number(localStorage.getItem("group_id")) === 4 && (
                      <button
                        onClick={() => {
                          const token = localStorage.getItem("access_token");
                          if (token) {
                            window.location.href = `https://marketplace.yuukke.com/Oauth/tLogin/${token}`;
                          } else {
                            alert("Access token missing. Please login again.");
                          }
                        }}
                        aria-label="Dashboard"
                        className="w-9 h-9 rounded-full bg-[#a00300] flex items-center justify-center shadow-md hover:bg-red-900 transition"
                      >
                        <Settings className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 🌐 Language Switcher (Lucide Globe) */}
              <LanguageSwitcher />

              {/* Wishlist */}
              <a
                href={!isLoggedIn ? "/login" : "/orders?tab=Wishlist"}
                aria-label="Favorites"
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Heart className="w-5 h-5 text-black" />
              </a>

              {/* Cart */}
              <button
                aria-label="Cart"
                className="p-2 hover:bg-gray-100 rounded-full transition relative"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-5 h-5 text-black cursor-pointer" />
                {/* {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.qty, 0)}
                  </span>
                )} */}
              </button>

              <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                setCartItems={setCartItems}
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2 px-2 py-1.5">
              {/* ✅ Search bar takes flexible width */}
              <div className="flex-1">
                <SearchBar />
              </div>

              {/* ✅ Language Switcher */}
              <div className="flex-shrink-0">
                <LanguageSwitcher />
              </div>

              {/* ✅ Cart Icon */}
              <button
                aria-label="Cart"
                className="p-2 hover:bg-gray-100 rounded-full transition relative"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-4 h-4 text-black" />
                {/* {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.qty, 0)}
                  </span>
                )} */}
              </button>

              {/* ✅ Cart Sidebar */}
              {isCartOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsCartOpen(false)}
                  />
                  <CartSidebar
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    cartItems={cartItems}
                    setCartItems={setCartItems}
                  />
                </>
              )}

              {/* ✅ Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-900" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden mt-4 px-4 space-y-2 text-lg text-gray-700"
          >
            <div className="block py-1">
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="w-full text-left hover:text-black transition"
              >
                {t("Products")}
                {isProductsOpen ? "▲" : "▼"}
              </button>
              {isProductsOpen && (
                <div className="ml-4 mt-2 space-y-0 text-gray-600">
                  {productCategories.map((category) => (
                    <Link
                      key={category.id || category.slug}
                      href={`/products/category/${category.slug}`}
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-md rounded"
                      onClick={() => {
                        setIsProductsOpen(false);
                        setMobileMenuOpen(false); // Add this to close the entire menu
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="block py-1">
              <button
                onClick={() => setIsOdopOpen(!isOdopOpen)}
                className="w-full text-left hover:text-black transition"
              >
                {t("ODOP")}
                {isOdopOpen ? "▲" : "▼"}
              </button>
              {isOdopOpen && (
                <div className="ml-4 mt-2 space-y-1 text-gray-600">
                  <Link
                    href="/odop-registration"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-md rounded-lg transition-all duration-200 flex items-center gap-2 mt-1"
                  >
                    {t("ODOP Registration")}
                  </Link>
                  <a
                    href="https://marketplace.yuukke.com/odop/uttar-pradesh"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-md rounded"
                  >
                    {t("Uttar Pradesh")}
                  </a>
                </div>
              )}
            </div>

            {/* Offers Link */}
            <Link
              href={{
                pathname: "/products/offers", // dedicated offers route
              }}
              className="block py-1 hover:text-black transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Offers")}
            </Link>

            {/* Best-sellers Link */}
            <Link
              href={{
                pathname: "/products/festival-gifting", // dedicated offers route
              }}
              className="block py-1 hover:text-black transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Festive Gifting")}
            </Link>

            <Link
              href="https://gift.yuukke.com/"
              className="block py-1 hover:text-black transition"
              onClick={() => setMobileMenuOpen(false)} // Add this
            >
              {t("Gifts")}
            </Link>

            {/* Tracking Link */}
            <Link
              href="/track-order"
              className="transition-all py-2 px-1 font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Track Order")}
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
