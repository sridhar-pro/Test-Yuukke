"use client";
import { useState, useEffect } from "react";
import { RefreshCcw, ShoppingBag } from "lucide-react";
import OrderSummary from "./OrderSummary";
import CheckoutForm from "./CheckoutForm";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../utils/AuthContext";
import { useSession } from "../context/SessionContext";
import ScratchCardPopup from "./ScratchCard";

export default function CheckoutPage({ formData }) {
  const router = useRouter();

  const { getValidToken } = useAuth();
  const { isLoggedIn } = useSession();

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [couponValue, setCouponValue] = useState(0);

  const [showScratch, setShowScratch] = useState(true);

  const [code, setCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  const [couponMessage, setCouponMessage] = useState(""); // <-- new state

  const [bogoOffers, setBogoOffers] = useState([]);

  const [applyingOffer, setApplyingOffer] = useState(false); // track button state

  useEffect(() => {
    // 🎉 Auto-trigger scratch card after page load
    const timer = setTimeout(() => {
      setShowScratch(true);
    }, 1500); // Delay for cinematic effect 😎
    return () => clearTimeout(timer);
  }, [setShowScratch]);

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
        // Optional: clear input field if you want
        // setCode("");
      } else {
        // ✅ Coupon applied, keep the entered code in the input
        setCouponMessage("");
        setIsApplied(true);
      }

      await fetchSummary(); // Refresh summary after coupon applied
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
    if (applyingOffer) return; // safety check

    try {
      setApplyingOffer(true); // 🔒 disable button

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Cart ID not found!");
        return;
      }

      const res = await fetchWithAuth("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { bogo_id: Number(bogoId), cart_id: cartId },
      });

      const data = await res;

      if (data.status === "error") {
        throw new Error(data.message || "Failed to apply offer");
      }

      toast.success(data.message || "Offer applied successfully");

      // 🔔 Trigger cart-updated event so UI can refresh
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setApplyingOffer(false); // 🔓 re-enable button
    }
  };

  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("razorpay_payment_id");
    if (storedId) setPaymentId(storedId);

    const handlePaymentIdUpdate = (e) => {
      setPaymentId(e.detail); // Instantly update from custom event
    };

    window.addEventListener("razorpayPaymentIdUpdated", handlePaymentIdUpdate);

    return () => {
      window.removeEventListener(
        "razorpayPaymentIdUpdated",
        handlePaymentIdUpdate
      );
    };
  }, []);

  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const storedOrderId = localStorage.getItem("razorpay_order_id");
    if (storedOrderId) setOrderId(storedOrderId);
  }, []);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [showInfo, setShowInfo] = useState(true);

  const handleToggle = () => {
    setShowInfo((prev) => !prev);
  };

  const [selectedMethod, setSelectedMethod] = useState("razorpay");

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  const updateSummaryFromStorage = () => {
    const shippingRaw = localStorage.getItem("cart_shipping_details");
    const taxRaw = localStorage.getItem("cart_tax_details");

    let sourceData = shippingRaw
      ? JSON.parse(shippingRaw)
      : JSON.parse(taxRaw || "{}");

    const itemsArray = Object.values(sourceData.contents || {});
    setCartItems(itemsArray);

    setSubtotal(parseCurrency(sourceData.subtotal));
    setShipping(parseCurrency(sourceData.shipping));
    setTax(parseCurrency(sourceData.total_item_tax));
    setTotal(parseCurrency(sourceData.grand_total));
  };

  useEffect(() => {
    updateSummaryFromStorage();

    const handleStorageChange = (e) => {
      if (e.key === "cart_shipping_details") {
        updateSummaryFromStorage();
      }
    };

    const handleCustomStorageUpdate = (e) => {
      if (e.detail.key === "cart_shipping_details") {
        updateSummaryFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange); // other tabs
    window.addEventListener("local-storage-update", handleCustomStorageUpdate); // same tab

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "local-storage-update",
        handleCustomStorageUpdate
      );
    };
  }, []);

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const today = new Date();
  const orderDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 7);

  const estimatedDelivery = deliveryDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentFailure, setPaymentFailure] = useState(false);

  useEffect(() => {
    if (isProcessingPayment && !paymentSuccess) {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // 👈 optional — can set to "auto" for instant
      });
    }
  }, [isProcessingPayment, paymentSuccess]);

  useEffect(() => {
    if (paymentFailure) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  useEffect(() => {
    if (paymentSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });

      const notifyBackend = async () => {
        const storedOrder = JSON.parse(localStorage.getItem("order_id_data"));
        const saleid = storedOrder?.sale_id;

        if (!saleid) {
          console.warn("🚫 No sale_id found in localStorage!");
          return;
        }

        const token = await getValidToken();
        if (!token && isLoggedIn) {
          console.error(
            "🔐 Auth token missing! Skipping payment notification."
          );
          return;
        }

        // Save order confirmation data before clearing
        const shippingDetails = localStorage.getItem("cart_shipping_details");
        const taxDetails = localStorage.getItem("cart_tax_details");
        const orderConfirmation = {
          orderDetails: shippingDetails ? JSON.parse(shippingDetails) : null,
          taxDetails: taxDetails ? JSON.parse(taxDetails) : null,
          orderId: idordered,
          paymentId,
          orderDate,
        };
        localStorage.setItem(
          "order_confirmation",
          JSON.stringify(orderConfirmation)
        );
        const savedName = localStorage.getItem("checkout_name");
        const savedEmail = localStorage.getItem("checkout_email");
        const savedContact = localStorage.getItem("checkout_contact");

        const storedCoupon = localStorage.getItem("applied_coupon") || "";

        // Conditionally build payload
        const payload = !isLoggedIn
          ? {
              saleid,
              msg: "success",
              name: localStorage.getItem("checkout_name") || "",
              email: localStorage.getItem("checkout_email") || "",
              phone: localStorage.getItem("checkout_contact") || "",
              guest: true,
              coupon_code: storedCoupon, // ✅ added here
            }
          : {
              saleid,
              msg: "success",
              guest: false,
              coupon_code: storedCoupon, // ✅ added here
            };

        try {
          const res = await fetch("/api/paymentNotify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          // console.log("✅ Payment notification response:", data);

          // Clear only the cart data, keep confirmation data
          const keysToRemove = [
            "cart_tax_details",
            "cart_data",
            "cart_id",
            "order_id_data",
            "cart_shipping_details",
          ];

          keysToRemove.forEach((key) => localStorage.removeItem(key));

          window.dispatchEvent(
            new CustomEvent("cart-cleared", {
              detail: { clearedKeys: keysToRemove },
            })
          );

          // console.log("🧼 Cart data cleared after successful payment.");
        } catch (err) {
          console.error("❌ Failed to send payment notification:", err);
        }
      };

      notifyBackend();
    }
  }, [paymentSuccess, isLoggedIn]);

  const [idordered, setIdOrdered] = useState(null);

  useEffect(() => {
    // Initial load from localStorage
    const stored = localStorage.getItem("order_id_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIdOrdered(parsed?.order_id || null);
      } catch (e) {
        console.error("⚠️ Failed to parse order_id_data from localStorage", e);
      }
    }

    // Listen for instant updates via custom event
    const handleOrderIdUpdate = (e) => {
      setIdOrdered(e.detail); // 👈 no need to re-parse localStorage
    };

    window.addEventListener("orderIdDataUpdated", handleOrderIdUpdate);

    return () => {
      window.removeEventListener("orderIdDataUpdated", handleOrderIdUpdate);
    };
  }, []);

  {
    /* Load order_success_details from localStorage */
  }
  // ✅ Get success data from localStorage
  const orderSuccessData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("order_success_details") || "{}")
      : {};

  // ✅ Convert contents object into array
  const success_orderedItems = orderSuccessData?.contents
    ? Object.values(orderSuccessData.contents)
    : [];

  // ✅ Parse currency strings safely
  const parsePrice = (price) =>
    Number(price?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  // ✅ Summary values
  const success_subtotal = parsePrice(orderSuccessData?.subtotal);
  const success_tax = parsePrice(orderSuccessData?.total_item_tax);
  const success_shipping = parsePrice(orderSuccessData?.shipping);
  const success_total = parsePrice(orderSuccessData?.grand_total);

  return (
    <div className="min-h-screen bg-gray-100 font-odop">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row min-h-screen lg:h-screen">
        <div className="w-full min-h-[70vh] flex justify-center bg-transparent">
          {isProcessingPayment && !paymentSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-0 text-center p-4 backdrop-blur-sm"
            >
              {/* 🌀 Skeleton Animation */}
              <div className="w-32 h-32 mx-auto bg-gray-200 animate-pulse rounded-full" />
              {/* Title Skeleton */}
              <div className="mt-4 w-64 h-8 bg-gray-200 mx-auto rounded-md animate-pulse" />
              {/* Button Skeleton */}
              <div className="mt-6 w-52 h-10 bg-gray-200 mx-auto rounded-full animate-pulse" />

              {/* Skeleton Card */}
              <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 mt-4">
                {/* Header */}
                <div className="bg-gray-300 animate-pulse p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="w-56 h-5 bg-gray-200 rounded" />
                    <div className="w-40 h-3 bg-gray-200 rounded" />
                  </div>
                </div>

                {/* Ordered Items Skeleton */}
                <div className="divide-y divide-gray-200 px-10 py-4 max-h-[320px] overflow-y-auto pr-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-md animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-1/3 h-3 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>

                <hr className="my-3 border-gray-200" />

                {/* Payment Method Skeleton */}
                <div className="px-5 pb-4 flex items-center justify-between">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                </div>

                <hr className="my-3 border-gray-200" />

                {/* Price Summary Skeleton */}
                <div className="px-5 pb-4 text-sm space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                  <hr className="border-gray-300" />
                  <div className="flex justify-between font-bold text-lg">
                    <div className="w-32 h-5 bg-gray-300 rounded animate-pulse" />
                    <div className="w-24 h-5 bg-gray-300 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : paymentSuccess ? (
            <>
              {/* 🎁 Scratch Card Popup */}
              {showScratch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <ScratchCardPopup onClose={() => setShowScratch(false)} />
                </motion.div>
              )}
              <div className="w-full min-h-[70vh] flex  justify-center bg-transparent">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full space-y-0 text-center p-4  backdrop-blur-sm"
                >
                  {/* 🎉 Success GIF Animation */}
                  <motion.img
                    src="/Success.gif" // make sure the gif itself is non-looping!
                    alt="Success Animation"
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 1.4,
                      type: "spring",
                      stiffness: 80,
                    }}
                    className="w-32 h-32 mx-auto  object-contain"
                  />

                  {/* Title and message */}
                  <motion.h1
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-3xl font-bold text-black capitalize"
                  >
                    Thanks for your order!
                  </motion.h1>

                  <button
                    onClick={() => {
                      // 🧹 Clear saved checkout data from localStorage
                      localStorage.removeItem("checkout_name");
                      localStorage.removeItem("checkout_email");
                      localStorage.removeItem("checkout_contact");
                      localStorage.removeItem("applied_coupon");

                      setCartItems([]);

                      router.push("/");
                    }}
                    className="mt-4 inline-flex items-center gap-2 justify-center px-6 py-3 text-sm bg-white hover:bg-gray-50 text-black font-semibold rounded-full transition-all duration-300 shadow-md"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Continue Shopping
                  </button>

                  <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 mt-4">
                    {/* Header */}
                    <div className="bg-green-700 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-xl text-left uppercase">
                          Order ID :{" "}
                          <span className="">
                            {idordered || "Not Available"}
                          </span>
                        </p>
                        <p className="text-xs mt-1 text-left text-yellow-200">
                          Order Date :{" "}
                          <span className="font-medium">{orderDate}</span>{" "}
                        </p>
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div className="divide-y divide-gray-400 px-10 py-4 max-h-[320px] overflow-y-auto pr-1">
                      {cartItems.map((item) => (
                        <div
                          key={item.rowid}
                          className="flex items-center gap-4 py-4"
                        >
                          <img
                            src={getImageSrc(item.image)}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <p
                              className="font-medium text-sm text-left"
                              dangerouslySetInnerHTML={{ __html: item.name }}
                            />
                          </div>
                          <div className="text-right px-5">
                            <p className="text-sm mt-1 text-right">
                              ₹
                              {(
                                parsePrice(item.price) * Number(item.qty)
                              ).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.qty}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Divider */}
                    <hr className="my-3 border-gray-200" />
                    {/* Address / Payment / Delivery */}
                    <div className="px-5 pb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold">Payment method</p>
                      <span className="text-sm text-gray-700 break-all">
                        Razorpay • {paymentId || "Not available"}
                      </span>
                    </div>
                    <hr className="my-3 border-gray-200" />

                    {/* Price Summary */}
                    <div className="px-5 pb-4 text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Item cost</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping fee</span>
                        <span>₹{shipping.toFixed(2)}</span>
                      </div>

                      <hr className="border-gray-300" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Cost</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          ) : paymentFailure ? (
            <div className="w-full min-h-[70vh] flex  justify-center bg-transparent">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full space-y-0 text-center p-4  backdrop-blur-sm"
              >
                <motion.img
                  src="/Failure.gif" // make sure the gif itself is non-looping!
                  alt="Success Animation"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.4, type: "spring", stiffness: 80 }}
                  className="w-32 h-32 mx-auto  object-contain"
                />

                {/* Title and message */}
                <motion.h1
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-3xl font-bold text-black capitalize"
                >
                  Payment Failed !
                </motion.h1>

                <button
                  onClick={() => {
                    router.push("/");

                    setCartItems([]);
                  }}
                  className="mt-4 inline-flex items-center gap-2 justify-center px-6 py-3 text-sm bg-white hover:bg-gray-50 text-black font-semibold rounded-full transition-all duration-300 shadow-md"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Continue Shopping
                </button>

                {/* Retry Payment */}
                <button
                  onClick={() => {
                    setPaymentFailure(false); // go back to normal checkout
                  }}
                  className="mt-4 ml-3 inline-flex items-center gap-2 justify-center px-6 py-3 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 shadow-md"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Retry Payment
                </button>
                <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 mt-4">
                  {/* Header */}
                  <div className="bg-red-600 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-xl text-left uppercase">
                        Order ID :{" "}
                        <span className="">{idordered || "Not Available"}</span>
                      </p>
                      <p className="text-xs mt-1 text-left text-yellow-200">
                        Order Date :{" "}
                        <span className="font-medium">{orderDate}</span>{" "}
                        {/* &nbsp; | */}
                        {/* &nbsp;
                    <span className="text-yellow-300">
                      Estimated delivery : {estimatedDelivery}
                    </span> */}
                      </p>
                    </div>
                    {/* <div className="flex gap-3">
                  <button className="px-4 py-2 text-sm bg-white text-[#A00300] font-semibold rounded-full hover:bg-gray-100 transition">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Download Invoice
                  </button>
                  <button className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-[#A00300] font-semibold rounded-full transition">
                    Track Order
                  </button>
                </div> */}
                  </div>

                  {/* Ordered Items */}
                  <div className="divide-y divide-gray-400 px-10 py-4 max-h-[320px] overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-4"
                      >
                        <img
                          src={getImageSrc(item.image)}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p
                            className="font-medium text-sm text-left"
                            dangerouslySetInnerHTML={{ __html: item.name }}
                          />
                        </div>
                        <div className="text-right px-5">
                          <p className="text-sm mt-1 text-right">
                            ₹
                            {(
                              Number(
                                item.price?.toString().replace(/[^0-9.-]+/g, "")
                              ) * Number(item.qty)
                            ).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.qty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <hr className="my-3 border-gray-200" />

                  {/* Address / Payment / Delivery */}
                  <div className="px-5 pb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">Payment method</p>
                    <span className="text-sm text-gray-700 break-all">
                      Razorpay • Payment Failed
                    </span>
                  </div>

                  <hr className="my-3 border-gray-200" />

                  {/* Price Summary */}
                  <div className="px-5 pb-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Item cost</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping fee</span>
                      <span>₹{shipping.toFixed(2)}</span>{" "}
                      {/* You can make this dynamic if needed */}
                    </div>

                    <hr className="border-gray-300" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Cost</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            // 🧾 Normal checkout layout (split screen)
            <>
              {/* Left: Scrollable Form Section */}
              <CheckoutForm
                total={total}
                onPaymentSuccess={() => setPaymentSuccess(true)}
                onProcessingStart={() => setIsProcessingPayment(true)}
                onPaymentFailure={() => setPaymentFailure(true)}
                cartItems={cartItems}
                subtotal={subtotal}
                tax={tax}
                shipping={shipping}
              />

              {/* Right: Sticky Summary */}
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                total={total}
                tax={tax}
                shipping={shipping}
                selectedMethod={selectedMethod}
                handleRadioChange={handleRadioChange}
                handleToggle={handleToggle}
                showInfo={showInfo}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
