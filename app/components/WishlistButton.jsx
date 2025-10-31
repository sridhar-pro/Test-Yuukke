"use client";

import { useState, useEffect } from "react";
import { Heart, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "../context/SessionContext";

// 🔹 Global wishlist cache to prevent duplicate API calls
let wishlistCache = null;
let wishlistPromise = null;

const WishlistButton = ({ productId, variant = "icon" }) => {
  const { getValidToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { isLoggedIn } = useSession();

  // 🔹 Fetch wishlist items (cached + debounced)
  const fetchWishlist = async () => {
    if (wishlistCache) return wishlistCache;

    if (!wishlistPromise) {
      wishlistPromise = (async () => {
        try {
          const token = await getValidToken();
          const user_id = localStorage.getItem("user_id");
          const company_id = localStorage.getItem("company_id");

          if (!user_id || !company_id) {
            wishlistCache = [];
            return [];
          }

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

          wishlistCache =
            data.status === "success" && Array.isArray(data.items)
              ? data.items.map((item) => item.id)
              : [];

          return wishlistCache;
        } catch (err) {
          console.error("❌ Error fetching wishlist:", err);
          wishlistCache = [];
          return [];
        } finally {
          wishlistPromise = null;
        }
      })();
    }

    return wishlistPromise;
  };

  // 🔹 Sync local state with wishlist cache
  const syncWishlist = async () => {
    const ids = await fetchWishlist();
    setAdded(ids.includes(productId));
  };

  useEffect(() => {
    syncWishlist();

    // 🔹 Listen to global updates
    const handleUpdate = () => syncWishlist();
    window.addEventListener("wishlistUpdated", handleUpdate);

    return () => {
      window.removeEventListener("wishlistUpdated", handleUpdate);
    };
  }, [productId]);

  useEffect(() => {
    if (isLoggedIn) {
      // 🧹 Clear cache so it refetches fresh wishlist after login
      wishlistCache = null;
      syncWishlist();
    } else {
      setAdded(false);
    }
  }, [isLoggedIn, productId]);

  // 🔹 Add product to wishlist
  const handleAdd = async () => {
    setLoading(true);
    try {
      const token = await getValidToken();
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/add_wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, user_id }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.status === "success") {
        // ✅ Update instantly
        setAdded(true);
        wishlistCache = [...(wishlistCache || []), productId];
        window.dispatchEvent(new Event("wishlistUpdated"));

        // ✅ Success toast
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Added to Wishlist</span>
          </div>,
          {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            icon: false,
            style: {
              background: "#fff",
              color: "#000",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "14px",
            },
          }
        );
      } else {
        toast.error("Failed to add to wishlist");
      }
    } catch (err) {
      console.error("❌ Wishlist add error:", err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Remove product from wishlist
  const handleRemove = async () => {
    setLoading(true);
    try {
      const token = await getValidToken();
      const user_id = localStorage.getItem("user_id");
      if (!user_id) return;

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

      if (data.status === "success") {
        // ✅ Update instantly
        setAdded(false);
        wishlistCache = (wishlistCache || []).filter((id) => id !== productId);
        window.dispatchEvent(new Event("wishlistUpdated"));

        // ✅ Removed toast
        toast.info(
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span>Removed from Wishlist</span>
          </div>,
          {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            icon: false,
            style: {
              background: "#000",
              color: "#fff",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "14px",
            },
          }
        );
      } else {
        toast.error("Failed to remove from wishlist");
      }
    } catch (err) {
      console.error("❌ Wishlist remove error:", err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Toggle wishlist instantly
  const handleWishlist = async (e) => {
    e.preventDefault();
    if (loading) return;

    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      router.push("/login");
      return;
    }

    // ✅ Optimistic UI update
    if (added) {
      await handleRemove();
    } else {
      await handleAdd();
    }
  };

  // 🔹 Full-width button variant
  if (variant === "full") {
    return (
      <button
        onClick={handleWishlist}
        disabled={loading}
        className={`w-full border py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
          added
            ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
            : "border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Heart
          className={`w-5 h-5 ${
            added ? "text-white fill-white" : "text-[#A00300]"
          }`}
        />
        {added ? "Wishlisted" : "Add to Wishlist"}
      </button>
    );
  }

  // 🔹 Icon-only button variant
  return (
    <button
      onClick={handleWishlist}
      disabled={loading}
      aria-label={added ? "Remove from wishlist" : "Add to wishlist"}
      className={`p-2 rounded-full shadow transition-all ${
        added
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white/70 backdrop-blur-sm hover:bg-white"
      }`}
    >
      <Heart
        className={`w-4 h-4 ${
          added ? "text-white fill-white" : "text-gray-700"
        }`}
      />
    </button>
  );
};

export default WishlistButton;
