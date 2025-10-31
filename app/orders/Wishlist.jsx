"use client";
import React, { useState, useEffect, useRef } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";
import { useRouter } from "next/navigation";
import CartSidebar from "../components/CartSideBar";

const Wishlist = () => {
  const { getValidToken } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [loadingItemId, setLoadingItemId] = useState(null);

  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchWishlist = async () => {
      try {
        const token = await getValidToken();
        const user_id = localStorage.getItem("user_id");
        const company_id = localStorage.getItem("company_id");

        if (!user_id || !company_id) {
          console.error("Missing user_id or company_id");
          setLoading(false);
          return;
        }
        // console.log("user id", user_id);
        // console.log("company id", company_id);

        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id, company_id }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        // console.log("wishlist data", data);

        if (data.status === "success" && data.items) {
          // Transform API items into frontend-friendly format
          const formatted = data.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: `₹${parseFloat(item.price).toLocaleString()}`,
            image: `${item.image}`, // adjust if API provides full URL
            stock: parseFloat(item.quantity) > 0, // >0 => in stock
          }));

          const ids = data.items.map((item) => item.id);
          localStorage.setItem("wishlist_ids", JSON.stringify(ids));
          // console.log("✅ Stored wishlist_ids:", ids);

          setWishlist(formatted);
        } else {
          setWishlist([]);
          localStorage.setItem("wishlist_ids", JSON.stringify([]));
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setWishlist([]);
        localStorage.setItem("wishlist_ids", JSON.stringify([]));
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Remove item from wishlist (backend + frontend)
  const handleRemove = async (productId) => {
    const toastId = toast.loading("Removing item from wishlist...");
    try {
      const token = await getValidToken();
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        toast.update(toastId, {
          render: "Session expired — please log in again 😬",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
        console.error("No user_id in Storage");
        return;
      }

      const res = await fetch("/api/remove_wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, user_id }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // console.log("Wishlist removed", data);

      if (data.status === "success") {
        setWishlist((prev) => prev.filter((item) => item.id !== productId));

        toast.update(toastId, {
          render: "Item removed from wishlist",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        console.error("Failed to remove from wishlist:", data);
      }
    } catch (err) {
      console.error("Error removing wishlist item:", err);
    }
  };

  // Move item to cart (dummy logic for now)
  const handleMoveToCart = (id) => {
    alert(`Item moved to cart: ${id}`);
    handleRemove(id);
  };

  return (
    <div className="flex-1 rounded-tl-2xl border border-neutral-200 bg-white p-6 md:p-10">
      <h2 className="text-2xl font-bold text-black flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" /> Wishlist Items
      </h2>

      {loading ? (
        <div className="flex justify-center items-center mt-6">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[#a00300] rounded-full animate-spin"></div>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Heart className="w-16 h-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-600">
            Your wishlist is empty
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Save products you love and come back to them later!
          </p>
          <button
            onClick={() => router.push("/products")}
            className="mt-6 px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 ">
              {/* Product Image */}
              <div className="relative w-full h-68 md:h-56 rounded-xl overflow-hidden bg-white">
                <Image
                  src={getImageSrc(item.image)}
                  alt={item.name || "product image"}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain hover:scale-105 transition-transform rounded-lg"
                />
              </div>
              {/* Product Details */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 capitalize min-h-[3.5rem]">
                  {item.name}
                </h3>
                <p className="text-black font-bold mt-1">{item.price}</p>
                <span
                  className={`text-sm font-medium ${
                    item.stock ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 gap-3">
                {/* Move to Cart Button */}
                <button
                  disabled={!item.stock || loadingItemId === item.id}
                  onClick={async () => {
                    try {
                      setLoadingItemId(item.id); // start loading

                      // 1️⃣ Get or create cart ID instantly
                      let cartId = localStorage.getItem("cart_id");
                      if (!cartId) {
                        cartId =
                          Math.random().toString(36).substring(2, 15) +
                          Math.random().toString(36).substring(2, 15);
                        localStorage.setItem("cart_id", cartId);
                      }

                      // 2️⃣ Prepare payload
                      const payload = {
                        selected_country: "IN",
                        product_id: item.id,
                        historypincode: 614624,
                        qty: 1,
                        cart_id: cartId,
                        variant_id: item?.variant_id ? [item.variant_id] : [],
                      };

                      // 3️⃣ Fetch token helper
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
                        }
                        throw new Error("Authentication failed");
                      };

                      let token = localStorage.getItem("authToken");
                      if (!token) token = await fetchToken();

                      // 4️⃣ Sync cart with backend
                      let response = await fetch("/api/addcart", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                      });

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
                      if (result.status !== "success") {
                        toast.error("Failed to move item to cart");
                        return;
                      }

                      // 🛒 Update local cart
                      const existingCart = JSON.parse(
                        localStorage.getItem("cart_data") || "[]"
                      );
                      const existingItemIndex = existingCart.findIndex(
                        (c) => c.id === item.id
                      );

                      const updatedCart =
                        existingItemIndex >= 0
                          ? existingCart.map((c, i) =>
                              i === existingItemIndex
                                ? { ...c, qty: c.qty + 1 }
                                : c
                            )
                          : [
                              ...existingCart,
                              {
                                id: item.id,
                                name: item.name,
                                qty: 1,
                                price: parseFloat(
                                  (item.price || "0")
                                    .toString()
                                    .replace(/[^\d.]/g, "")
                                ),
                                image: item.image,
                                variant_id: item?.variant_id || null,
                                variant_name: item?.variant_name || null,
                              },
                            ];

                      localStorage.setItem(
                        "cart_data",
                        JSON.stringify(updatedCart)
                      );
                      setCartItems(updatedCart);

                      // 🧹 Remove from wishlist
                      handleRemove(item.id);

                      // ✅ Show toast + open cart instantly
                      toast.success("Moved from wishlist to cart!");
                      setIsCartOpen(true); // 💥 Opens the Cart Sidebar immediately
                    } catch (err) {
                      console.error(err);
                      toast.error("Something went wrong!");
                    } finally {
                      setLoadingItemId(null); // stop loading
                    }
                  }}
                  className={`relative flex items-center justify-center gap-2 h-10 px-4 text-sm rounded-xl transition ${
                    item.stock
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loadingItemId === item.id && (
                    <img
                      src="/add.gif"
                      alt="loading"
                      className="absolute inset-0 w-full h-full object-contain bg-white/70 rounded-xl"
                    />
                  )}
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                </button>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="flex items-center justify-center gap-2 h-10 px-4 text-sm rounded-xl border border-red-200 text-red-500 hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>

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
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
