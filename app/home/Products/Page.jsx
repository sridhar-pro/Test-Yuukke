"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  X,
  Star,
  ShoppingCart,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";
import { useAuth } from "@/app/utils/AuthContext";
import CartSidebar from "../../components/CartSideBar";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";
import WishlistButton from "@/app/components/WishlistButton";
import { fetchWithAuthGlobal } from "@/app/utils/fetchWithAuth";

const FeaturedProducts = () => {
  const { t } = useTranslation();

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const [giftProducts, setGiftProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [festivalProducts, setFestivalProducts] = useState([]);
  const [wellnessProducts, setWellnessProducts] = useState([]);
  const [corporateProducts, setCorporateProducts] = useState([]);
  const [returnProducts, setReturnProducts] = useState([]);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const modalRef = useRef(null);

  const [homePageTitles, setHomePageTitles] = useState({});

  const hasFetched = useRef(false); // Add this ref

  const [quantity, setQuantity] = useState(1);

  const [isAdding, setIsAdding] = useState(false);

  const [loading, setLoading] = useState({
    gift: true,
    arrival: true,
    featured: true,
    festival: true,
    wellness: true,
    corporate: true,
    return: true,
  });

  // Get values from API (string → number conversion)
  const minOrderQty = Number(quickViewProduct?.minimum_order_qty) || 1;
  const minOrderLimit = Number(quickViewProduct?.minimum_order_limit) || 1;

  useEffect(() => {
    setMainImage(null); // Reset main image
  }, [quickViewProduct]);

  const [isInCart, setIsInCart] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(1); // Temporary quantity before update
  const [isUpdating, setIsUpdating] = useState(false);

  const getImageSrcThumbs = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/thumbs/${image}`;
  };

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    if (image.startsWith("http") || image.startsWith("/")) return image;

    const originalUrl = `https://marketplace.yuukke.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const getCartItems = () => {
    const cartData = localStorage.getItem("cart_data");
    return cartData ? JSON.parse(cartData) : [];
  };

  const { getValidToken, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady || hasFetched.current) return;

    const fetchAllData = async () => {
      hasFetched.current = true;

      const fetchers = [
        { key: "gift", url: "/api/giftproducts", setter: setGiftProducts },
        {
          key: "arrival",
          url: "/api/newarrival",
          setter: setNewArrivalProducts,
        },
        {
          key: "featured",
          url: "/api/featuredproducts",
          setter: setFeaturedProducts,
        },
        {
          key: "festival",
          url: "/api/festivalproducts",
          setter: setFestivalProducts,
        },
        {
          key: "wellness",
          url: "/api/wellnessproducts",
          setter: setWellnessProducts,
        },
        {
          key: "corporate",
          url: "/api/corporategiftproducts",
          setter: setCorporateProducts,
        },
        {
          key: "return",
          url: "/api/returngiftproducts",
          setter: setReturnProducts,
        },
      ];

      const TTL = 2 * 60 * 60 * 1000; // 2 hours

      const fetchWithCacheAndLogs = async (key, url, setter) => {
        setLoading((prev) => ({ ...prev, [key]: true }));

        const cacheKey = `${key}_cache`;

        try {
          const cachedStr = localStorage.getItem(cacheKey);
          if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            if (cached.timestamp && Date.now() - cached.timestamp < TTL) {
              setter(Array.isArray(cached.data) ? cached.data : []);

              const title = cached.data[0]?.homePageTitle || null;
              if (title)
                setHomePageTitles((prev) => ({ ...prev, [key]: title }));

              setLoading((prev) => ({ ...prev, [key]: false }));
              return;
            }
          }

          const data = await fetchWithAuthGlobal(url, {}, getValidToken);

          const validData = Array.isArray(data) ? data : [];
          setter(validData);

          const title = validData[0]?.homePageTitle || null;
          if (title) setHomePageTitles((prev) => ({ ...prev, [key]: title }));

          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data: validData, timestamp: Date.now() })
          );
        } catch (err) {
          console.error(`[${key}] Fetch error:`, err.message);
          setError(err.message);

          const cachedStr = localStorage.getItem(cacheKey);
          if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            setter(Array.isArray(cached.data) ? cached.data : []);

            const title = cached.data[0]?.homePageTitle || null;
            if (title) setHomePageTitles((prev) => ({ ...prev, [key]: title }));
          }
        } finally {
          setLoading((prev) => ({ ...prev, [key]: false }));
        }
      };

      await Promise.all(
        fetchers.map(({ key, url, setter }) =>
          fetchWithCacheAndLogs(key, url, setter)
        )
      );
    };

    const timer = setTimeout(() => {
      fetchAllData();
    }, 300);

    return () => clearTimeout(timer);
  }, [getValidToken, isAuthReady]);

  useEffect(() => {
    if (quickViewProduct) {
      setMainImage(quickViewProduct.images?.[0] || quickViewProduct.image);
    }
  }, [quickViewProduct]);

  // If API values are null/undefined/0 → fallback to defaults
  const MIN_LIMIT = minOrderQty > 0 ? minOrderQty : 1;

  // Max limit is product stock or 10, whichever is smaller
  // Max limit logic
  const MAX_LIMIT =
    minOrderQty > 1
      ? Math.min(quickViewProduct?.quantity || 100, 30) // If MOQ → cap at 30
      : Math.min(quickViewProduct?.quantity || 100, 10); // Else → cap at 10

  // Initialize quantity respecting min order rules
  useEffect(() => {
    setQuantity(MIN_LIMIT);
  }, [MIN_LIMIT]);

  // Quantity controllers
  const increaseQty = () =>
    setQuantity((prev) => Math.min(prev + 1, MAX_LIMIT));

  const decreaseQty = () =>
    setQuantity((prev) => (prev > MIN_LIMIT ? prev - 1 : MIN_LIMIT));

  const toggleWishlist = (slug) => {
    setWishlist((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // faster stagger
        delayChildren: 0.1, // shorter initial delay
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35, // quicker fade + move
        ease: "easeOut",
      },
    },
  };

  const [selectedVariants, setSelectedVariants] = useState({});

  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  useEffect(() => {
    if (!quickViewProduct) return;

    if (
      Array.isArray(quickViewProduct.variants) &&
      quickViewProduct.variants.length > 0 &&
      !selectedVariants[quickViewProduct.id]
    ) {
      setSelectedVariants((prev) => ({
        ...prev,
        [quickViewProduct.id]: quickViewProduct.variants[0], // ✅ 0th variant
      }));
    }
  }, [quickViewProduct]);

  const renderTitleSection = (title, btnLink = "/products") => {
    return (
      <motion.div
        className="relative mb-20 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title with underline image */}
        <motion.h3
          className="relative text-center text-[28px] md:text-[30px] font-semibold text-[#A00300] uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {t(title)}
        </motion.h3>

        {/* View All link */}
        <motion.a
          href={btnLink}
          className="mt-2 text-[12px]  font-medium text-[#000d45] hover:text-[var(--primary-color)] underline underline-offset-4 transition-all duration-300"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {t("View All Products →")}
        </motion.a>
      </motion.div>
    );
  };

  const renderProductCards = (products) => {
    const renderMobileQuickViewButton = (product) => {
      return (
        <div className="md:hidden absolute bottom-3 right-3 z-50">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-[#A00300] transition-colors group/mobile-quickview"
          >
            <Eye className="text-gray-600 w-5 h-5 group-hover/mobile-quickview:text-white" />
          </button>
        </div>
      );
    };

    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      >
        {products.map((product) => {
          const now = new Date();
          const promoEndDate = product.end_date
            ? new Date(product.end_date)
            : null;
          const isPromoActive =
            promoEndDate && promoEndDate.getTime() > now.getTime();

          const hasPromo =
            isPromoActive &&
            product.promotion === "1" &&
            product.promo_price &&
            product.promo_price > 0;

          const promoPrice =
            hasPromo && product.promo_price
              ? Number(product.promo_price)
              : product.sale_price
              ? Number(product.sale_price)
              : Number(product.price);

          const originalPrice = Number(product.price);
          const discountPercent = hasPromo
            ? Math.round(((originalPrice - promoPrice) / originalPrice) * 100)
            : 0;

          const showPromoTag = product.promo_tag;
          const review = Number(product.review);

          // Handle quantity check including negative values
          const quantityStr = product.quantity?.toString() || "";
          const quantityNum = parseFloat(quantityStr);
          const isOutOfStock =
            quantityStr === "0" ||
            quantityStr === "" ||
            isNaN(quantityNum) ||
            quantityNum <= 0;

          // ✅ Extract product_variants safely
          const variants = Array.isArray(product.product_variants)
            ? product.product_variants.map((variant) => ({
                id: variant.id,
                name: variant.name,
                price: Number(variant.price),
                quantity: Number(variant.quantity),
                image: variant.front_view || null, // ✅ add image extraction safely
              }))
            : [];

          // ✅ Selected variant comes from global state
          const selectedVariant =
            selectedVariants[product.id] ||
            (variants.length > 0 ? variants[0] : null);

          // ✅ Calculate final price (base + variant)
          const variantExtra = selectedVariant ? selectedVariant.price : 0;
          const finalPrice = promoPrice + variantExtra;

          return (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={!isOutOfStock ? { scale: 1.01 } : {}}
              className={`relative group rounded-3xl p-3 md:p-4 flex flex-col h-full ${
                isOutOfStock ? "bg-gray-50 cursor-not-allowed" : "bg-white"
              }`}
            >
              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/10 z-50 rounded-2xl flex items-center justify-center">
                  <span className="bg-[#A00300] text-white text-sm font-bold px-3 py-1 rounded-lg">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Business Type Badges */}
              {product.business_type === "3" && (
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] sm:text-sm font-semibold px-1.5 sm:px-2 py-[2px] sm:py-0.5 rounded-lg shadow-md z-10 border border-[#A00300]/20">
                  {t("Premium")}
                </span>
              )}

              {product.business_type === "2" && (
                <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] sm:text-sm font-semibold px-1.5 sm:px-2 py-[2px] sm:py-0.5 rounded-lg shadow-md z-10 border border-[#A00300]/20">
                  {t("Verified")}
                </span>
              )}

              {/* Wishlist */}
              {!isOutOfStock && (
                <div className="relative group">
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 hover:z-[70] transition-z-index duration-200">
                    <WishlistButton productId={product.id} />
                  </div>
                </div>
              )}

              {/* Product Image */}
              <Link
                href={
                  !isOutOfStock
                    ? `/products/${product.slug || product.id}`
                    : "#"
                }
                passHref
              >
                <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-3 md:mb-4 group">
                  <Image
                    src={getImageSrc(product.image)}
                    alt={product.name || "Image not found!"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className={`object-contain ${
                      isOutOfStock ? "opacity-70" : ""
                    }`}
                  />
                  {/* Hover Image - Show variant image if available, else fallback */}
                  {!isOutOfStock &&
                    (() => {
                      let hoverImage = null;

                      // ✅ If variants exist and first one has an image, use it
                      if (variants.length > 0 && variants[0]?.image) {
                        hoverImage = variants[0].image; // You can change to selectedVariant?.image too
                      } else {
                        // ✅ Fallback to existing product.image_g parsing
                        const matches =
                          product.image_g?.match(/src="([^"]+)"/g) || [];
                        const urls = matches.map((src) =>
                          src.replace(/src="|"/g, "")
                        );
                        hoverImage = urls[1] || null;
                      }

                      return (
                        hoverImage && (
                          <Image
                            src={getImageSrc(hoverImage)}
                            alt="Hover preview"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 object-contain"
                          />
                        )
                      );
                    })()}
                </div>
              </Link>

              {!isOutOfStock && (
                <>
                  {/* Desktop - Eye appears on hover */}
                  <div className="hidden md:block absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // console.log("Quick View Product Data:", product);
                          setQuickViewProduct(product);
                          setQuantity(1);
                        }}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition hover:bg-[#A00300] group/quickview cursor-pointer pointer-events-auto"
                      >
                        <Eye className="text-gray-700 w-6 h-6 group-hover/quickview:text-white transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile - Fixed eye icon */}
                  <div className="md:hidden absolute bottom-[7rem] right-3 z-50">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuickViewProduct(product);
                        setQuantity(1);
                      }}
                      className="min-w-[40px] min-h-[40px] w-10 h-10 bg-[#A00300] cursor-pointer rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
                      aria-label="Quick View"
                    >
                      <Eye className="text-white w-5 h-5" />
                    </button>
                  </div>
                </>
              )}

              {/* Product Info */}
              <div className="flex flex-col h-full">
                {/* Product Name + Category */}
                <div className="min-h-[50px] md:min-h-[60px]">
                  {showPromoTag && (
                    <div className="mb-1 md:mb-2">
                      <span className="inline-flex items-center bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-[2px] md:py-1 rounded-tl-lg rounded-br-lg shadow-md">
                        {product.promo_tag}
                      </span>
                    </div>
                  )}
                  {/* ⭐ BOGO Value Badge with Flash */}
                  {product.bogo_value && (
                    <div className="relative inline-block mt-2 mb-2 font-odop">
                      {/* Badge */}
                      <span className="bogo-badge inline-flex items-center gap-1 bg-gradient-to-r from-black to-gray-900 text-white text-md font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                        {product.bogo_value}
                      </span>

                      {/* Flash overlay */}
                      <span className="bogo-flash absolute top-0 left-0 w-full h-full rounded-tr-lg rounded-bl-lg"></span>
                    </div>
                  )}
                  <Link href={`/products/${product.slug}`} passHref>
                    <h3
                      className={`text-xs md:text-base font-semibold line-clamp-2 mb-0.5 md:mb-1 capitalize ${
                        isOutOfStock
                          ? "text-gray-500"
                          : "text-gray-950 hover:text-[#A00300]"
                      } cursor-pointer transition-colors`}
                    >
                      {product.name}
                    </h3>
                  </Link>

                  {/* Product Ratings - Only show if review data exists */}
                  {review > 0 && (
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 md:w-4 md:h-4 ${
                              i < Math.floor(review)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] md:text-xs text-gray-600 ml-1">
                        ({Number(review.toFixed(1))})
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-0">
                  {/* Price Display */}
                  <div className="space-y-1 mt-1">
                    {hasPromo ? (
                      <>
                        <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                          <p
                            className={`text-sm md:text-lg font-bold ${
                              isOutOfStock ? "text-gray-500" : "text-[#A00300]"
                            }`}
                          >
                            ₹
                            {(
                              Number(product.promo_price) +
                              (selectedVariant?.price || 0)
                            ).toFixed(2)}
                          </p>
                          <p className="text-xs md:text-sm text-gray-400 line-through">
                            ₹
                            {(
                              Number(product.price) +
                              (selectedVariant?.price || 0)
                            ).toFixed(2)}
                          </p>

                          {/* ✅ Variants Dropdown (only if data exists) */}
                          {variants.length > 0 && (
                            <div className="relative inline-block ml-2">
                              <select
                                value={selectedVariant?.id}
                                onChange={(e) => {
                                  const v = variants.find(
                                    (v) => String(v.id) === e.target.value
                                  );
                                  setSelectedVariants((prev) => ({
                                    ...prev,
                                    [product.id]: v,
                                  }));
                                }}
                                className="
        appearance-none
        text-xs md:text-sm
        font-medium
        tracking-wide
        pl-4 pr-10 py-2
        rounded-lg
        border border-gray-300
        bg-white/80 backdrop-blur-sm
        shadow-sm
        text-gray-800
        focus:outline-none
        focus:ring-1 focus:ring-[#A00300] focus:border-[#A00300]
        cursor-pointer
        transition-all duration-200
        hover:border-[#A00300]/60 hover:shadow-md
      "
                              >
                                {variants.map((variant) => (
                                  <option key={variant.id} value={variant.id}>
                                    {variant.name}
                                  </option>
                                ))}
                              </select>

                              {/* ✅ Custom Arrow (right aligned) */}
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg
                                  className="w-4 h-4 text-gray-500 group-hover:text-[#A00300] transition-colors"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Show discount badge only on mobile in next line */}
                        <span className="block md:inline text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg md:ml-2">
                          {Math.round(
                            ((Number(product.price) -
                              Number(product.promo_price)) /
                              Number(product.price)) *
                              100
                          )}
                          {t("% OFF")}
                        </span>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                        <p
                          className={`text-sm md:text-lg font-bold ${
                            isOutOfStock ? "text-gray-500" : "text-gray-950"
                          }`}
                        >
                          ₹
                          {(
                            Number(product.price) +
                            (selectedVariant?.price || 0)
                          ).toFixed(2)}
                        </p>

                        {/* ✅ Modernized Variants Dropdown */}
                        {variants.length > 0 && (
                          <div className="relative inline-block ml-2">
                            <select
                              value={selectedVariant?.id}
                              onChange={(e) => {
                                const v = variants.find(
                                  (v) => String(v.id) === e.target.value
                                );
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [product.id]: v,
                                }));
                              }}
                              className="
        appearance-none
        text-xs md:text-sm
        uppercase font-medium
        pl-4 pr-10 py-2   /* ✅ space reserved for arrow */
        rounded-xl
        border border-gray-300
        shadow-sm
        bg-white
        focus:outline-none
        focus:ring-2 focus:ring-[#A00300] focus:border-[#A00300]
        cursor-pointer
        transition-all duration-200
        hover:border-[#A00300]/70
      "
                            >
                              {variants.map((variant) => (
                                <option key={variant.id} value={variant.id}>
                                  {variant.name}
                                </option>
                              ))}
                            </select>

                            {/* ✅ Arrow perfectly aligned on the right */}
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg
                                className="w-4 h-4 text-gray-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const renderProductCardSkeletons = (count = 6) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

  if (error) {
    return (
      <div className="px-4 md:px-20 py-16 flex justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const allLoaded = Object.values(loading).every((v) => v === false);

  // ✅ Extract variants for quickViewProduct
  const quickVariants = Array.isArray(quickViewProduct?.product_variants)
    ? quickViewProduct.product_variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        quantity: Number(variant.quantity),
      }))
    : [];

  // ✅ Respect global selection or fallback to first
  const selectedQuickVariant =
    selectedVariants[quickViewProduct?.id] ||
    (quickVariants.length > 0 ? quickVariants[0] : null);

  return (
    <div className="px-4 md:px-20 py-20">
      <div className="homepage-wrapper">
        {error && <ErrorBox message={error} />}

        {!allLoaded ? (
          // <>
          //   {Object.entries(homePageTitles).map(([key, title], index) => (
          //     <div key={key} className={index === 0 ? "" : "mt-32"}>
          //       {renderTitleSection(title)}
          //       {renderProductCardSkeletons()}
          //     </div>
          //   ))}
          // </>
          <>
            {renderTitleSection("Bestselling Gift")}
            {renderProductCardSkeletons()}

            <div className="mt-32">
              {renderTitleSection("WorkZen Essentials")}
              {renderProductCardSkeletons()}
            </div>

            <div className="mt-32">
              {renderTitleSection("Nature's Wellness Box")}
              {renderProductCardSkeletons()}
            </div>

            <div className="mt-32">
              {renderTitleSection("Most-Saved Items")}
              {renderProductCardSkeletons()}
            </div>

            <div className="mt-20">
              {renderTitleSection("Bites Of Goodness")}
              {renderProductCardSkeletons()}
            </div>

            <div className="mt-32">
              {renderTitleSection("Corporate Gifts")}
              {renderProductCardSkeletons()}
            </div>

            <div className="mt-32">
              {renderTitleSection("Return Gifts")}
              {renderProductCardSkeletons()}
            </div>
          </>
        ) : (
          <>
            {[
              { products: giftProducts, margin: "" },
              { products: newArrivalProducts, margin: "mt-32" },
              { products: featuredProducts, margin: "mt-32" },
              { products: festivalProducts, margin: "mt-32" },
              { products: wellnessProducts, margin: "mt-20" },
              { products: corporateProducts, margin: "mt-32" },
              { products: returnProducts, margin: "mt-32" },
            ].map(
              ({ products, margin }, index) =>
                products?.length > 0 && (
                  <div key={index} className={margin}>
                    {renderTitleSection(
                      products[0]?.homePageTitle || "You may also like"
                    )}
                    {renderProductCards(products)}
                  </div>
                )
            )}
          </>
        )}
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-4 md:py-0 overflow-y-auto"
            onClick={(e) =>
              e.target === e.currentTarget && setQuickViewProduct(null)
            }
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.95, opacity: 0 }} // Less dramatic initial scale
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{
                duration: 0.25, // Reduced from 0.35
                type: "spring",
                stiffness: 300, // Increased stiffness for snappier motion
                damping: 20,
              }}
              className="relative w-full max-w-5xl rounded-3xl p-4 md:p-10 shadow-2xl bg-white backdrop-blur-xl border border-white/20 my-auto"
              ref={modalRef}
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 right-3 md:top-5 md:right-5 p-1 md:p-2 rounded-full bg-white/70 hover:bg-red-100 transition z-[110] cursor-pointer"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-700 hover:text-red-500" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {/* Image Section (unchanged) */}
                <div className="order-1 md:order-none">
                  <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-none group">
                    {(mainImage || quickViewProduct.image) && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={mainImage || quickViewProduct.image}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={getImageSrc(
                              mainImage || quickViewProduct.image
                            )}
                            alt={quickViewProduct.name || "Image not found!"}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-contain"
                          />
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>

                  {quickViewProduct.image_g && (
                    <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto scrollbar-hide py-2">
                      {(() => {
                        const matches =
                          quickViewProduct.image_g.match(/src="([^"]+)"/g) ||
                          [];
                        const imageUrls = matches.map((src) =>
                          src.replace(/src="|"/g, "")
                        );
                        const allImages = [
                          getImageSrcThumbs(quickViewProduct.image),
                          ...imageUrls,
                        ].filter(
                          (img, index, self) =>
                            img && self.indexOf(img) === index
                        );

                        return allImages.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => setMainImage(getImageSrc(img))} // 👈 Switch to full-size here
                            className={`relative w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm ${
                              getImageSrc(img) === mainImage
                                ? "border-[#A00300] ring-1 ring-[#A00300]"
                                : "border-gray-200"
                            }`}
                          >
                            <Image
                              src={getImageSrcThumbs(img)} // 👈 Use thumbnail version here
                              alt={`thumb-${i}`}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover rounded-md"
                            />
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Content Section with updated buttons */}
                <div className="flex flex-col justify-between order-2 md:order-none">
                  <div>
                    {/* Promo Tag - Only shown if promo_tag exists and end_date is valid */}
                    {quickViewProduct.promo_tag &&
                      quickViewProduct.end_date &&
                      new Date(quickViewProduct.end_date) > new Date() && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-md">
                            {quickViewProduct.promo_tag}
                          </span>
                        </div>
                      )}

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-950 mb-2 capitalize">
                      {quickViewProduct.name}
                    </h2>

                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      {Number(quickViewProduct?.review) > 0 && (
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                          <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs sm:text-sm text-gray-700 font-medium">
                            {Number(quickViewProduct.review).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-3 md:mb-4">
                      {quickViewProduct?.price && (
                        <>
                          {quickViewProduct?.promotion === "1" &&
                          quickViewProduct?.promo_price &&
                          quickViewProduct?.end_date &&
                          new Date(quickViewProduct.end_date) > new Date() ? (
                            <>
                              {/* ✅ Promo Price */}
                              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                                ₹
                                {(
                                  Number(quickViewProduct.promo_price) +
                                  Number(selectedQuickVariant?.price || 0)
                                ).toFixed(2)}
                              </span>

                              {/* ✅ Strikeout Original */}
                              <span className="ml-2 sm:ml-4 text-lg sm:text-xl text-gray-400 line-through">
                                ₹
                                {(
                                  Number(quickViewProduct.price) +
                                  Number(selectedQuickVariant?.price || 0)
                                ).toFixed(2)}
                              </span>

                              {/* ✅ Discount % */}
                              <span className="ml-2 sm:ml-4 text-sm sm:text-base text-red-600 font-semibold">
                                {Math.round(
                                  ((Number(quickViewProduct.price) -
                                    Number(quickViewProduct.promo_price)) /
                                    Number(quickViewProduct.price)) *
                                    100
                                )}
                                {t("% OFF")}
                              </span>
                            </>
                          ) : (
                            // ✅ No promo → just show total
                            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                              ₹
                              {(
                                Number(quickViewProduct.price) +
                                Number(selectedQuickVariant?.price || 0)
                              ).toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* <p className="text-gray-600 leading-relaxed text-xs sm:text-sm mb-4 md:mb-6 line-clamp-3 md:line-clamp-none">
                      {quickViewProduct.description ||
                        "This premium product offers exceptional quality and design."}
                    </p> */}

                    {/* View Full Details Button */}
                    <div className="mt-4">
                      <Link
                        href={`/products/${quickViewProduct.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors rounded-lg shadow-md cursor-pointer"
                      >
                        {t("View Full Details")}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* {button} */}
                  <div className="flex flex-col gap-4 mt-3 md:mt-0">
                    {/* Quantity + Add to Cart Row */}
                    <div className="flex items-center justify-between gap-4 ">
                      {/* Quantity Controller */}
                      <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white/40 backdrop-blur-md shadow-md overflow-hidden h-12 px-1">
                        {/* Decrease Button */}
                        <button
                          onClick={decreaseQty}
                          disabled={quantity <= MIN_LIMIT}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                            quantity <= MIN_LIMIT
                              ? "bg-gray-100 cursor-not-allowed text-gray-400"
                              : "bg-white hover:bg-gray-100 text-gray-600"
                          } active:scale-95`}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        {/* Quantity Display */}
                        <div className="w-10 text-center font-semibold text-gray-800 select-none">
                          {quantity}
                        </div>

                        {/* Increase Button */}
                        <button
                          onClick={increaseQty}
                          disabled={quantity >= MAX_LIMIT}
                          className={`w-10 h-10 flex items-center justify-center relative rounded-lg transition-all duration-200 cursor-pointer ${
                            quantity >= MAX_LIMIT
                              ? "bg-gray-100 cursor-not-allowed text-gray-400"
                              : "bg-white hover:bg-gray-100 text-gray-600"
                          } active:scale-95`}
                          aria-label={
                            quantity >= MAX_LIMIT
                              ? `Max ${MAX_LIMIT} available`
                              : "Increase quantity"
                          }
                        >
                          <Plus className="w-4 h-4" />
                          {quantity >= MAX_LIMIT && (
                            <span className="absolute -bottom-6 text-[10px] text-red-500 font-medium whitespace-nowrap">
                              Max {MAX_LIMIT} available
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Add to Cart with slower left-to-right fill */}
                      <div className="relative w-full flex justify-center">
                        {/* Floating GIF loader */}
                        {isAdding && (
                          <div className="absolute -top-16 z-50">
                            <img
                              src="/add.gif"
                              alt="Loading..."
                              className="w-14 h-14"
                            />
                          </div>
                        )}

                        <button
                          disabled={isAdding}
                          onClick={async () => {
                            if (isAdding) return;
                            setIsAdding(true);
                            await new Promise((resolve) =>
                              setTimeout(resolve, 2500)
                            );

                            try {
                              // Get or create cart ID
                              let cartId = localStorage.getItem("cart_id");
                              if (!cartId) {
                                cartId =
                                  Math.random().toString(36).substring(2, 15) +
                                  Math.random().toString(36).substring(2, 15);
                                localStorage.setItem("cart_id", cartId);
                              }

                              // Backend payload
                              const payload = {
                                selected_country: "IN",
                                product_id: quickViewProduct.id,
                                historypincode: 614624,
                                qty: quantity,
                                cart_id: cartId,
                                variant_id: selectedVariants?.[
                                  quickViewProduct.id
                                ]
                                  ? [selectedVariants[quickViewProduct.id].id]
                                  : [],
                              };

                              // Auth helper
                              const fetchToken = async () => {
                                const res = await fetch("/api/login", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    username: "admin",
                                    password: "Admin@123",
                                  }),
                                });
                                const data = await res.json();
                                if (data.status === "success") {
                                  localStorage.setItem("authToken", data.token);
                                  return data.token;
                                }
                                throw new Error("Authentication failed");
                              };

                              // Fetch token
                              let token = localStorage.getItem("authToken");
                              if (!token) token = await fetchToken();

                              // Call backend to sync cart
                              let response = await fetch("/api/addcart", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(payload),
                              });

                              // Retry on 401
                              if (response.status === 401) {
                                localStorage.removeItem("authToken");
                                const retryToken = await fetchToken();
                                response = await fetch("/api/addcart", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${retryToken}`,
                                  },
                                  body: JSON.stringify(payload),
                                });
                              }

                              const result = await response.json();
                              // console.log(
                              //   "🛰️ Synced with backend cart:",
                              //   result
                              // );

                              const newCartId =
                                result.cart_ids && result.cart_ids.length > 0
                                  ? result.cart_ids[0]
                                  : cartId;

                              // console.log(
                              //   "🆕 Using cart ID for coupon:",
                              //   newCartId
                              // );

                              // 🛑 Stop here if sync failed
                              if (result.status !== "success") {
                                console.warn(
                                  "🚫 Backend cart sync failed:",
                                  result
                                );
                                return;
                              }

                              // ✅ Proceed only if success

                              // Update local cart
                              const existingCart = JSON.parse(
                                localStorage.getItem("cart_data") || "[]"
                              );

                              const existingItemIndex = existingCart.findIndex(
                                (item) => item.id === quickViewProduct.id
                              );

                              const selectedVariantId =
                                selectedVariants?.[quickViewProduct.id]?.id ||
                                null;

                              const variantPrice = Number(
                                selectedVariants?.[quickViewProduct.id]
                                  ?.price || 0
                              );

                              const basePrice =
                                quickViewProduct.promo_price &&
                                quickViewProduct.end_date &&
                                new Date(quickViewProduct.end_date) >
                                  new Date() &&
                                Number(quickViewProduct.promo_price) > 0 &&
                                Number(quickViewProduct.promo_price) <
                                  Number(quickViewProduct.price)
                                  ? Number(quickViewProduct.promo_price)
                                  : Number(quickViewProduct.price);

                              const updatedCart =
                                existingItemIndex >= 0
                                  ? existingCart.map((item, i) =>
                                      i === existingItemIndex
                                        ? { ...item, qty: item.qty + quantity }
                                        : item
                                    )
                                  : [
                                      ...existingCart,
                                      {
                                        id: quickViewProduct.id,
                                        name: quickViewProduct.name,
                                        qty: quantity,
                                        price: basePrice + variantPrice,
                                        image: quickViewProduct.image,
                                        variant_id: selectedVariantId, // ✅ add this
                                        variant_name:
                                          selectedVariants?.[
                                            quickViewProduct.id
                                          ]?.name || null,
                                      },
                                    ];

                              localStorage.setItem(
                                "cart_data",
                                JSON.stringify(updatedCart)
                              );
                              setCartItems(updatedCart);
                              // console.log(
                              //   "🧾 Local cart updated:",
                              //   updatedCart
                              // );

                              // Apply coupon
                              try {
                                const couponRes = await fetch(
                                  "/api/applyCoupon",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      cart_id: newCartId, // Use the same variable, no extra getItem call needed
                                      coupon_code: "0",
                                    }),
                                  }
                                );

                                if (!couponRes.ok)
                                  throw new Error("Failed to apply coupon");

                                const couponData = await couponRes.json();
                                // console.log(
                                //   "🎯 Coupon API Response after addToCart:",
                                //   couponData
                                // );
                              } catch (couponError) {
                                console.error(
                                  "🚫 Error applying coupon after addToCart:",
                                  couponError
                                );
                              }

                              // 🧾 Tax data fetch
                              try {
                                const taxRes = await fetch("/api/getTax", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ cart_id: cartId }),
                                });

                                if (taxRes.status === 401) {
                                  localStorage.removeItem("authToken");
                                  const retryToken = await fetchToken();
                                  const retryTaxRes = await fetch(
                                    "/api/getTax",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${retryToken}`,
                                      },
                                      body: JSON.stringify({ cart_id: cartId }),
                                    }
                                  );

                                  const taxData = await retryTaxRes.json();
                                  localStorage.setItem(
                                    "cart_tax_details",
                                    JSON.stringify(taxData)
                                  );
                                  // console.log(
                                  //   "💸 Tax details (retried):",
                                  //   taxData
                                  // );
                                } else {
                                  const taxData = await taxRes.json();
                                  localStorage.setItem(
                                    "cart_tax_details",
                                    JSON.stringify(taxData)
                                  );
                                  // console.log("💸 Tax details:", taxData);
                                }
                              } catch (taxError) {
                                console.error(
                                  "🚫 Failed to fetch tax details:",
                                  taxError
                                );
                              }

                              // UI feedback
                              setQuickViewProduct(null);
                              setIsCartOpen(true);
                              toast.success("🛒 Added to cart!", {
                                position: "top-right",
                                autoClose: 2000,
                              });
                            } catch (error) {
                              console.error("Add to cart error:", error);
                              toast.error("Failed to add to cart");
                            } finally {
                              setIsAdding(false);
                            }
                          }}
                          className={`group relative flex-1 overflow-hidden rounded-xl py-3 px-4 font-bold shadow-none border border-black transition-all duration-300 ease-in-out cursor-pointer ${
                            isAdding
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:border-transparent"
                          }`}
                          style={{
                            isolation: "isolate", // Creates new stacking context
                          }}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-white">
                            <ShoppingCart className="w-5 h-5" />
                            {isAdding ? t("Adding...") : t("Add to Cart")}
                          </span>
                          <span
                            className="absolute left-0 top-0 h-full w-0 bg-black transition-all duration-[900ms] ease-in-out group-hover:w-full z-[1] rounded-xl"
                            style={{
                              transitionProperty: "width, background-color",
                              willChange: "width",
                            }}
                          />
                          <span className="absolute inset-0 z-[-1] rounded-xl border border-transparent group-hover:border-white" />
                        </button>
                      </div>
                    </div>

                    {/* Buy It Now with same slow animation */}
                    <button
                      onClick={async () => {
                        // 1. Get or create cart ID
                        let cartId = localStorage.getItem("cart_id");
                        if (!cartId) {
                          cartId =
                            Math.random().toString(36).substring(2, 15) +
                            Math.random().toString(36).substring(2, 15);
                          localStorage.setItem("cart_id", cartId);
                        }

                        const payload = {
                          selected_country: "IN",
                          product_id: quickViewProduct.id,
                          historypincode: 614624,
                          qty: quantity,
                          cart_id: cartId,
                        };

                        try {
                          // 2. Get or refresh token
                          let token = localStorage.getItem("authToken");

                          const fetchToken = async () => {
                            const res = await fetch("/api/login", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                username: "admin",
                                password: "Admin@123",
                              }),
                            });
                            const data = await res.json();
                            if (data.status === "success") {
                              localStorage.setItem("authToken", data.token);
                              return data.token;
                            } else {
                              throw new Error("Authentication failed");
                            }
                          };

                          if (!token) token = await fetchToken();

                          // 3. Send API request
                          let response = await fetch("/api/addcart", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(payload),
                          });

                          // 4. Retry on 401
                          if (response.status === 401) {
                            localStorage.removeItem("authToken");
                            const retryToken = await fetchToken();
                            response = await fetch("/api/addcart", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${retryToken}`,
                              },
                              body: JSON.stringify(payload),
                            });
                          }

                          // 5. Final result
                          const result = await response.json();
                          // console.log("Add to cart result:", result);

                          // 🆕 6. Get Tax API call (only if addcart was successful)
                          // 🧾 Tax data fetch
                          try {
                            const taxRes = await fetch("/api/getTax", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ cart_id: cartId }),
                            });

                            if (taxRes.status === 401) {
                              localStorage.removeItem("authToken");
                              const retryToken = await fetchToken();
                              const retryTaxRes = await fetch("/api/getTax", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${retryToken}`,
                                },
                                body: JSON.stringify({ cart_id: cartId }),
                              });

                              const taxData = await retryTaxRes.json();
                              localStorage.setItem(
                                "cart_tax_details",
                                JSON.stringify(taxData)
                              );
                              // console.log("💸 Tax details (retried):", taxData);
                            } else {
                              const taxData = await taxRes.json();
                              localStorage.setItem(
                                "cart_tax_details",
                                JSON.stringify(taxData)
                              );
                              // console.log("💸 Tax details:", taxData);
                            }
                          } catch (taxError) {
                            console.error(
                              "🚫 Failed to fetch tax details:",
                              taxError
                            );
                          }

                          if (result.redirect_link) {
                            window.location.href = "/checkout";
                          } else {
                            console.warn("No redirect link returned from API");
                          }
                        } catch (error) {
                          console.error("Buy it now failed:", error);
                        }
                      }}
                      className="group relative w-full overflow-hidden rounded-xl py-3 px-4 font-semibold border-1 border-white transition-all duration-500 ease-in-out hover:border-black cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 text-white group-hover:text-black transition-colors duration-500 ease-in-out">
                        {t("Buy It Now")}
                      </span>
                      <span className="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-[900ms] ease-in-out group-hover:w-full z-0"></span>
                      <span className="absolute inset-0 bg-black z-[-1] rounded-xl"></span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

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
      </AnimatePresence>
    </div>
  );
};

export default FeaturedProducts;
