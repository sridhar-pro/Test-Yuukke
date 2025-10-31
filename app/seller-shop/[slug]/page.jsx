"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/app/utils/AuthContext";
import CartSidebar from "@/app/components/CartSideBar";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import Image from "next/image";

const getImageSrc = (image) => {
  if (!image) return "/fallback.png";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `https://marketplace.yuukke.com/assets/uploads/${image}`;
};

const SellerShopPage = () => {
  const { slug } = useParams();
  const { getValidToken } = useAuth();

  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // 🚦 new state
  const [loadingProductId, setLoadingProductId] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true); // start loading
        const token = await getValidToken();

        const body = {
          filters: {
            gifts_products: "",
            query: "",
            category: "",
            subcategory: "",
            sub_subcategory: "",
            brand: "",
            sorting: "name-asc",
            min_price: "1",
            max_price: "",
            in_stock: "0",
            page: "1",
            sort_by_v: "",
            limit: 24,
            offset: "0",
            warehouses_id: slug,
          },
        };

        const res = await fetch("/api/getProducts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("Failed to fetch shop data");
        const data = await res.json();
        console.log("Seller details:", data);
        // setShopData(data.warehouse || null);

        // 🧪 For testing, force theme_type
        setShopData({
          ...data.warehouse,
          // theme_type: 2,
        });
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } catch (err) {
        console.error("❌ Error fetching shop data:", err);
        setShopData(null);
      } finally {
        setLoading(false); // stop loading
      }
    };

    if (slug) fetchShopData();
  }, [slug, getValidToken]);

  // ✅ Prevent null crash
  const images = shopData
    ? [shopData.slider, shopData.slider2].filter(Boolean)
    : [];

  // 🔁 Auto-slide effect
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  // 🚦 Loader UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // ❌ Shop not found
  if (!shopData) {
    return <p className="p-6">❌ Shop not found</p>;
  }

  // ✅ Use theme colors directly from API
  const palette = {
    theme_color: shopData.theme_color,
    text_color: shopData.text_color,
    secondary_text_color: shopData.secondary_text_color,
    section1_color: shopData.section1_color,
    section1_color2: shopData.section1_color2,
    section2_color: shopData.section2_color,
    section2_color2: shopData.section2_color2,
    section3_color: shopData.section3_color,
    section3_color2: shopData.section3_color2,
  };
  // const palette = {
  //   theme_color: "#f3f4f6", // light gray background for buttons/accents
  //   text_color: "#111827", // almost black text
  //   secondary_text_color: "#6b7280", // gray for secondary text
  //   section1_color: "#ffffff", // white background for hero/category sections
  //   section1_color2: "#f9fafb", // very light gray gradient
  //   section2_color: "#ffffff", // white background for product cards
  //   section2_color2: "#f3f4f6", // light gray gradient
  //   section3_color: "#f9fafb", // light gray for footer
  //   section3_color2: "#e5e7eb", // slightly darker gray gradient
  // };

  // 👉 Condition based on theme_type
  if (shopData.theme_type === 2) {
    return (
      <div
        className="font-odop min-h-screen flex flex-col"
        style={{ backgroundColor: palette.section1_color }}
      >
        {/* 🔹 Hero Section (Responsive Image Display) */}
        {images.length > 0 && (
          <>
            {/* 🖥️ Desktop / Tablet Slider */}
            <header className="hidden md:block relative w-full aspect-[16/4] overflow-hidden rounded-b-3xl shadow-lg">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageSrc(img)}
                  alt={`Slide ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    idx === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </header>

            {/* 📱 Mobile Auto Slider */}
            <div className="block md:hidden w-full relative overflow-hidden rounded-b-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={getImageSrc(img)}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-[120px] object-cover flex-shrink-0"
                  />
                ))}
              </div>

              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`w-2 h-2 rounded-full ${
                      dotIdx === currentIndex ? "bg-white" : "bg-white/40"
                    }`}
                  ></span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 🔹 Categories */}
        <section className="px-6 md:px-16 py-20 rounded-3xl relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 blur-3xl"
            style={{
              background: `radial-gradient(circle at center, ${palette.section1_color} 0%, ${palette.section1_color2} 100%)`,
            }}
          ></div>

          <div className="relative text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-extrabold uppercase mb-3"
              style={{ color: palette.text_color }}
            >
              Shop by Category
            </h2>
            <p
              className="text-base md:text-lg opacity-80"
              style={{ color: palette.secondary_text_color }}
            >
              Discover our finest selection — hand-picked just for you.
            </p>
          </div>

          <div className="relative flex flex-wrap justify-center gap-12 md:gap-16">
            {categories?.map((category, idx) => (
              <div
                key={category.id || idx}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div
                  className="relative w-28 h-28 md:w-40 md:h-40 flex items-center justify-center rounded-full shadow-[0_0_25px_rgba(0,0,0,0.05)] transition-transform duration-500 transform group-hover:-translate-y-2 group-hover:scale-110 overflow-hidden backdrop-blur-md border border-white/30"
                  style={{
                    background: `linear-gradient(135deg, ${palette.section1_color} 0%, ${palette.section1_color2} 100%)`,
                  }}
                >
                  <img
                    src={getImageSrc(category.image)}
                    alt={category.name}
                    className="relative z-10 w-4/5 h-4/5 object-contain rounded-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <p
                  className="mt-5 text-base md:text-xl font-semibold capitalize text-center group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                  style={{ color: palette.text_color }}
                >
                  {category.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 🔹 Products */}
        <section className="px-6 md:px-16 py-14 rounded-t-3xl">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase"
            style={{ color: palette.text_color }}
          >
            Featured Products
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-1 p-4 sm:p-5 md:p-6 flex flex-col items-center text-center border border-white/20 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${palette.section2_color} 0%, ${palette.section2_color2} 100%)`,
                }}
              >
                <img
                  src={getImageSrc(product.image)}
                  alt={product.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 object-contain mb-3 sm:mb-4"
                />

                <h3
                  className="font-semibold text-sm sm:text-base md:text-lg capitalize mb-1 sm:mb-2 leading-snug sm:leading-normal"
                  style={{
                    color: palette.text_color,
                    minHeight: "2.5rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {product.name}
                </h3>

                <p
                  className="text-sm sm:text-base mt-1"
                  style={{ color: palette.secondary_text_color }}
                >
                  ₹{Number(product.price).toFixed(2)}
                </p>

                <button
                  disabled={loadingProductId === product.id}
                  className={`mt-3 sm:mt-4 px-4 sm:px-5 py-2 text-xs sm:text-sm rounded-md transition shadow z-50 w-full sm:w-auto flex items-center justify-center ${
                    loadingProductId === product.id
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                  style={{
                    backgroundColor: palette.theme_color,
                    color: palette.text_color,
                  }}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!product?.id) return;

                    setLoadingProductId(product.id); // disable while processing
                    try {
                      const token = await getValidToken();
                      if (!token) {
                        toast.error("🔐 Login required to add item to cart.");
                        return;
                      }

                      let cartId =
                        localStorage.getItem("cart_id") ||
                        Math.random().toString(36).substring(2, 15) +
                          Math.random().toString(36).substring(2, 15);
                      localStorage.setItem("cart_id", cartId);

                      const cartItem = {
                        id: product.id,
                        name: product.name,
                        qty: 1,
                        price:
                          product.promo_price &&
                          new Date(product.end_date) > new Date()
                            ? Number(product.promo_price)
                            : Number(product.price),
                        image: product.image,
                      };

                      const existingCart = JSON.parse(
                        localStorage.getItem("cart_data") || "[]"
                      );
                      const existingIndex = existingCart.findIndex(
                        (item) => item.id === product.id
                      );

                      const updatedCart =
                        existingIndex >= 0
                          ? existingCart.map((item, i) =>
                              i === existingIndex
                                ? { ...item, qty: item.qty + 1 }
                                : item
                            )
                          : [...existingCart, cartItem];

                      localStorage.setItem(
                        "cart_data",
                        JSON.stringify(updatedCart)
                      );
                      setCartItems(updatedCart);

                      const payload = {
                        selected_country: "IN",
                        product_id: product.id,
                        variant_id: [],
                        qty: 1,
                        cart_id: cartId,
                        historypincode: 600001,
                      };

                      console.log("📤 Sending Add-to-Cart Payload:", payload);

                      const response = await fetch("/api/addcart", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                      });

                      const data = await response.json().catch(() => null);
                      console.log("📦 API Response Data:", data);

                      if (!response.ok) {
                        console.error("🚨 Add-to-cart API failed:", data);
                        toast.error(
                          data?.message || "Failed to add item to cart."
                        );
                        return;
                      }

                      toast.success("🛒 Added to cart!", {
                        position: "top-right",
                        autoClose: 2000,
                      });
                      setIsCartOpen?.(true);
                    } catch (err) {
                      console.error("💥 Add to cart failed:", err);
                      toast.error("Something went wrong!");
                    } finally {
                      setLoadingProductId(null); // re-enable button
                    }
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}

            {/* 🛍️ Cart Sidebar */}
            {isCartOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
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
          </div>
        </section>

        {/* 🔹 About + Contact */}
        <section className="relative px-6 md:px-20 py-24 rounded-t-3xl">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-extrabold uppercase"
              style={{ color: palette.text_color }}
            >
              About {shopData.name}
            </h2>
            <p
              className="mt-4 text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: palette.secondary_text_color }}
            >
              A closer look at our journey, passion, and purpose.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            <div className="flex flex-col items-center text-center max-w-sm space-y-4">
              <img
                src={getImageSrc(shopData.store_logo)}
                alt={shopData.name}
                className="w-32 h-32 object-contain rounded-xl shadow-lg border-2 border-white/30 bg-white/60"
              />
              <h3
                className="text-2xl font-semibold capitalize"
                style={{ color: palette.text_color }}
              >
                {shopData.name}
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: palette.secondary_text_color }}
              >
                {shopData.tagline ||
                  "We bring ideas to life with purpose and precision."}
              </p>
            </div>

            <div
              className="max-w-2xl backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 p-10 space-y-4"
              style={{
                background: `linear-gradient(135deg, ${palette.section3_color} 0%, ${palette.section3_color2} 100%)`,
                color: palette.text_color,
              }}
            >
              <div
                className="prose prose-lg text-justify"
                style={{ color: palette.text_color }}
                dangerouslySetInnerHTML={{
                  __html:
                    (shopData.about_us &&
                      shopData.about_us
                        .match(/<p>(.*?)<\/p>/s)?.[1]
                        .split("<br")[0]
                        .trim()) ||
                    "Our brand stands for innovation, reliability, and craftsmanship that make everyday life better.",
                }}
              ></div>

              <div className="w-full h-px bg-white/30"></div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Mail size={22} />
                  <span>{shopData.email}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Phone size={22} />
                  <span>{shopData.phone}</span>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin size={22} className="mt-1" />
                  <span
                    dangerouslySetInnerHTML={{ __html: shopData.address }}
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ✅ Default Theme (theme_type = 1)
  return (
    <div
      className="font-odop min-h-screen flex flex-col"
      style={{ backgroundColor: palette.theme_color }}
    >
      {/* 🌟 Hero Section */}
      {images.length > 0 && (
        <header className="relative w-full h-full flex overflow-hidden shadow-md">
          {/* 🖼️ Left: Slider */}
          <div className="relative w-full md:w-3/4 h-full  overflow-hidden">
            <div
              className="flex transition-transform duration-1000 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((img, index) => (
                <img
                  key={index}
                  src={getImageSrc(img)}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-contain flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* 🏷️ Right: Logo + Text */}
          <div
            className="w-1/4 h-auto hidden md:flex flex-col items-center justify-center text-center p-6"
            style={{
              backgroundColor: palette.section1_color,
              color: palette.text_color,
            }}
          >
            <img
              src={getImageSrc(shopData.store_logo)}
              alt={shopData.name}
              className="h-20 md:h-40 mb-4 rounded-lg shadow bg-white p-2"
            />
            <h1
              className="text-2xl md:text-3xl font-bold capitalize"
              style={{ color: palette.text_color }}
            >
              {shopData.name}
            </h1>
          </div>
        </header>
      )}
      {/* 🌟 Shop by Category */}
      <section
        className="px-6 md:px-16 py-16 rounded-3xl"
        style={{
          background: `linear-gradient(135deg, ${palette.section1_color} 0%, ${palette.section1_color2} 100%)`,
        }}
      >
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 uppercase"
            style={{ color: palette.text_color }}
          >
            Shop by Category
          </h2>
          <p
            className="text-base md:text-lg"
            style={{ color: palette.secondary_text_color }}
          >
            Explore your favorite categories — curated just for you.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-10 md:gap-16">
          {categories?.map((category, idx) => (
            <motion.div
              key={idx + category.slug}
              className="group flex-shrink-0 w-[110px] sm:w-[130px] md:w-[160px] flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Link
                href={`/products/category/${category.slug}`}
                aria-label={`Explore ${category.name} category`}
                className="flex flex-col items-center w-full"
              >
                <div className="relative w-28 h-28 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-xl bg-white p-2 shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3">
                  {/* Badge section now uses category name */}
                  <div className="absolute bottom-0 left-3 md:left-4 w-full z-10 flex justify-center">
                    <div className="relative w-[120px] md:w-[180px] h-[32px] md:h-[40px] flex items-center justify-center">
                      {/* Badge background image */}
                      <Image
                        src="/badge.png"
                        alt="Category badge"
                        fill
                        className="object-contain pointer-events-none select-none"
                        priority={true}
                      />

                      {/* Text overlay (Category Name instead of offer label) */}
                      <span className="absolute text-white text-xs md:text-[13px] mt-1 font-bold uppercase font-odop tracking-wide text-center">
                        {category.name}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-full rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center p-2">
                    <motion.div
                      className="relative w-20 h-20 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-10"
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Image
                        src={getImageSrc(category.image)}
                        alt={`Shop ${category.name}`}
                        fill
                        className="object-contain drop-shadow-md"
                        quality={100}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* <div className="h-[3.5rem] sm:h-[3.75rem] flex items-center justify-center text-center mt-2 md:mt-0">
                <h3 className="text-sm sm:text-base font-bold text-gray-800 hover:text-[var(--primary-color)] relative inline-block leading-snug capitalize">
                  {category.name}
                </h3>
              </div> */}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🌟 Featured Products */}
      <section className="px-6 md:px-16 py-14 rounded-3xl">
        <h2
          className="text-2xl md:text-3xl font-bold text-left mb-12 uppercase"
          style={{ color: palette.text_color }}
        >
          Featured Picks
        </h2>

        <div className="grid lg:grid-cols-2 gap-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col sm:flex-row items-center rounded-3xl overflow-hidden shadow-lg transition hover:-translate-y-1 duration-300"
              style={{
                background: `linear-gradient(135deg, ${palette.section2_color} 0%, ${palette.section2_color2} 100%)`,
              }}
            >
              {/* 🖼️ Image (Clickable) */}
              <div className="flex-1 flex justify-center items-center p-6">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={(e) => e.stopPropagation()} // prevent weird bubbling
                  className="flex justify-center items-center"
                >
                  <img
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    className="w-48 h-48 object-contain group-hover:scale-105 transition duration-300 cursor-pointer"
                  />
                </Link>
              </div>

              {/* 📝 Product Info + Button */}
              <div className="flex-1 p-6 text-center sm:text-left">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3
                    className="text-base sm:text-lg md:text-xl font-bold capitalize group-hover:text-pink-500 transition-colors duration-300 cursor-pointer clamp-2"
                    style={{ color: palette.text_color }}
                  >
                    {product.name}
                  </h3>
                </Link>

                <p
                  className="mt-2 mb-4"
                  style={{ color: palette.secondary_text_color }}
                >
                  ₹{Number(product.price).toFixed(2)}
                </p>

                {/* 🛒 Add to Cart Button (Disabled During API Call) */}
                <button
                  disabled={loadingProductId === product.id}
                  className={`relative px-6 py-2 text-sm rounded-md transition shadow z-50 flex items-center justify-center gap-2 ${
                    loadingProductId === product.id
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                  style={{
                    backgroundColor: palette.theme_color,
                    color: palette.text_color,
                  }}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!product?.id) return;

                    setLoadingProductId(product.id); // disable button while adding
                    try {
                      const token = await getValidToken();
                      if (!token) {
                        toast.error("🔐 Login required to add item to cart.");
                        return;
                      }

                      // 🧠 Create or get cart ID
                      let cartId =
                        localStorage.getItem("cart_id") ||
                        Math.random().toString(36).substring(2, 15) +
                          Math.random().toString(36).substring(2, 15);
                      localStorage.setItem("cart_id", cartId);

                      const cartItem = {
                        id: product.id,
                        name: product.name,
                        qty: 1,
                        price:
                          product.promo_price &&
                          new Date(product.end_date) > new Date()
                            ? Number(product.promo_price)
                            : Number(product.price),
                        image: product.image,
                      };

                      const existingCart = JSON.parse(
                        localStorage.getItem("cart_data") || "[]"
                      );
                      const existingIndex = existingCart.findIndex(
                        (item) => item.id === product.id
                      );

                      const updatedCart =
                        existingIndex >= 0
                          ? existingCart.map((item, i) =>
                              i === existingIndex
                                ? { ...item, qty: item.qty + 1 }
                                : item
                            )
                          : [...existingCart, cartItem];

                      localStorage.setItem(
                        "cart_data",
                        JSON.stringify(updatedCart)
                      );
                      setCartItems(updatedCart);

                      const payload = {
                        selected_country: "IN",
                        product_id: product.id,
                        variant_id: [],
                        qty: 1,
                        cart_id: cartId,
                        historypincode: 600001,
                      };

                      const response = await fetch("/api/addcart", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                      });

                      const data = await response.json().catch(() => null);

                      if (!response.ok) {
                        console.error("🚨 Add-to-cart API failed:", data);
                        toast.error(
                          data?.message || "Failed to add item to cart."
                        );
                        return;
                      }

                      toast.success("🛒 Added to cart!", {
                        position: "top-right",
                        autoClose: 2000,
                      });
                      setIsCartOpen?.(true);
                    } catch (err) {
                      console.error("💥 Add to cart failed:", err);
                      toast.error("Something went wrong!");
                    } finally {
                      setLoadingProductId(null); // re-enable button
                    }
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
          {/* 🛍️ Cart Sidebar */}
          {isCartOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
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
        </div>
      </section>

      {/* 🌟 Footer: About + Contact */}
      <footer
        className="px-6 md:px-16 py-12 rounded-t-3xl"
        style={{
          background: `linear-gradient(135deg, ${palette.section3_color} 0%, ${palette.section3_color2} 100%)`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* About */}
          <div className="flex-1 max-w-lg">
            <h2
              className="text-2xl font-bold mb-4 uppercase"
              style={{ color: palette.text_color }}
            >
              About {shopData.name}
            </h2>
            <div
              className="prose prose-lg max-w-none text-justify"
              style={{ color: palette.text_color }}
              dangerouslySetInnerHTML={{
                __html:
                  (shopData.about_us &&
                    shopData.about_us
                      .match(/<p>(.*?)<\/p>/s)?.[1]
                      .split("<br")[0]
                      .trim()) ||
                  "Our brand stands for innovation, reliability, and craftsmanship that make everyday life better.",
              }}
            ></div>
          </div>

          {/* Contact */}
          <div className="flex flex-col justify-center space-y-3">
            <h2
              className="text-2xl font-bold mb-4 uppercase"
              style={{ color: palette.text_color }}
            >
              Contact {shopData.name}
            </h2>
            <p
              className="flex items-center gap-3"
              style={{ color: palette.text_color }}
            >
              <Mail size={18} /> {shopData.email}
            </p>
            <p
              className="flex items-center gap-3"
              style={{ color: palette.text_color }}
            >
              <Phone size={18} /> {shopData.phone}
            </p>
            <p
              className="flex items-center gap-3"
              style={{ color: palette.text_color }}
            >
              <MapPin size={18} />{" "}
              <span dangerouslySetInnerHTML={{ __html: shopData.address }} />
            </p>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center">
            <img
              src={getImageSrc(shopData.store_logo)}
              alt={shopData.name}
              className="h-20 md:h-28 mb-4 rounded-lg shadow bg-white p-2"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SellerShopPage;
