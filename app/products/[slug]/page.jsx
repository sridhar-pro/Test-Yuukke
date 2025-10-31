"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  ChevronRight,
  ArrowLeft,
  Clock,
  Info,
  IndianRupee,
  CreditCard,
  ShieldCheck,
  Store,
  Package,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Ban,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/app/utils/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  containerVariants,
  itemVariants,
  fadeInUp,
} from "@/app/utils/variants";
import CartSidebar from "@/app/components/CartSideBar";
import { useTranslation } from "react-i18next";
import useMetaUpdater from "@/app/hooks/useMetaUpdater";
import WishlistButton from "@/app/components/WishlistButton";
import { useSession } from "@/app/context/SessionContext";

export default function ProductPage() {
  const { t } = useTranslation();

  const router = useRouter();
  const { isLoggedIn } = useSession();
  const [showPopupenq, setShowPopupenq] = useState(false);
  const [sms, setSms] = useState("");
  const [loadingenq, setLoadingenq] = useState(false);

  const { getValidToken } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(() => {
    if (Number(product?.minimum_order_limit) === 1) {
      return Number(product?.minimum_order_qty) > 0
        ? Number(product.minimum_order_qty)
        : 1;
    }
    return 1;
  });

  useEffect(() => {
    if (Number(product?.minimum_order_limit) === 1) {
      setQuantity(
        Number(product?.minimum_order_qty) > 0
          ? Number(product.minimum_order_qty)
          : 1
      );
    } else {
      setQuantity(1);
    }
  }, [product?.id]);

  const [showPopup, setShowPopup] = useState(false);
  const [pincode, setPincode] = useState("600001");
  const [city, setCity] = useState("Chennai"); // default city
  const [locationUpdated, setLocationUpdated] = useState(false);

  const handleUpdate = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleSave = async (retry = false) => {
    if (pincode.length !== 6 || isNaN(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    const toastId = toast.loading("Validating pincode...");

    try {
      const token = await getValidToken();
      if (!token) {
        if (!retry) {
          localStorage.removeItem("authToken");
          await login(); // 👈 implement your login logic
          toast.dismiss(toastId);
          return handleSave(true); // 🔁 retry once
        } else {
          throw new Error("Authentication failed");
        }
      }

      const res = await fetch("/api/pincode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pincode, country: "IN" }),
      });

      const data = await res.json();
      const result = data?.data?.data;

      if (result?.pincode && result?.country === "IN" && result?.city) {
        setCity(result.city); // ✅ dynamically set city from API
        setShowPopup(false);
        setLocationUpdated(true); // ✅ mark update

        toast.update(toastId, {
          render: "Location updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: "Invalid pincode or city not found.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error validating pincode:", err);
      toast.update(toastId, {
        render: err.message || "Something went wrong while fetching city.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleEnquire = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setShowPopupenq(true);
  };

  const handleSubmit = async () => {
    try {
      setLoadingenq(true);

      const token = await getValidToken();
      const company_id = localStorage.getItem("company_id");
      const customer_name = localStorage.getItem("name");
      // console.log("Name:", customer_name);

      const payload = {
        product_id: product?.id,
        company_id: company_id ? parseInt(company_id) : null,
        customer_name: customer_name,
        sms,
      };

      const res = await fetch("/api/addenquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send enquiry");

      const data = await res.json();
      // console.log("Enquiry Success:", data);

      setShowPopupenq(false);
      setSms("");
      toast.success("Enquiry submitted successfully 🎉");
    } catch (err) {
      console.error("Error submitting enquiry:", err);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoadingenq(false);
    }
  };

  const [isAdding, setIsAdding] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [viewerCount, setViewerCount] = useState(
    () => Math.floor(Math.random() * 16) + 15
  );
  const [lastUpdated, setLastUpdated] = useState("just now");

  const [showFullDesc, setShowFullDesc] = useState(false);

  const { isShort, limitedText } = useMemo(() => {
    if (!product?.description) return { isShort: true, limitedText: "" };

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = product.description;

    const fullText = tempDiv.textContent.trim();
    const words = fullText.split(/\s+/);

    // If within limit, no need to trim
    if (words.length <= 70) {
      return { isShort: true, limitedText: fullText };
    }

    // Slice first 70 words
    const trimmed = words.slice(0, 70).join(" ");

    // Find the last period before or at 70-word cutoff
    const lastDotIndex = trimmed.lastIndexOf(".");

    const finalCut =
      lastDotIndex !== -1 && lastDotIndex > 20 // avoid edge case like "No."
        ? trimmed.slice(0, lastDotIndex + 1) // include the period
        : trimmed + "..."; // fallback if no sentence-ending period found

    return { isShort: false, limitedText: finalCut };
  }, [product]);

  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const col3Ref = useRef(null);

  useEffect(() => {
    const handleScrollRedirect = (e) => {
      const col1 = col1Ref.current;
      const col2 = col2Ref.current;
      if (!col1 || !col2) return;

      const scrollingDown = e.deltaY > 0;

      const col2ScrollTop = col2.scrollTop;
      const col2MaxScroll = col2.scrollHeight - col2.clientHeight;
      const windowScrollTop = window.scrollY;

      if (scrollingDown) {
        // Scroll col2 first (same as before)
        if (col2ScrollTop < col2MaxScroll) {
          e.preventDefault();
          col2.scrollBy({ top: e.deltaY, behavior: "auto" });
        }
        // else let window scroll
      } else {
        // When scrolling UP, outer window (col1+3) first
        if (windowScrollTop > 0) {
          e.preventDefault();
          window.scrollBy({ top: e.deltaY, behavior: "auto" });
        } else if (col2ScrollTop > 0) {
          // Only scroll col2 after outer page is already at top
          e.preventDefault();
          col2.scrollBy({ top: e.deltaY, behavior: "auto" });
        }
      }
    };

    document.addEventListener("wheel", handleScrollRedirect, {
      passive: false,
    });
    return () => {
      document.removeEventListener("wheel", handleScrollRedirect);
    };
  }, []);

  useEffect(() => {
    // Update timestamp every minute
    const timeInterval = setInterval(() => {
      setLastUpdated("1 minute ago");
    }, 60000);

    // Change viewer count more naturally (every 8-15 seconds)
    const countInterval = setInterval(() => {
      const direction = Math.random() < 0.55 ? 1 : -1; // 55% chance to increase
      const amount = Math.floor(Math.random() * 2) + 1; // Change by 1-2

      setViewerCount((prev) => {
        const newCount = prev + direction * amount;
        return Math.max(15, Math.min(30, newCount));
      });
    }, 8000 + Math.random() * 7000); // Random interval between 8-15 seconds

    return () => {
      clearInterval(timeInterval);
      clearInterval(countInterval);
    };
  }, []);

  // Get params correctly
  const params = useParams();
  const slug = params?.slug;

  // useEffect(() => {
  //   console.log("Dynamic slug from URL:", slug);
  // }, [slug]);
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!slug) return;
      setLoading(true);

      const productSlug = Array.isArray(slug) ? slug[0] : slug;
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));

      // Retry getting a valid token
      const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const token = await getValidToken();
          if (token && typeof token === "string" && token.length > 10)
            return token;
          if (attempt === Math.floor(maxAttempts / 2))
            localStorage.removeItem("authToken");
          await wait(delay);
        }
        throw new Error("❌ Auth token unavailable after multiple retries.");
      };

      try {
        let token = await getTokenWithRetry();

        const fetchData = async (retry = false) => {
          const res = await fetch("/api/quantityCheck", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              slug: productSlug,
              id: productSlug.split("-").pop() || "",
            }),
          });

          if (res.status === 401 && !retry) {
            localStorage.removeItem("authToken");
            token = await getTokenWithRetry();
            return fetchData(true); // Retry once silently
          }

          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return await res.json();
        };

        const data = await fetchData();
        console.log("Single product data : ", data);

        // 🧠 Immediate redirect on "No Data Found"
        if (data?.status === "No Data Found") {
          // Keep spinner showing briefly before redirect for UX continuity
          setTimeout(() => {
            window.location.replace("/products");
          }, 300);
          return; // Stop everything here
        }

        if (!data?.data?.[0]) throw new Error("Product data not found");
        const p = data.data[0];

        setProduct({
          id: p.id,
          name: p.name,
          description: p.product_details || "No description available",
          price: p.price ? parseFloat(p.price.toString().replace(/,/g, "")) : 0,
          promo_price: p.promo_price
            ? parseFloat(p.promo_price.toString().replace(/,/g, ""))
            : null,
          end_date: p.end_date,
          promo_tag: p.promo_tag,
          quantity: p.quantity,
          review: p.review,
          review_count: p.review,
          category: p.category,
          brand: p.brand,
          weight: p.weight,
          dimensions: p.dimensions,
          specifications: p.specifications,
          image: p.p_image || "/placeholder-product.jpg",
          image_g: p.product_image || [],
          store_details: p.store_details || [],
          sellerproduct: p.sellerproduct || [],
          related_items: p.related_items || [],
          seller: p.seller || {},
          length: p.length || 0,
          width: p.width || 0,
          height: p.height || 0,
          weight: p.weight || 0,
          product_returnable: p.product_returnable,
          minimum_order_qty: p.minimum_order_qty,
          minimum_order_limit: p.minimum_order_limit,
          offers: p.offers,
          bogo_offer: p.bogo_offer
            ? Array.isArray(p.bogo_offer)
              ? p.bogo_offer.map((b) => ({ ...b, bogo_title: b.title }))
              : [{ ...p.bogo_offer, bogo_title: p.bogo_offer.title }]
            : [],
          variants: (p.product_variants || []).map((v) => ({
            ...v,
            variant_quantity: v.quantity,
            front_view: v.front_view || null,
            back_view: v.back_view || null,
            side_view: v.side_view || null,
            top_view: v.top_view || null,
            zoom_view: v.zoom_view || null,
          })),
        });

        setSelectedImage(p.p_image || "/placeholder-product.jpg");

        // Meta handling
        if (data.metaData) setMetaData(data.metaData);
        else if (p.meta_title || p.meta_description || p.meta_image)
          setMetaData({
            title: p.meta_title || "",
            description: p.meta_description || "",
            image: p.meta_image || "",
          });
      } catch (err) {
        console.error("[Silent Catch] Product fetch failed:", err.message);
        if (err.message !== "No Data Found")
          setError("Something went wrong loading product.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProductDetails();
  }, [slug, getValidToken]);

  // ✅ Use API-provided metaData for SEO updates
  useMetaUpdater(metaData);

  const [selectedVariants, setSelectedVariants] = useState({});

  // 🪄 Auto-reset main image whenever variant changes
  useEffect(() => {
    if (!product) return;

    // Find active variant safely
    const activeVariant =
      selectedVariants?.[product.id] ||
      (product.product_variants?.length > 0
        ? product.product_variants[0]
        : null);

    const BASE_URL = "https://marketplace.yuukke.com/assets/uploads/";

    // Collect images
    const variantImages = activeVariant
      ? [
          activeVariant.front_view,
          activeVariant.back_view,
          activeVariant.side_view,
          activeVariant.top_view,
          activeVariant.zoom_view,
        ]
          .filter(Boolean)
          .map((img) => (img.startsWith("http") ? img : `${BASE_URL}${img}`))
      : [];

    const productImages = (product.image_g || []).map((img) =>
      img.startsWith("http") ? img : `${BASE_URL}${img}`
    );

    const imagesToShow =
      variantImages.length > 0 ? variantImages : productImages;

    // 🔥 Auto update selectedImage on variant change
    if (imagesToShow.length > 0) {
      setSelectedImage(imagesToShow[0]); // pick *any* image (first one by default)
    } else {
      setSelectedImage(product.image || null);
    }
  }, [selectedVariants, product]);

  useEffect(() => {
    if (!product) return;

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      // 🟢 Default to first variant
      const firstVariant = product.variants[0];
      setSelectedVariants((prev) => ({
        ...prev,
        [product.id]: firstVariant,
      }));

      const firstVariantQty = Number(firstVariant?.variant_quantity || 1);
      setQuantity(firstVariantQty > 0 ? 1 : 0); // start with 1 if stock > 0
    } else {
      setQuantity(Number(product.minimum_order_qty) || 1);
    }
  }, [product]);

  const handleBuyNow = async () => {
    // ✅ Stock check first
    const availableQty =
      Array.isArray(product.variants) &&
      product.variants.length > 0 &&
      selectedVariants?.[product.id]
        ? Number(selectedVariants[product.id].variant_quantity || 0) // variant stock
        : Number(product.quantity || 0); // fallback to product stock

    if (!availableQty || availableQty < 1) {
      toast.error("🚫 This product is out of stock.");
      return;
    }

    if (quantity > availableQty) {
      toast.error(`🚫 Only ${availableQty} item(s) left in stock.`);
      return;
    }

    // ✅ If stock is okay, proceed
    const toastId = toast.loading("Processing your order...");
    try {
      if (!product?.id) throw new Error("No product selected");

      // 1️⃣ Get or create cart ID
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
        product_id: product.id,
        variant_id:
          Array.isArray(product.variants) && product.variants.length > 0
            ? selectedVariants?.[product.id]?.id || product.variants[0].id
            : [],
        historypincode: 614624,
        qty: quantity,
        cart_id: cartId,
      };

      // 3️⃣ Get or refresh token
      let token = localStorage.getItem("authToken");
      const fetchToken = async () => {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "admin", password: "Admin@123" }),
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

      // 4️⃣ Add to cart
      let response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Retry once if 401
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        token = await fetchToken();
        response = await fetch("/api/addcart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      // console.log("Add to cart result:", result);

      // 5️⃣ Fetch tax details
      try {
        const taxRes = await fetch("/api/getTax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: cartId }),
        });

        let taxData;
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
          taxData = await retryTaxRes.json();
        } else {
          taxData = await taxRes.json();
        }

        localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
        // console.log("💸 Tax details:", taxData);
      } catch (taxError) {
        console.error("🚫 Failed to fetch tax details:", taxError);
      }

      // 6️⃣ Redirect to checkout directly
      toast.update(toastId, {
        render: "Redirecting to checkout...",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      window.location.href = "/checkout";
    } catch (err) {
      console.error("Buy now error:", err);
      toast.update(toastId, {
        render: err.message || "Something went wrong!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getValidToken();

    const finalOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    };

    const res = await fetch(url, finalOptions);

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true);
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ TAX API ERROR RESPONSE:", res.status, errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res;
  };

  const handleAddToCart = async () => {
    if (isAdding || !product?.id) return;
    setIsAdding(true);

    // console.log("🛒 Initiating add-to-cart from single product page...");

    try {
      // Parse offers data
      let offersData = [];
      try {
        offersData = product.offers ? JSON.parse(product.offers) : [];
      } catch (e) {
        console.error("Error parsing offers:", e);
        offersData = [];
      }

      // Find matching offer
      const matchingOffer = offersData.find(
        (offer) =>
          offer.offer_qty &&
          offer.offer_price &&
          Number(offer.offer_qty) === quantity
      );

      // Get or create cart ID
      let cartId =
        localStorage.getItem("cart_id") ||
        Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cart_id", cartId);

      // Get existing cart
      const existingCart = JSON.parse(
        localStorage.getItem("cart_data") || "[]"
      );
      const existingIndex = existingCart.findIndex(
        (item) => item.id === product.id
      );

      // Validate stock
      // ✅ Decide stock dynamically
      const availableQty =
        Array.isArray(product.variants) &&
        product.variants.length > 0 &&
        selectedVariants?.[product.id]
          ? Number(selectedVariants[product.id].variant_quantity || 0) // variant stock
          : Number(product.quantity || 0); // fallback to product stock

      // ✅ Validation
      if (quantity > availableQty) {
        toast.error(`No items available in stock.`);
        setIsAdding(false);
        return;
      }

      // 🕒 Check if promo is still valid
      const isPromoValid =
        product?.promo_price &&
        product?.end_date &&
        new Date(product.end_date) > new Date();

      // Get selected variant for this product
      const selectedVariant = selectedVariants?.[product.id] || null;

      // Determine base product price with promo check
      const baseProductPrice =
        product.promo_price &&
        Number(product.promo_price) > 0 &&
        product.end_date &&
        new Date(product.end_date) > new Date() &&
        Number(product.promo_price) < Number(product.price)
          ? Number(product.promo_price)
          : Number(product.price);

      // Variant price (added on top of base)
      const variantPrice = selectedVariant
        ? Number(selectedVariant.price || 0)
        : 0;

      // Final price
      const totalPrice = baseProductPrice + variantPrice;

      // Debug log
      // console.log("💰 Price Debug:", {
      //   baseProductPrice,
      //   variantPrice,
      //   totalPrice,
      // });

      // ✅ Calculate final price with proper checks
      const finalPrice = matchingOffer
        ? Number(matchingOffer.offer_price) / quantity
        : isPromoValid
        ? Number(product.promo_price)
        : totalPrice;

      // 🐞 Debug log
      // console.log("💰 Price Calculation Debug:", {
      //   matchingOffer: matchingOffer ? matchingOffer.offer_price : null,
      //   promo_price: product?.promo_price,
      //   promo_end_date: product?.end_date,
      //   isPromoValid,
      //   totalPrice,
      //   quantity,
      //   finalPrice,
      // });

      // Create cart item
      const cartItem = {
        id: product.id,
        name: product.name,
        qty: quantity,
        price: finalPrice,
        image: product.image,
        ...(matchingOffer && {
          isOffer: true,
          offerTotal: Number(matchingOffer.offer_price),
        }),
      };

      // Update cart (replace if offer, otherwise add/update)
      const updatedCart =
        existingIndex >= 0
          ? matchingOffer
            ? [
                ...existingCart.slice(0, existingIndex),
                cartItem,
                ...existingCart.slice(existingIndex + 1),
              ]
            : existingCart.map((item, i) =>
                i === existingIndex
                  ? { ...item, qty: quantity, price: finalPrice }
                  : item
              )
          : [...existingCart, cartItem];

      // IMMEDIATELY update localStorage and state
      localStorage.setItem("cart_data", JSON.stringify(updatedCart));
      setCartItems(updatedCart);

      // Rest of your API calls...
      const token = await getValidToken();
      if (!token) {
        toast.error("🔐 Login required to add item to cart.");
        return;
      }

      const payload = {
        selected_country: "IN",
        product_id: product.id,
        historypincode: 614624,
        variant_id:
          Array.isArray(product.variants) && product.variants.length > 0
            ? selectedVariants?.[product.id]?.id || product.variants[0].id // ✅ variant id if available
            : [], // ✅ no variants → empty array
        qty: quantity,
        cart_id: cartId,
        ...(matchingOffer && {
          is_offer: true,
          offer_price: matchingOffer.offer_price,
        }),
      };

      // console.log("2.Variant ID :", payload.variant_id);

      const response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.error("⚠️ Session expired. Please login again.");
        return;
      }

      const result = await response.json();
      // console.log("✅ Synced with backend cart:", result);

      // Update tax details
      try {
        const taxRes = await fetch("/api/getTax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: cartId }),
        });
        const taxData = await taxRes.json();
        localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
        // console.log("taxData:", taxData);
      } catch (taxError) {
        console.error("🚫 Failed to fetch tax details:", taxError);
      }

      setIsCartOpen?.(true);
      toast.success("🛒 Added to cart!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("💥 Add to cart failed:", err);
      toast.error("Something went wrong!");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddOfferToCart = async (offer) => {
    if (isAdding || !product?.id || !offer?.offer_qty || !offer?.offer_price)
      return;
    setIsAdding(true);

    try {
      const offerQty = Number(offer.offer_qty);
      const offerPrice = Number(offer.offer_price);

      // Get or create cart ID
      let cartId =
        localStorage.getItem("cart_id") ||
        Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cart_id", cartId);

      // Get existing cart
      const existingCart = JSON.parse(
        localStorage.getItem("cart_data") || "[]"
      );
      const existingIndex = existingCart.findIndex(
        (item) => item.id === product.id
      );

      // Validate stock
      const maxQty = product.quantity || 0;
      if (offerQty > maxQty) {
        toast.error(`Only ${maxQty} items available in stock.`);
        setIsAdding(false);
        return;
      }

      // Create offer item
      const preparedCartItem = {
        id: product.id,
        name: product.name,
        qty: offerQty,
        price: offerPrice / offerQty, // ✅ correct per-unit price
        image: product.image,
        isOffer: true,
        offerTotal: offerPrice,
        variant_id:
          selectedVariants?.[product.id]?.id ||
          (product.variants?.length > 0 ? product.variants[0].id : null),
      };

      // ALWAYS replace existing item for offers
      const updatedCart =
        existingIndex >= 0
          ? [
              ...existingCart.slice(0, existingIndex),
              preparedCartItem,
              ...existingCart.slice(existingIndex + 1),
            ]
          : [...existingCart, preparedCartItem];

      // 💾 Update localStorage and state
      localStorage.setItem("cart_data", JSON.stringify(updatedCart));
      setCartItems(updatedCart);

      // Rest of API calls...
      const token = await getValidToken();
      if (!token) {
        toast.error("🔐 Login required to add item to cart.");
        return;
      }

      const payload = {
        selected_country: "IN",
        product_id: product.id,
        historypincode: 614624,
        variant_id:
          Array.isArray(product.variants) && product.variants.length > 0
            ? selectedVariants?.[product.id]?.id || product.variants[0].id
            : [],
        qty: offerQty,
        cart_id: cartId,
        is_offer: true,
        offer_price: offer.offer_price,
      };

      const response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.error("⚠️ Session expired. Please login again.");
        return;
      }

      const result = await response.json();

      // Update tax details
      try {
        const taxRes = await fetch("/api/getTax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: cartId }),
        });
        const taxData = await taxRes.json();
        localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
      } catch (taxError) {
        console.error("🚫 Failed to fetch tax details:", taxError);
      }

      setIsCartOpen?.(true);
      toast.success("✅ Offer added to cart!");
    } catch (err) {
      console.error("💥 Add offer to cart failed:", err);
      toast.error("Something went wrong!");
    } finally {
      setIsAdding(false);
    }
  };

  // Extract gallery images from HTML string if available
  const allImages = [
    product?.image,
    ...(product?.product_image
      ? (product.product_image.match(/src="([^"]+)"/g) || [])
          .map((src) => src.replace(/src="|"/g, ""))
          .filter((url) => url.trim() !== "")
      : []),
  ].filter(Boolean);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Link
          href="/"
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        <ToastContainer position="bottom-right" />
      </div>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const getImageSrcThumbs = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/thumbs/${image}`;
  };

  // Main product display
  return (
    <div className="min-h-screen relative">
      <ToastContainer position="bottom-right" />

      {/* Breadcrumb Navigation */}
      <nav className="bg-white py-4 px-6 shadow-sm">
        <div className="container mx-auto">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-[#A00300] hover:underline">
                {t("Home")}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <Link href="/products" className="text-[#A00300] hover:underline">
                {t("Products")}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li className="text-gray-600 line-clamp-1">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* Product Content - Full width layout */}
      <div className="w-full flex flex-col lg:flex-row h-auto lg:h-screen overflow-hidden mt-8">
        {/* Column 1 - Image Gallery (40%) - Fixed */}
        <div
          ref={col1Ref}
          className="w-full lg:w-[40%] lg:sticky top-0 overflow-hidden order-1"
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
            {/* 📱 Mobile Product Info Section */}
            <div className="md:hidden flex flex-col gap-4 px-4 bg-white">
              {/* ✅ Quantity / Stock Status */}
              <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto scrollbar-hide">
                {(() => {
                  const currentQuantity =
                    product.variants.length > 0
                      ? Number(
                          selectedVariants?.[product.id]?.quantity ??
                            product.variants[0]?.quantity ??
                            0
                        )
                      : Number(product?.quantity);

                  if (currentQuantity > 0) {
                    return (
                      <>
                        <Package className="w-4 h-4 text-[#a00300] flex-shrink-0" />
                        <span className="font-medium text-gray-700">
                          Hurry! Only{" "}
                          <span className="text-[#a00300] font-bold">
                            {Math.floor(currentQuantity)}
                          </span>{" "}
                          left in stock!
                        </span>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <Ban className="w-4 h-4 text-red-700 flex-shrink-0" />
                        <span className="font-medium text-red-700">
                          Out of Stock
                        </span>
                      </>
                    );
                  }
                })()}
              </div>

              {/* ⏰ Promo Tag */}
              {product.promo_tag && (
                <div>
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-sm font-bold px-2 py-[2px] rounded-tl-lg rounded-br-lg shadow-md">
                    <Clock className="w-4 h-4 text-white" />
                    {product.promo_tag}
                  </span>
                </div>
              )}

              {/* 🏷️ Product Name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase">
                {product.name}
              </h1>

              {/* 📦 Minimum Order Quantity */}
              {Number(product.minimum_order_limit) === 1 &&
                Number(product.minimum_order_qty) > 0 && (
                  <div>
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#ad0000] to-[#e30f00] text-white text-sm font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                      <span className="text-white font-semibold capitalize">
                        {t("minimum order quantity")}:
                      </span>
                      {product.minimum_order_qty}
                    </span>
                  </div>
                )}

              {/* ⭐ BOGO Tag with Flash */}
              {product.bogo_offer && product.bogo_offer.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-2 ">
                  {product.bogo_offer.map((b, idx) => (
                    <div key={idx} className="relative inline-block font-odop">
                      {/* Badge */}
                      <span className="bogo-badge inline-flex items-center gap-1 bg-gradient-to-r from-black to-gray-900 text-white text-md font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                        {b.title || "Special BOGO!"}
                      </span>

                      {/* Flash overlay */}
                      <span className="bogo-flash absolute top-0 left-0 w-full h-full rounded-tr-lg rounded-bl-lg"></span>
                    </div>
                  ))}
                </div>
              )}

              {/* 📂 Category */}
              {product.category && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 uppercase">
                    {t("Category")}:
                  </span>
                  <span className="text-sm font-semibold text-[#A00300] tracking-wide">
                    {product.category}
                  </span>
                </div>
              )}
            </div>

            {/* 🧭 Vertical Thumbnails (Desktop Only) */}
            {(() => {
              const BASE_URL = "https://marketplace.yuukke.com/assets/uploads/";

              // 1. Find active variant
              const activeVariant =
                selectedVariants?.[product.id] ||
                (product.product_variants?.length > 0
                  ? product.product_variants[0]
                  : null);

              // 2. Collect variant images
              const variantImages = activeVariant
                ? [
                    activeVariant.front_view,
                    activeVariant.back_view,
                    activeVariant.side_view,
                    activeVariant.top_view,
                    activeVariant.zoom_view,
                  ]
                    .filter(Boolean)
                    .map((img) =>
                      img.startsWith("http") ? img : `${BASE_URL}${img}`
                    )
                : [];

              // 3. Collect product-level images
              const productImages = (product.image_g || []).map((img) =>
                img.startsWith("http") ? img : `${BASE_URL}${img}`
              );

              // 4. Decide which to show
              const imagesToShow =
                variantImages.length > 0 ? variantImages : productImages;

              if (imagesToShow.length === 0) return null;

              return (
                <>
                  {/* Desktop Thumbnails */}
                  <div className="hidden lg:block w-20 flex-shrink-0 ml-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 sr-only">
                      Thumbnails
                    </h3>
                    <div className="flex flex-col gap-3 h-[calc(100vh-160px)] overflow-y-auto py-2 scrollbar-hide">
                      {imagesToShow.map((img, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-full aspect-square rounded-md overflow-hidden border-2 transition-all ${
                            selectedImage === img
                              ? "border-[#A00300]"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* 📸 Main Image */}
                  <div className="w-full lg:flex-1 flex flex-col px-4 lg:px-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedImage || "default"}
                        className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={
                            selectedImage ||
                            (variantImages.length > 0
                              ? variantImages[0]
                              : productImages.length > 0
                              ? productImages[0]
                              : product.image)
                          }
                          alt={product?.name || "Product image"}
                          fill
                          className="object-contain"
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* 📱 Horizontal Thumbnails for Mobile */}
                    {imagesToShow.length > 0 && (
                      <div className="mt-4 lg:hidden">
                        <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
                          {imagesToShow.map((img, index) => (
                            <motion.button
                              key={index}
                              onClick={() => setSelectedImage(img)}
                              whileHover={{ scale: 1.05 }}
                              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                                selectedImage === img
                                  ? "border-[#A00300]"
                                  : "border-transparent hover:border-gray-300"
                              }`}
                            >
                              <Image
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>{" "}
          {/*Mob Price Section */}
          <div className="space-y-4 px-4 mt-2" translate="no">
            <div className="items-end gap-3 md:hidden flex">
              <div className="flex items-baseline gap-1">
                <IndianRupee className="w-6 h-6 text-[#A00300]" />
                <span className="text-4xl font-bold text-[#A00300]">
                  {(() => {
                    const basePrice =
                      product.promo_price &&
                      Number(product.promo_price) > 0 &&
                      product.end_date &&
                      new Date(product.end_date) > new Date() &&
                      Number(product.promo_price) < Number(product.price)
                        ? Number(product.promo_price)
                        : Number(product.price);

                    const variantPrice = selectedVariants?.[product.id]?.price
                      ? Number(selectedVariants[product.id].price)
                      : product.variants.length > 0
                      ? Number(product.variants[0].price) // ✅ fallback to 0th
                      : 0;

                    return (basePrice + variantPrice).toFixed(2);
                  })()}
                </span>
              </div>

              {/* Show original price with strike-through if promo is valid */}
              {product.promo_price &&
                Number(product.promo_price) > 0 &&
                product.end_date &&
                new Date(product.end_date) > new Date() &&
                Number(product.promo_price) < Number(product.price) && (
                  <div className="items-center gap-1 hidden md:flex">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    <span className="text-xl text-gray-500 line-through">
                      {Number(product.price).toFixed(2)}
                    </span>
                  </div>
                )}
            </div>

            {/* Discount badge */}
            {Number(product.promo_price) > 0 &&
              Number(product.promo_price) < Number(product.price) &&
              product.end_date &&
              new Date(product.end_date) > new Date() && (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <span className="font-medium">
                      {Math.round(
                        ((Number(product.price) - Number(product.promo_price)) /
                          Number(product.price)) *
                          100
                      )}
                      {t("% OFF")}
                    </span>
                  </div>
                </div>
              )}

            {/* 🎨 Variants Color Selector */}
            {product.variants.length > 0 && (
              <div className="hidden lg:flex items-center gap-3 ">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap uppercase">
                  Colours:
                </label>

                <div className="flex gap-3">
                  {product.variants.map((variant) => {
                    const isSelected =
                      selectedVariants?.[product.id]?.id === variant.id ||
                      (!selectedVariants?.[product.id] &&
                        variant.id === product.variants[0]?.id);

                    return (
                      <button
                        key={variant.id}
                        onClick={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [product.id]: variant,
                          }))
                        }
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          isSelected
                            ? "border-[#A00300] scale-110"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{
                          backgroundColor: variant.color || "#ccc",
                        }}
                        aria-label={`Select ${variant.name}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* 🎨 Mob Variants Color Selector */}
          {product.variants.length > 0 && (
            <div className="flex md:hidden items-center gap-3 px-4 mb-2 mt-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap uppercase">
                Colours:
              </label>

              <div className="flex gap-3">
                {product.variants.map((variant) => {
                  const isSelected =
                    selectedVariants?.[product.id]?.id === variant.id ||
                    (!selectedVariants?.[product.id] &&
                      variant.id === product.variants[0]?.id);

                  return (
                    <button
                      key={variant.id}
                      onClick={() =>
                        setSelectedVariants((prev) => ({
                          ...prev,
                          [product.id]: variant,
                        }))
                      }
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        isSelected
                          ? "border-[#A00300] scale-110"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{
                        backgroundColor: variant.color || "#ccc",
                      }}
                      aria-label={`Select ${variant.name}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Column 2 - Product Details (35%) - Scrollable */}
        <div
          ref={col2Ref}
          className="w-full lg:w-[35%] px-4 py-0 overflow-visible lg:overflow-y-auto scrollbar-hide order-3 lg:order-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="py-0 px-4">
            <div className="space-y-6">
              {/* Quantity Count */}
              <div className="hidden md:flex items-center mb-3">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  {(() => {
                    // ✅ Variant-aware quantity logic
                    const currentQuantity =
                      product.variants.length > 0
                        ? Number(
                            selectedVariants?.[product.id]?.quantity ??
                              product.variants[0]?.quantity ??
                              0
                          )
                        : Number(product?.quantity);

                    if (currentQuantity > 0) {
                      return (
                        <>
                          <Package className="w-4 h-4 text-[#a00300] flex-shrink-0" />
                          <span className="font-medium text-gray-700 mt-0.5">
                            Hurry! Only{" "}
                            <span className="text-[#a00300] font-bold">
                              {Math.floor(currentQuantity)}
                            </span>{" "}
                            left in stock!
                          </span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <Ban className="w-4 h-4 text-red-700 flex-shrink-0" />
                          <span className="font-medium text-red-700">
                            Out of Stock
                          </span>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Product Name & Category */}
              <div className="">
                {product.promo_tag && (
                  <div>
                    <span className="hidden md:inline-flex items-center gap-1 bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-sm font-bold px-2 py-[2px] rounded-tl-lg rounded-br-lg shadow-md">
                      <Clock className="w-4 h-4 text-white" />
                      {product.promo_tag}
                    </span>
                  </div>
                )}

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase hidden md:flex">
                  {product.name}
                </h1>

                {Number(product.minimum_order_limit) === 1 &&
                  Number(product.minimum_order_qty) > 0 && (
                    <div className="mt-2 mb-2 hidden md:flex">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#ad0000] to-[#e30f00] text-white text-sm font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                        <span className="text-white font-semibold capitalize">
                          {t("minimum order quantity")}:
                        </span>
                        {product.minimum_order_qty}
                      </span>
                    </div>
                  )}

                {product.category && (
                  <div className="mt-2 items-center gap-2 hidden md:flex">
                    <span className="text-sm font-medium text-gray-500 uppercase">
                      {t("Category")}:
                    </span>
                    <span className="text-sm font-semibold text-[#A00300] tracking-wide">
                      {product.category}
                    </span>
                  </div>
                )}

                {/* ⭐ BOGO Tag with Flash */}
                {product.bogo_offer && product.bogo_offer.length > 0 && (
                  <div className="hidden md:flex flex-wrap gap-2 mt-2 mb-2 ">
                    {product.bogo_offer.map((b, idx) => (
                      <div
                        key={idx}
                        className="relative inline-block font-odop"
                      >
                        {/* Badge */}
                        <span className="bogo-badge inline-flex items-center gap-1 bg-gradient-to-r from-black to-gray-900 text-white text-md font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                          {b.title || "Special BOGO!"}
                        </span>

                        {/* Flash overlay */}
                        <span className="bogo-flash absolute top-0 left-0 w-full h-full rounded-tr-lg rounded-bl-lg"></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-4" translate="no">
                <div className="items-end gap-3 hidden md:flex">
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="w-6 h-6 text-[#A00300]" />
                    <span className="text-4xl font-bold text-[#A00300]">
                      {(() => {
                        const basePrice =
                          product.promo_price &&
                          Number(product.promo_price) > 0 &&
                          product.end_date &&
                          new Date(product.end_date) > new Date() &&
                          Number(product.promo_price) < Number(product.price)
                            ? Number(product.promo_price)
                            : Number(product.price);

                        const variantPrice = selectedVariants?.[product.id]
                          ?.price
                          ? Number(selectedVariants[product.id].price)
                          : product.variants.length > 0
                          ? Number(product.variants[0].price) // ✅ fallback to 0th
                          : 0;

                        return (basePrice + variantPrice).toFixed(2);
                      })()}
                    </span>
                  </div>

                  {/* Show original price with strike-through if promo is valid */}
                  {product.promo_price &&
                    Number(product.promo_price) > 0 &&
                    product.end_date &&
                    new Date(product.end_date) > new Date() &&
                    Number(product.promo_price) < Number(product.price) && (
                      <div className="items-center gap-1 hidden md:flex">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <span className="text-xl text-gray-500 line-through">
                          {Number(product.price).toFixed(2)}
                        </span>
                      </div>
                    )}
                </div>

                {/* Discount badge */}
                {Number(product.promo_price) > 0 &&
                  Number(product.promo_price) < Number(product.price) &&
                  product.end_date &&
                  new Date(product.end_date) > new Date() && (
                    <div className="hidden md:flex items-center gap-3">
                      <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <span className="font-medium">
                          {Math.round(
                            ((Number(product.price) -
                              Number(product.promo_price)) /
                              Number(product.price)) *
                              100
                          )}
                          {t("% OFF")}
                        </span>
                      </div>
                    </div>
                  )}

                {/* 🎨 Variants Color Selector */}
                {product.variants.length > 0 && (
                  <div className="hidden lg:flex items-center gap-3 ">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap uppercase">
                      Colours:
                    </label>

                    <div className="flex gap-3">
                      {product.variants.map((variant) => {
                        const isSelected =
                          selectedVariants?.[product.id]?.id === variant.id ||
                          (!selectedVariants?.[product.id] &&
                            variant.id === product.variants[0]?.id);

                        return (
                          <button
                            key={variant.id}
                            onClick={() =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [product.id]: variant,
                              }))
                            }
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              isSelected
                                ? "border-[#A00300] scale-110"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            style={{
                              backgroundColor: variant.color || "#ccc",
                            }}
                            aria-label={`Select ${variant.name}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Highlights */}
              {/* <div
                className={`grid gap-4 mt-6 ${
                  product.product_returnable?.toLowerCase() === "yes"
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2"
                }`}
              >
                {[
                  ...(product.product_returnable?.toLowerCase() === "yes"
                    ? [
                        {
                          icon: <Undo2 className="w-6 h-6 text-[#A00300]" />,
                          title: t("Easy Returns"),
                        },
                      ]
                    : []),
                  {
                    icon: <BadgeCheck className="w-6 h-6 text-[#A00300]" />,
                    title: t("High Quality"),
                  },
                  {
                    icon: <Tag className="w-6 h-6 text-[#A00300]" />,
                    title: t("Lowest Price"),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center p-6 bg-pink-50 rounded-md text-center shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="mb-2">{item.icon}</div>
                    <p className="text-sm font-semibold text-gray-800">
                      {t(item.title)}
                    </p>
                  </div>
                ))}
              </div> */}

              {/* Offers Section */}
              {product.offers &&
                (() => {
                  let offersData = [];
                  try {
                    offersData = JSON.parse(product.offers || "[]");
                  } catch (e) {
                    console.error("❌ Invalid offers JSON:", product.offers);
                  }

                  const validOffers = offersData.filter(
                    (offer) =>
                      offer.offer_label || offer.offer_qty || offer.offer_price
                  );

                  return (
                    validOffers.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-[#a00300] mb-3 uppercase italic">
                          Available Offers
                        </h3>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 cursor-pointer">
                          {/* Single product card (Base 1x offer with variant price) */}
                          <div className="relative p-6 bg-white border border-gray-300 hover:border-orange-500 rounded-md text-center shadow-sm hover:shadow-md transition-all">
                            <p className="text-lg font-bold text-gray-800">
                              Set of 1
                            </p>
                            <p className="mt-1 text-gray-700 font-medium">
                              ₹
                              {(() => {
                                // ✅ Base price check (promo or normal)
                                const basePrice =
                                  product.promo_price &&
                                  Number(product.promo_price) > 0 &&
                                  product.end_date &&
                                  new Date(product.end_date) > new Date() &&
                                  Number(product.promo_price) <
                                    Number(product.price)
                                    ? Number(product.promo_price)
                                    : Number(product.price);

                                // ✅ Add variant adjustment (same as Price Section)
                                const variantPrice = selectedVariants?.[
                                  product.id
                                ]?.price
                                  ? Number(selectedVariants[product.id].price)
                                  : product.variants.length > 0
                                  ? Number(product.variants[0].price)
                                  : 0;

                                return (basePrice + variantPrice).toFixed(2);
                              })()}
                              <span className="text-gray-500 text-sm">
                                {" "}
                                / piece
                              </span>
                            </p>
                          </div>

                          {/* Dynamic offers */}
                          {validOffers.map((offer, index) => (
                            <div
                              key={index}
                              className="relative p-6 bg-orange-50 border rounded-md text-center shadow-sm border-orange-500 hover:shadow-md transition-all"
                              onClick={() => handleAddOfferToCart(offer)}
                            >
                              {offer.offer_label && (
                                <span className="absolute -top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded shadow">
                                  {offer.offer_label}
                                </span>
                              )}
                              <p className="text-lg font-bold text-gray-800">
                                Set of {offer.offer_qty}
                              </p>
                              <p className="mt-1 text-gray-700 font-medium">
                                ₹{offer.offer_price}
                                <span className="text-gray-500 text-sm">
                                  {" "}
                                  /{" "}
                                  {offer.offer_qty > 1
                                    ? `${offer.offer_qty} pieces`
                                    : "piece"}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  );
                })()}

              {/* <div className="border border-gray-200 mb-6 rounded-lg overflow-hidden">
                <table className="min-w-full text-sm text-left text-gray-900">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 font-semibold bg-gray-50 w-1/3">
                        {t("Dimension")}
                      </th>
                      <td className="px-4 py-2">
                        {t("Length")} - {Math.floor(product.length) ?? "N/A"} cm
                        | {t("Width")} - {Math.floor(product.width) ?? "N/A"} cm
                        | {t("Height")} - {Math.floor(product.height) ?? "N/A"}{" "}
                        cm
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 font-semibold bg-gray-50">
                        {t("Weight")}
                      </th>
                      <td className="px-4 py-2">{product.weight} kg</td>
                    </tr>
                  </tbody>
                </table>
              </div> */}
              {/* specifications */}
              {product?.specifications &&
                (() => {
                  let specs = [];
                  try {
                    specs = JSON.parse(product.specifications || "[]");
                  } catch (e) {
                    console.error(
                      "❌ Invalid specifications JSON:",
                      product.specifications
                    );
                  }

                  const validSpecs = specs.filter(
                    (s) => s?.name && s?.value && s.value.trim() !== ""
                  );

                  return (
                    validSpecs.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-sm font-medium text-gray-500 uppercase pb-2 border-b border-gray-200 italic">
                          {t("Specifications")}
                        </h3>
                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-4">
                          <table className="w-full text-sm text-gray-700 border-collapse">
                            <tbody>
                              {validSpecs.map((spec, idx) => (
                                <tr
                                  key={idx}
                                  className={`${
                                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  } border-b last:border-none`}
                                >
                                  <th className="px-4 py-3 font-medium text-gray-900 w-1/3 capitalize">
                                    {t(spec.name)}
                                  </th>
                                  <td className="px-4 py-3 border-l border-gray-200">
                                    {spec.value}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  );
                })()}

              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center uppercase">
                  <Info className="w-5 h-5 text-[#A00300] mr-1 mb-1" />
                  {t("Product Details")}
                </h3>
                <div className="prose prose-lg max-w-none">
                  {isShort ? (
                    <div
                      className="text-gray-700 space-y-4 text-justify"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : showFullDesc ? (
                    <>
                      <div
                        className="text-gray-700 space-y-4 text-justify"
                        dangerouslySetInnerHTML={{
                          __html: product.description,
                        }}
                      />
                      <button
                        onClick={() => setShowFullDesc(false)}
                        className="mt-2 text-sm text-[#A00300] font-medium hover:underline flex items-center"
                      >
                        {t("Read Less")}
                        <ChevronUp className="w-4 h-4 ml-1" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-700 space-y-4 text-justify">
                        {limitedText}
                      </div>
                      <button
                        onClick={() => setShowFullDesc(true)}
                        className="mt-2 text-sm text-[#A00300] font-medium hover:underline flex items-center"
                      >
                        {t("Read More")}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                    </>
                  )}
                </div>

                {/* Static Badges */}
                <div className="grid grid-cols-3 gap-x-2  mt-4">
                  {["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"].map(
                    (img, i) => (
                      <div
                        key={i}
                        className="flex justify-center items-center p-2"
                      >
                        <Image
                          src={`/${img}`}
                          alt={`image ${i + 1}`}
                          width={300}
                          height={300}
                          className="object-cover"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Enquire Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center uppercase">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-[#A00300] mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.42 9.42 0 01-3.945-.84L3 20l1.454-3.637A7.964 7.964 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {t("Enquire")}
                </h3>

                <p className="text-gray-700 text-sm mb-4 text-center">
                  Have questions or want to place{" "}
                  <span className="font-semibold">bulk orders</span>?
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={handleEnquire}
                    className="px-8 py-2 border-2 border-black dark:border-white uppercase bg-white text-black 
            transition duration-200 text-sm 
            shadow-lg"
                  >
                    Enquire Now
                  </button>
                </div>

                <AnimatePresence>
                  {showPopupenq && (
                    <motion.div
                      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 font-odop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative border border-gray-200"
                        initial={{ scale: 0.8, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{
                          type: "spring",
                          stiffness: 150,
                          damping: 18,
                        }}
                      >
                        <h2 className="text-lg font-semibold mb-3 text-center text-gray-900">
                          Send Your Enquiry
                        </h2>

                        <textarea
                          value={sms}
                          onChange={(e) => setSms(e.target.value)}
                          placeholder="Type your enquiry..."
                          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none 
            focus:ring-2 focus:ring-black focus:border-transparent resize-none shadow-inner"
                          rows={4}
                        ></textarea>

                        <div className="flex justify-end gap-3 mt-5">
                          <motion.button
                            onClick={() => setShowPopupenq(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
                          >
                            Cancel
                          </motion.button>

                          <motion.button
                            disabled={loadingenq || !sms.trim()}
                            whileHover={
                              !loadingenq && sms.trim() ? { scale: 1.05 } : {}
                            }
                            whileTap={
                              !loadingenq && sms.trim() ? { scale: 0.95 } : {}
                            }
                            onClick={handleSubmit}
                            className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-900 
              disabled:opacity-50 transition"
                          >
                            {loadingenq ? "Sending..." : "Submit"}
                          </motion.button>
                        </div>

                        <button
                          onClick={() => setShowPopupenq(false)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Store Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center uppercase">
                  <Store className="w-5 h-5 text-[#A00300] mr-2" />
                  {t("Sold By")}
                </h3>

                <Link
                  href={{
                    pathname: "/products",
                    query: {
                      warehouses_id: product.store_details?.[0]?.slug || "",
                    },
                  }}
                  passHref
                >
                  <div className="bg-[#fcfcfc] rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
                    {product.store_details?.[0]?.store_logo && (
                      <div className="w-full h-[320px] bg-gray-50 flex items-center justify-center px-6">
                        <Image
                          src={`https://marketplace.yuukke.com/assets/uploads/${product.store_details[0].store_logo}`}
                          alt={
                            product.store_details[0].company_name ||
                            "Store logo"
                          }
                          width={640}
                          height={519}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}

                    <div className="p-6 text-center">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {product.store_details?.[0]?.company_name ||
                          "Seller Information"}
                      </h4>

                      {product.store_details?.[0]?.address && (
                        <div className="text-sm text-gray-600 mt-2">
                          <p className="flex items-center justify-center">
                            <MapPin className="w-4 h-4 mr-1 text-[#A00300]" />
                            {product.store_details[0].city},{" "}
                            {product.store_details[0].state},{" "}
                            {product.store_details[0].country}
                          </p>
                        </div>
                      )}

                      {(() => {
                        const type = product.seller?.business_type;

                        if (type === "2") {
                          return (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
                              <span className="text-sm font-medium text-green-600">
                                {t("Verified Seller")}
                              </span>
                            </div>
                          );
                        }

                        if (type === "3") {
                          return (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5 mr-2 text-[#A00300]" />
                              <span className="text-sm font-medium text-[#A00300]">
                                {t("Premium Seller")}
                              </span>
                            </div>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Related Products */}
              {product.sellerproduct?.length > 0 && (
                <div className="border-t border-gray-200 pt-6 pb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center uppercase">
                    <Package className="w-5 h-5 text-[#A00300] mr-2" />
                    {t("More from this Seller")}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {product.sellerproduct.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        className="group"
                      >
                        <div className="relative flex flex-col h-full">
                          {item?.promo_price !== null &&
                            item?.promo_price !== undefined &&
                            !isNaN(Number(item.promo_price)) &&
                            Number(item.promo_price) > 0 &&
                            Number(item.promo_price) < Number(item.price) &&
                            item?.end_date &&
                            new Date(item.end_date).getTime() > Date.now() && (
                              <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-[2px] rounded z-10">
                                {Math.round(
                                  ((Number(item.price) -
                                    Number(item.promo_price)) /
                                    Number(item.price)) *
                                    100
                                )}
                                {t("% OFF")}
                              </div>
                            )}

                          <div className="relative aspect-square bg-gray-50">
                            <Image
                              src={`https://marketplace.yuukke.com/assets/uploads/${item.image}`}
                              alt={item.name}
                              fill
                              className="object-cover w-full h-full transition-opacity group-hover:opacity-85"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 20vw"
                            />
                          </div>

                          <div className="p-3 flex flex-col justify-between h-full">
                            <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                              {item.name}
                            </h4>

                            <div
                              className="flex items-center gap-1 text-sm text-gray-800 mt-auto leading-tight"
                              translate="no"
                            >
                              <IndianRupee className="w-4 h-4 text-[#A00300]" />

                              {item.promo_price !== null &&
                              item.promo_price !== undefined &&
                              item.end_date &&
                              new Date(item.end_date) > new Date() &&
                              Number(item.promo_price) > 0 &&
                              Number(item.promo_price) < Number(item.price) ? (
                                <>
                                  <span className="font-semibold text-[#A00300]">
                                    {Number(item.promo_price).toFixed(2)}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    {Number(item.price).toFixed(0)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-semibold text-[#A00300]">
                                  {Number(item.price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3 - Actions (25%) */}
        <div
          ref={col3Ref}
          className="w-full lg:w-[25%] bg-white px-4 py-6 border-t lg:border-t-0 lg:border-l border-gray-100 order-2 lg:order-3"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-lg text-[#A00300] font-medium uppercase">
                {t("Quantity")}:
              </span>
              <div className="relative w-24">
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="appearance-none w-full py-1 px-3 pr-6 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#A00300] focus:border-[#A00300] bg-white cursor-pointer max-h-[200px] scrollbar-hide overflow-y-auto"
                >
                  {(() => {
                    const minQty =
                      Number(product?.minimum_order_limit) === 1
                        ? Number(product?.minimum_order_qty) || 1
                        : 1;

                    const availableQty =
                      product.variants?.length > 0 &&
                      selectedVariants?.[product.id]
                        ? Number(
                            selectedVariants[product.id].variant_quantity || 0
                          )
                        : Number(product.quantity) || 0;

                    // 🧮 Always show 10 options starting from minQty
                    const maxQty = Math.min(
                      availableQty > 0 ? availableQty : minQty + 9,
                      minQty + 9
                    );

                    return Array.from(
                      { length: maxQty - minQty + 1 },
                      (_, i) => minQty + i
                    ).map((val) => (
                      <option
                        key={val}
                        value={val}
                        disabled={val > availableQty && availableQty !== 0}
                        className={val > availableQty ? "text-gray-400" : ""}
                      >
                        {val}
                      </option>
                    ));
                  })()}
                </select>

                <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 🛒 Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col gap-3">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`group relative w-full overflow-hidden rounded-lg py-3 px-4 font-bold shadow-none border border-black transition-all duration-300 ease-in-out cursor-pointer ${
                    isAdding
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-transparent"
                  }`}
                  style={{ isolation: "isolate" }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-white">
                    <ShoppingCart className="w-5 h-5" />
                    {isAdding ? t("Adding...") : t("Add to Cart")}
                  </span>
                  <span
                    className="absolute left-0 top-0 h-full w-0 bg-black transition-all duration-300 ease-in-out group-hover:w-full z-[1] rounded-lg"
                    style={{
                      transitionProperty: "width, background-color",
                      willChange: "width",
                    }}
                  />
                  <span className="absolute inset-0 z-[-1] rounded-lg border border-transparent group-hover:border-white" />
                </button>

                {/* Buy Now */}

                <button
                  onClick={handleBuyNow}
                  className={`group relative w-full overflow-hidden rounded-lg py-3 px-4 font-bold shadow-none border border-white transition-all duration-300 ease-in-out hover:border-transparent cursor-pointer`}
                  style={{ isolation: "isolate" }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-black text-white">
                    <CreditCard className="w-5 h-5" />
                    {t("Buy Now")}
                  </span>
                  <span
                    className="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-300 ease-in-out group-hover:w-full z-[1] rounded-lg"
                    style={{
                      transitionProperty: "width, background-color",
                      willChange: "width",
                    }}
                  />
                  <span className="absolute inset-0 z-[-1] rounded-lg border border-transparent group-hover:border-black bg-black" />
                </button>
              </div>

              <WishlistButton productId={product.id} variant="full" />
            </div>

            {/* 📍 Delivery Location */}
            <div className="relative">
              {/* 📍 Delivery Location */}
              <div>
                <div className="text-sm text-gray-700 font-medium flex items-center justify-between">
                  <span>{t("Delivery to")}</span>
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-1 text-[#A00300] text-xs hover:underline cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" />
                    {t("Update Location")}
                  </button>
                </div>
                <p
                  className={`text-sm mt-1 ${
                    locationUpdated
                      ? "text-green-700 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {city} {pincode}
                </p>
              </div>

              {/* 📦 Pincode Popup */}
              {showPopup && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50 w-72">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {t("Update Delivery Location")}
                    </h3>
                    <button onClick={handleClose}>
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A00300]"
                    placeholder="Enter 6-digit pincode"
                  />

                  <button
                    onClick={handleSave}
                    className="mt-3 w-full bg-[#A00300] text-white text-sm font-semibold py-2 rounded-md hover:bg-[#880200] transition"
                  >
                    {t("Save")}
                  </button>
                </div>
              )}
            </div>

            {/* 🚚 Shipping Info (Optional) */}
            {/*
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        Shipping Information
      </h3>
      <ul className="space-y-3 text-sm text-gray-600">
        <li className="flex items-start gap-2">
          <Truck className="w-4 h-4 mt-0.5 text-[#A00300]" />
          <span>Free shipping on orders over ₹500</span>
        </li>
        <li className="flex items-start gap-2">
          <Clock className="w-4 h-4 mt-0.5 text-[#A00300]" />
          <span>Delivery in 3-5 business days</span>
        </li>
        <li className="flex items-start gap-2">
          <RefreshCw className="w-4 h-4 mt-0.5 text-[#A00300]" />
          <span>30-day easy returns</span>
        </li>
      </ul>
    </div>
    */}
          </div>
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

      {/* Related Products Section */}
      {product.related_items?.length > 0 && (
        <section className="w-full border-t border-gray-100 pt-14 pb-20 px-6 bg-white">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Adjust `amount` as needed
            className="w-full mx-auto"
          >
            <div className="flex justify-between items-center mb-10 px-4">
              <h3 className="text-2xl font-semibold uppercase text-[#A00300] tracking-tight">
                {t("Related Products")}
              </h3>
              <Link
                href="/products"
                className="text-sm font-medium text-gray-900  hover:underline flex items-center gap-1"
              >
                {t("View all")} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-24 gap-y-16 md:gap-y-20">
              {product.related_items.slice(1, 17).map((item) => {
                const hasValidPromo =
                  item?.promo_price !== null &&
                  item?.promo_price !== undefined &&
                  !isNaN(Number(item.promo_price)) &&
                  Number(item.promo_price) > 0 &&
                  Number(item.promo_price) < Number(item.price) &&
                  item?.end_date &&
                  new Date(item.end_date).getTime() > Date.now();

                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="relative group flex flex-col transition"
                    style={{ height: "100%" }}
                  >
                    {/* Premium Badge */}
                    {item.is_premium && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-[10px] font-bold px-2 py-[2px] rounded-tl-lg rounded-br-lg z-10">
                        {t("Premium")}
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <div className="absolute top-2 right-2 z-10">
                      <WishlistButton productId={item.id} variant="icon" />
                    </div>
                    {/* Image */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="block w-full overflow-hidden group mb-2"
                    >
                      <div className="relative w-full h-[220px] bg-[#fcfcfc]">
                        <Image
                          src={`https://marketplace.yuukke.com/assets/uploads/${item.image}`}
                          alt={item.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          priority={false} // Set to true only for above-the-fold images
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex flex-col ml-4">
                      <h4
                        className="text-sm font-semibold text-gray-950 hover:text-[#A00300] transition-colors mb-1 capitalize 
               line-clamp-2 md:line-clamp-none"
                        style={{ maxWidth: "30ch", wordBreak: "break-word" }}
                      >
                        {item.name}
                      </h4>
                      {item.promo_tag && (
                        <div className="mb-1 md:mb-2">
                          <span className="text-green-700 text-[14px] sm:text-sm italic font-semibold">
                            {product.promo_tag}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-baseline gap-1.5 flex-wrap">
                        {/* Left: Price and strikethrough */}
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-sm font-bold text-[#A00300]">
                            ₹
                            {hasValidPromo
                              ? Number(item.promo_price).toFixed(2)
                              : Number(item.price).toFixed(2)}
                          </p>

                          {hasValidPromo && (
                            <p className="text-xs text-gray-400 line-through">
                              ₹{Number(item.price).toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Right: % OFF */}
                        {hasValidPromo && (
                          <span className="text-[10px] font-bold text-red-600 ml-auto">
                            {Math.round(
                              ((Number(item.price) - Number(item.promo_price)) /
                                Number(item.price)) *
                                100
                            )}
                            {t("% OFF")}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
