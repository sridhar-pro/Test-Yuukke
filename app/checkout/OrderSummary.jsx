"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { TrendingUp, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OrderSummary = () => {
  const { getValidToken } = useAuth();
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [processingItems, setProcessingItems] = useState({});

  const [applyingOffer, setApplyingOffer] = useState(false); // track button state

  const [couponValue, setCouponValue] = useState(0);

  const [code, setCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  const [appliedOffers, setAppliedOffers] = useState([]); // track applied offers

  const [couponMessage, setCouponMessage] = useState(""); // <-- new state

  const [bogoOffers, setBogoOffers] = useState([]);

  const setProcessing = (id, value) =>
    setProcessingItems((prev) => ({ ...prev, [id]: value }));

  // 🧮 Currency parser
  const parseCurrency = (val) =>
    Number(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getValidToken();
    const res = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true);
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  const fetchSummary = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      console.warn("⚠️ No cart_id found in localStorage");
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithAuth("/api/getTax", {
        method: "POST",
        body: { cart_id: cartId },
      });

      const data = await response;
      console.log("CartData", data);

      // ✅ Save bogo_offers
      if (response?.bogo_offers) {
        setBogoOffers(response.bogo_offers);
      }

      const cartData = response?.cart_data;
      if (!cartData) return;

      // 🛒 Extract items from cart_data.contents
      const itemsArray = Object.values(cartData.contents || {}).map((item) => ({
        rowid: item.rowid,
        product_id: item.product_id,
        id: item.id,
        name: item.name,
        price: parseCurrency(item.price),
        qty: item.qty,
        subtotal:
          item.subtotal ||
          `₹${(parseCurrency(item.price) * item.qty).toFixed(2)}`,
        image: item.image || "/fallback.png",
      }));
      setCartItems(itemsArray);

      // Totals from cart_data
      setSubtotal(parseCurrency(cartData.subtotal));
      setShipping(parseCurrency(cartData.shipping));
      setTax(parseCurrency(cartData.total_item_tax));
      setTotal(parseCurrency(cartData.grand_total));

      // ✅ Set coupon applied state
      const appliedCoupon = cartData.coupon_id && cartData.coupon_id !== "0";
      setIsApplied(Boolean(appliedCoupon));
      // ✅ Persist coupon code in input if applied
      if (appliedCoupon) {
        setCode(cartData.coupon_id);
        setCouponMessage(""); // Clear any previous message
        setCouponValue(parseCurrency(cartData.coupon_value || 0));
      } else {
        setCouponValue(0);
      }
    } catch (err) {
      console.error("❌ Failed to fetch summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId || !code.trim()) return;

    try {
      const response = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: code.trim() },
      });

      if (response.status === false) {
        // ❌ Coupon not applied, show message
        setCouponMessage(response.message || "Failed to apply coupon");
        // Optional: clear input field
        // setCode("");
        localStorage.removeItem("applied_coupon"); // clear if failed
        // console.log("❌ Coupon not applied:", code.trim());
      } else {
        // ✅ Coupon applied
        setCouponMessage("");
        setIsApplied(true);

        // Store the applied code in localStorage
        localStorage.setItem("applied_coupon", code.trim());
        // console.log("🎉 Coupon applied and stored:", code.trim());
        // 🟢 Trigger your existing listener
        window.dispatchEvent(new Event("cart-updated"));
        console.log("🎉 Coupon applied — cart-updated event dispatched!");
      }

      // Refresh summary after coupon applied
      await fetchSummary();
    } catch (err) {
      console.error("❌ Error applying coupon:", err);
      setCouponMessage("Failed to apply coupon. Try again.");
    }
  };

  useEffect(() => {
    fetchSummary();

    const handleCartUpdate = () => fetchSummary();
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    if (image.startsWith("http") || image.startsWith("/")) return image;

    const originalUrl = `https://marketplace.yuukke.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  const applyBogoOffer = async (bogoId) => {
    if (applyingOffer || appliedOffers.includes(bogoId)) return; // safety check

    const toastId = toast.loading("Applying offer...");

    try {
      setApplyingOffer(true); // 🔒 disable button during API call

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.update(toastId, {
          render: "Cart ID not found ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
        return;
      }

      const res = await fetchWithAuth("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { bogo_id: Number(bogoId), cart_id: cartId },
      });

      // 🧠 Make sure response parsing matches your fetchWithAuth utility
      const message = res?.message?.toLowerCase() || "";
      const status = res?.status?.toLowerCase();

      if (message.includes("offer applied successfully")) {
        toast.update(toastId, {
          render: "Offer applied successfully 🎉",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        // Add to appliedOffers instantly
        setAppliedOffers((prev) => [...prev, bogoId]);

        // 🔔 Trigger cart-updated event
        window.dispatchEvent(new Event("cart-updated"));
      } else if (res.status === "error") {
        toast.update(toastId, {
          render: res?.message || "Failed to apply offer ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: error.message || "Something went wrong ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setApplyingOffer(false);
    }
  };

  const removeItem = async (productId) => {
    if (processingItems[productId]) return;
    setProcessing(productId, true);

    try {
      const cartResponse = await fetchWithAuth("/api/getTax", {
        method: "POST",
        body: { cart_id: localStorage.getItem("cart_id") },
      });

      const cartDataAPI = cartResponse?.cart_data;
      if (!cartDataAPI) throw new Error("Cart is empty");

      const cartItemsArray = Object.values(cartDataAPI.contents || {});
      const itemToRemove = cartItemsArray.find(
        (item) => item.product_id === productId
      );
      if (!itemToRemove) throw new Error("Item not found in cart");

      const { rowid } = itemToRemove;
      const token = await getValidToken();
      const res = await fetch("/api/cartRemove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_id: localStorage.getItem("cart_id"),
          rowid,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setCartItems((prev) => {
          const updatedCart = prev.filter((item) => item.rowid !== rowid);
          // 🎯 If cart is now empty — redirect to /products
          if (updatedCart.length === 0) {
            toast.info("Your cart is empty — taking you to products!", {
              position: "top-right",
              autoClose: 1800,
            });
            setTimeout(() => {
              window.location.href = "/products";
            }, 1800);
          }
          return updatedCart;
        });

        window.dispatchEvent(new Event("cart-updated"));
        toast.success("Item removed from cart", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        throw new Error(data.message || "Failed to remove item");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    } finally {
      setProcessing(productId, false);
    }
  };

  const decodeHTML = (str) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  return (
    <div className="w-full lg:w-[440px] order-2 lg:order-none sticky lg:top-0 h-fit lg:h-screen overflow-y-auto p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-300 hidden md:block hide-scrollbar">
      <div className="space-y-6">
        <h1 className="text-xl font-[800] tracking-tight">Order Summary</h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {/* 🛍 Cart Items Skeleton */}
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}

            {/* 🎁 Discount Input Skeleton */}
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-10 bg-gray-200 rounded" />
              <div className="h-10 w-20 bg-gray-200 rounded" />
            </div>

            {/* 📦 Summary Skeleton */}
            <div className="border-t pt-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-10" />
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <div className="h-4 bg-gray-300 rounded w-20" />
                <div className="h-4 bg-gray-300 rounded w-14" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
            </div>

            {/* 💸 Offers Skeleton */}
            <div className="mt-6">
              <div className="h-4 bg-gray-300 rounded w-32 mb-3" />
              <div className="h-16 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* 🛍 Cart Items */}
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-4 border-b border-gray-200 py-3"
                >
                  {/* Left Side: Image + Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={getImageSrc(item.image)}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {decodeHTML(item.name)} <br /> x {item.qty}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Remove Button */}
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-gray-500 hover:text-black transition p-1 flex-shrink-0 flex items-center justify-center w-6 h-6 relative"
                    disabled={processingItems[item.product_id]} // disable during processing
                  >
                    {processingItems[item.product_id] ? (
                      <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 🎁 Discount Input */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Discount code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setIsApplied(false); // Reset the button to "Apply"
                  setCouponMessage(""); // Clear any previous message
                  setCouponValue(0); // Optional: reset previous discount
                }}
                className="input flex-1 bg-white"
              />

              <div className="flex flex-col items-center relative">
                <button
                  onClick={handleApply}
                  disabled={isApplied}
                  className={`bg-gray-200 text-sm font-bold p-4 rounded-md relative z-10 transition-all duration-200 ${
                    isApplied ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {isApplied ? "Applied" : "Apply"}
                </button>
                {isApplied && (
                  <span className="mt-1 text-xs text-green-600 font-medium">
                    Coupon Applied
                  </span>
                )}{" "}
              </div>
            </div>

            {/* Always show below Apply button */}
            <span className="mt-1 text-xs text-red-600 font-medium px-4 text-center flex justify-center">
              {couponMessage}
            </span>

            {/* 📦 Summary */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>

              {couponValue > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-₹{couponValue.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <p className="text-xs text-gray-500">
                Including ₹{tax.toFixed(2)} in taxes
              </p>
            </div>

            {/* 💸 More Offers */}
            {bogoOffers.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-bold mb-3">More offers</h2>

                <div className="space-y-4">
                  {bogoOffers.map((offer) => {
                    const isApplied = appliedOffers.includes(offer.id);
                    return (
                      <div
                        key={offer.id}
                        className="relative flex bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                      >
                        {/* Ribbon Left */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-b from-[#A00300] to-red-700 flex items-center justify-center">
                          <span className="text-[26px] font-extrabold text-white transform -rotate-90 whitespace-nowrap tracking-wider uppercase italic shadow-md">
                            {offer.title}
                          </span>
                        </div>

                        {/* Offer Content */}
                        <div className="flex-1 pl-20 p-5">
                          <div className="flex justify-between items-start capitalize mb-3">
                            <span
                              className="font-bold text-sm text-gray-600 text-justify"
                              dangerouslySetInnerHTML={{
                                __html: offer.description,
                              }}
                            />
                            <button
                              className={`text-xs font-semibold text-white px-3 py-1 rounded-lg shadow transition-colors ml-4 shrink-0
                    ${
                      isApplied
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-[#A00300] hover:bg-red-700"
                    }`}
                              onClick={() =>
                                !isApplied && applyBogoOffer(offer.id)
                              }
                              disabled={applyingOffer || isApplied}
                              title={
                                isApplied
                                  ? "Offer already applied"
                                  : "Click to apply offer"
                              } // tooltip
                            >
                              {isApplied
                                ? "APPLIED"
                                : applyingOffer
                                ? "Applying"
                                : "APPLY"}
                            </button>
                          </div>

                          <hr className="my-3 border-dashed border-gray-300" />

                          {/* Eligible Products */}
                          <details className="mt-2 group">
                            <summary className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-[#A00300] flex items-center gap-1">
                              <Link
                                href="/products/special-offers"
                                className="hover:text-[#A00300] flex items-center gap-1"
                              >
                                <TrendingUp className="w-4 h-4 text-[#A00300]" />
                                Eligible Products
                              </Link>
                            </summary>
                          </details>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
