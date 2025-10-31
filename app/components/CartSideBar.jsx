"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X, IndianRupee, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { setLocalStorageWithEvent } from "../utils/storageEvents";
import { useAuth } from "../utils/AuthContext";
import { useRouter } from "next/navigation";

const CartSidebar = ({ isOpen, onClose }) => {
  const { getValidToken } = useAuth();

  const router = useRouter();

  const [cartData, setCartData] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: "0.00",
    grand_total: "0.00",
    shipping: "0.00",
    total_item_tax: "0.00",
  });
  const [loading, setLoading] = useState(false);

  const [processingItems, setProcessingItems] = useState({});

  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault(); // stop Link default navigation
    setIsProcessing(true);

    try {
      const { items } = await fetchCartItemsWithDetails();

      if (!items || items.length === 0) {
        toast.error(
          "No products selected! Please add items to your cart before checkout."
        );
        setIsProcessing(false);
        return;
      }

      await syncFinalCart(cartData); // ✅ sync cart state

      onClose?.();
      setIsProcessing(false); // ✅ reset before navigation
      router.push("/checkout");
    } catch (error) {
      console.error("❌ Checkout error:", error);
      toast.error("Something went wrong. Please try again!");
      setIsProcessing(false);
    }
  };

  const setProcessing = (id, value) =>
    setProcessingItems((prev) => ({ ...prev, [id]: value }));

  const formatPrice = (price) => {
    // If it's already a number, keep existing behavior
    if (typeof price === "number" && !isNaN(price)) {
      return price.toFixed(2);
    }

    // If it's a string, remove non-numeric characters (like ₹) and convert
    if (typeof price === "string") {
      const numeric = parseFloat(price.replace(/[^\d.]/g, ""));
      if (!isNaN(numeric)) return numeric.toFixed(2);
    }

    // Fallback for anything else
    return "0.00";
  };

  const fetchWithAuth = async (
    url,
    options = {},
    maxTokenAttempts = 10,
    tokenDelay = 500,
    retryFetch = false
  ) => {
    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    // Retry getting a valid token
    const getTokenWithRetry = async () => {
      for (let attempt = 0; attempt < maxTokenAttempts; attempt++) {
        const token = await getValidToken();
        if (token && typeof token === "string" && token.length > 10)
          return token;

        // Force refresh halfway through attempts
        if (attempt === Math.floor(maxTokenAttempts / 2)) {
          localStorage.removeItem("authToken");
        }

        await wait(tokenDelay);
      }
      throw new Error("❌ Auth token unavailable after multiple retries.");
    };

    let token = await getTokenWithRetry();

    const fetchOptions = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    const res = await fetch(url, fetchOptions);

    // Retry once on 401
    if (res.status === 401 && !retryFetch) {
      console.warn("Token invalid, forcing refresh and retrying...");
      localStorage.removeItem("authToken");
      token = await getTokenWithRetry();
      fetchOptions.headers.Authorization = `Bearer ${token}`;
      return fetch(url, fetchOptions).then(async (r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      });
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  };

  useEffect(() => {
    const loadCartItems = async () => {
      setLoading(true);
      const { items, totals } = await fetchCartItemsWithDetails(); // updated function
      setCartData(items);
      setTotals(totals);
      setLoading(false);
    };

    if (isOpen) loadCartItems();

    const handleCartUpdate = () => loadCartItems();
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [isOpen]);

  const fetchCartItemsWithDetails = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      console.warn("⚠️ No cart_id found in localStorage");
      return { items: [], totals: {} };
    }

    try {
      const token = await getValidToken();

      const res = await fetch("/api/getTax", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart_id: cartId }),
      });

      if (!res.ok) {
        console.error("❌ Failed to fetch /api/getTax:", res.status);
        return { items: [], totals: {} };
      }

      const data = await res.json();
      const cart = data.cart_data || {};

      // Extract items from contents
      const items = Object.values(cart.contents || {}).map((item) => ({
        rowid: item.rowid,
        product_id: item.product_id,
        id: item.id,
        name: item.name,
        subtotal: item.subtotal || "₹0.00",
        qty: item.qty || 1,
        image: item.image || "/fallback.png",
      }));

      // Extract totals
      const totals = {
        subtotal: cart.subtotal || "₹0.00",
        grand_total: cart.grand_total || "₹0.00",
        shipping: cart.shipping || "₹0.00",
        total_item_tax: cart.total_item_tax || "₹0.00",
      };

      return { items, totals };
    } catch (err) {
      console.error("❌ Error fetching cart items:", err);
      return { items: [], totals: {} };
    }
  };

  // ✅ Hit addcart API with latest quantities
  // ✅ Hit addcart API with latest quantities
  const syncFinalCart = async (cartItems) => {
    try {
      const cartId = localStorage.getItem("cart_id");
      if (!cartId) return;

      const token = await getValidToken();

      const payload = {
        selected_country: "IN",
        historypincode: 614624,
        cart_id: cartId,
        product_ids: cartItems.map((item) => item.product_id.toString()),
        qty: cartItems.map((item) => item.qty),
      };

      const res = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📩 addcart response:", data);

      if (data.status === "error") {
        // 🔴 Show all errors if available
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          data.errors.forEach((err) =>
            toast.error(err, { position: "top-center", autoClose: 3000 })
          );
        } else {
          toast.error(data.error || "Failed to update cart", {
            position: "top-center",
            autoClose: 3000,
          });
        }
        return null;
      }

      return data;
    } catch (err) {
      console.error("❌ syncFinalCart error:", err);
      toast.error("Something went wrong while syncing cart", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const incrementQty = async (id) => {
    if (processingItems[id]) return; // Already processing
    setProcessing(id, true);

    try {
      const currentItem = cartData.find((i) => i.rowid === id);
      if (!currentItem) return;

      const updatedCart = cartData.map((item) =>
        item.rowid === id ? { ...item, qty: item.qty + 1 } : item
      );

      const response = await syncFinalCart(updatedCart);
      if (response) {
        setCartData(updatedCart);
        toast.success(`Quantity updated to ${currentItem.qty + 1}`, {
          position: "top-right",
          autoClose: 2000,
        });
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(id, false);
    }
  };

  const decrementQty = async (id) => {
    if (processingItems[id]) return;
    setProcessing(id, true);

    try {
      const currentItem = cartData.find((i) => i.rowid === id);
      if (!currentItem || currentItem.qty === 1) return;

      const updatedCart = cartData.map((item) =>
        item.rowid === id ? { ...item, qty: item.qty - 1 } : item
      );

      const response = await syncFinalCart(updatedCart);
      if (response) {
        setCartData(updatedCart);
        toast.success(`Quantity updated to ${currentItem.qty - 1}`, {
          position: "top-right",
          autoClose: 2000,
        });
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(id, false);
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
        setCartData((prev) => prev.filter((item) => item.rowid !== rowid));
        window.dispatchEvent(new Event("cart-updated"));
        toast.success("Item removed from cart", {
          position: "top-right",
          autoClose: 2000,
        });
        fetchCartItemsWithDetails(); // refresh cart totals
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blurred Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-transparent backdrop-blur-md transition-opacity"
            onClick={onClose}
          />

          {/* Cart Sidebar (unchanged) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[30rem] lg:w-[37rem] bg-white shadow-lg z-[100] rounded-l-3xl overflow-hidden"
          >
            <div className="p-12 sm:p-14 h-full flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-8">
                <h2 className="text-3xl sm:text-4xl font-medium">Cart</h2>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-gray-900 hover:text-white border-2 border-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Items */}
              <motion.div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 sm:gap-4 px-2 animate-pulse"
                      >
                        <div className="w-20 h-20 bg-gray-200 rounded-md" />
                        <div className="flex-1 h-16 flex flex-col justify-between py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="flex justify-between items-center">
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-6 w-20 bg-gray-200 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cartData && cartData.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {cartData.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="py-4 pb-8"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 px-2">
                          {/* Product Image */}
                          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border border-white">
                            {item.image ? (
                              <img
                                src={getImageSrc(item.image)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-400">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 h-16 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-sm sm:text-lg line-clamp-2 pr-2">
                                {decodeHTML(item.name)}
                              </h3>
                              <button
                                onClick={() => removeItem(item.product_id)}
                                className="text-gray-500 hover:text-black transition p-1 ml-2 flex-shrink-0 flex items-center justify-center w-6 h-6 relative"
                                disabled={processingItems[item.product_id]} // disable during processing
                              >
                                {processingItems[item.product_id] ? (
                                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="font-medium flex items-center text-sm sm:text-base">
                                {/* <IndianRupee className="w-3 h-3 mr-1" /> */}
                                {item.subtotal}
                              </span>
                              <div className="flex items-center bg-gray-50 rounded-sm overflow-hidden">
                                <button
                                  onClick={() => decrementQty(item.rowid)}
                                  disabled={item.qty === 1}
                                  className={`px-2 py-2 transition ${
                                    item.qty === 1
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-sm">{item.qty}</span>
                                <button
                                  onClick={() => incrementQty(item.rowid)}
                                  className="px-2 py-2 hover:bg-gray-100 transition"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <p>Your cart is empty</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Footer */}
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-950">Subtotal</span>
                  <span className="font-bold flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {formatPrice(
                      cartData
                        .reduce(
                          (sum, item) =>
                            sum +
                            parseFloat(item.subtotal.replace(/[^\d.]/g, "")),
                          0
                        )
                        .toFixed(2)
                    )}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Shipping and taxes calculated at checkout
                </div>
                <div className="flex justify-end">
                  <Link href="/checkout" onClick={handleClick}>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isProcessing}
                      className={`w-full min-w-[180px] text-sm py-3 px-3 mb-8 md:mb-0 rounded-lg transition flex items-center justify-center 
    ${
      isProcessing
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-red-500 hover:bg-gray-800 text-white"
    }
  `}
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Proceed to Checkout"
                      )}
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
