"use client";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";
import {
  PhoneCallIcon,
  Pencil,
  Plus,
  Trash2,
  Wallet2,
  TrendingUp,
} from "lucide-react";
import { useSession } from "../context/SessionContext";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import RazorpayButtonLogged from "./RazorpayButtonLogged";
import { setLocalStorageWithEvent } from "../utils/storageEvents";
import Link from "next/link";

const CheckoutAddress = ({
  cartItems,
  subtotal,
  total,
  tax,
  shipping,
  onSuccess,
  onFailure,
}) => {
  const razorRef = useRef(null);
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [bogoOffers, setBogoOffers] = useState([]);
  const [applyingOffer, setApplyingOffer] = useState(false); // track button state
  const [appliedOffers, setAppliedOffers] = useState([]); // track applied BOGO offer IDs

  const [loadingadd, setLoadingadd] = useState(true);

  const [code, setCode] = useState("");

  const [couponMessage, setCouponMessage] = useState(""); // <-- new state
  const [couponValue, setCouponValue] = useState(0);

  const [isApplied, setIsApplied] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const stored = localStorage.getItem("selectedAddressId");
    // console.log("📦 Loaded selectedAddressId from localStorage:", stored);
    return stored ? JSON.parse(stored) : null;
  });

  const [selectedPhone, setSelectedPhone] = useState(() => {
    const stored = localStorage.getItem("selectedPhone");
    // console.log("📦 Loaded selectedPhone from localStorage:", stored);
    return stored ? JSON.parse(stored) : null;
  });

  const [selectedPostalCode, setSelectedPostalCode] = useState(() => {
    const stored = localStorage.getItem("selectedPostalCode");
    // console.log("📦 Loaded selectedPOstalCode from localStorage:", stored);
    return stored ? JSON.parse(stored) : null;
  });

  const handleSelectAddress = async (id) => {
    // console.log("🟢 Address selected with ID:", id);
    setSelectedAddressId(id);

    const selected = addresses.find((addr) => addr.id === id);
    // console.log("🎯 Selected address object:", selected);

    if (selected) {
      setSelectedAddress(selected);
      setSelectedPhone(selected.phone);
      setSelectedPostalCode(selected.postal_code);

      localStorage.setItem("selectedAddressId", JSON.stringify(id));
      localStorage.setItem("selectedPhone", JSON.stringify(selected.phone));
      localStorage.setItem(
        "selectedPostalCode",
        JSON.stringify(selected.postal_code)
      );

      // console.log("💾 Saved to localStorage:", {
      //   selectedAddressId: id,
      //   selectedPhone: selected.phone,
      //   selectedPostalCode: selected.postal_code,
      // });

      // ✅ Call Shipping API
      try {
        const token = await getValidToken();
        const cartId = localStorage.getItem("cart_id");
        if (!cartId) {
          toast.error("Please select products before proceeding!");
          console.error("Cart ID not found!");
          return;
        }

        const res = await fetch("/api/shipping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cart_id: cartId,
            pincode: selected.postal_code,
            delivery_country: "IN",
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch shipping details");
        }

        await res.json();

        // 🚀 Just trigger a global refresh for OrderSummary
        window.dispatchEvent(new Event("cart-updated"));

        toast.success("Shipping details updated successfully!");
      } catch (err) {
        console.error("🚨 Error fetching shipping data:", err);
        toast.error("Failed to update shipping details");
      }
    }
  };

  useEffect(() => {
    // console.log("🔄 Addresses updated. Verifying stored selectedAddressId...");
    if (
      selectedAddressId &&
      !addresses.some((addr) => addr.id === selectedAddressId)
    ) {
      console.warn(
        "⚠️ Selected address no longer exists in the current addresses list. Resetting..."
      );

      setSelectedAddress(null);
      setSelectedAddressId(null);
      setSelectedPhone(null);
      setSelectedPostalCode(null);

      localStorage.removeItem("selectedAddress");
      localStorage.removeItem("selectedAddressId");
      localStorage.removeItem("selectedPhone");
      localStorage.removeItem("selectedPostalCode");

      // console.log(
      //   "🧹 Cleared invalid selected address data from localStorage."
      // );
    }
  }, [addresses, selectedAddressId]);

  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [showInfo, setShowInfo] = useState(true);

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
    setShowInfo(true);
  };

  const handleToggle = () => {
    if (selectedMethod === "razorpay") {
      setShowInfo((prev) => !prev);
    } else {
      setSelectedMethod("razorpay");
      setShowInfo(true);
    }
  };

  const [formData, setFormData] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    landmark: "",
    phone: "",
  });

  const { getValidToken, isAuthReady } = useAuth();
  const { companyId } = useSession();
  //   console.log("Company ID 👉", companyId);

  // 🛡️ Helper: wait
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  // 🛡️ Helper: robust token fetcher
  const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      const token = await getValidToken();

      if (token && typeof token === "string" && token.length > 10) {
        return token;
      }

      if (attempt === 5) {
        localStorage.removeItem("authToken"); // force refresh if token exists but junk
      }

      await wait(delay);
      attempt++;
    }

    throw new Error("❌ Auth token unavailable after multiple retries.");
  };

  // 🛡️ Helper: universal fetcher (works for POST too)
  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getTokenWithRetry();

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true); // retry once silently
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  const fetchWithAuthBogo = async (url, options = {}, retry = false) => {
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

  // 🧮 Currency parser
  const parseCurrency = (val) =>
    Number(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  const handleApply = async () => {
    const cartId = localStorage.getItem("cart_id");

    if (!cartId) {
      console.warn("⚠️ No cart_id found in localStorage");
      return;
    }

    if (!code.trim()) {
      console.warn("⚠️ Please enter a discount code");
      return;
    }

    try {
      // 1️⃣ Apply coupon
      const applyResponse = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // ensure JSON
        body: JSON.stringify({
          cart_id: cartId,
          coupon_code: code.trim(),
        }),
      });

      if (applyResponse.status === false) {
        setCouponMessage(applyResponse.message || "Failed to apply coupon");
        localStorage.removeItem("applied_coupon");
        setIsApplied(false);
        // ✅ Trigger the cart update for OrderSummary page
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        setCouponMessage(`Discount applied successfully!`); // or show value dynamically
        setIsApplied(true);
        localStorage.setItem("applied_coupon", code.trim());

        // ✅ Trigger the cart update for OrderSummary page
        window.dispatchEvent(new Event("cart-updated"));
      }

      // 2️⃣ Fetch updated cart summary (tax, totals, items)
      const summaryResponse = await fetchWithAuth("/api/getTax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { cart_id: cartId },
      });

      const cartData = summaryResponse?.cart_data;
      if (!cartData) return;

      if (summaryResponse?.cart_data) {
        // Persist coupon value if applied
        const appliedCoupon = cartData.coupon_id && cartData.coupon_id !== "0";
        setCouponValue(
          appliedCoupon ? parseCurrency(cartData.coupon_value || 0) : 0
        );
        if (appliedCoupon) setCode(cartData.coupon_id);

        // Update localStorage with new cart summary
        localStorage.setItem(
          "cart_tax_details",
          JSON.stringify(summaryResponse)
        );

        // Trigger UI update event
        window.dispatchEvent(
          new CustomEvent("local-storage-update", {
            detail: { key: "cart_tax_details" },
          })
        );
      }
    } catch (err) {
      console.error("❌ Error applying coupon or fetching cart summary:", err);
      setCouponMessage("Failed to apply coupon. Try again.");
    }
  };

  // Fetch BOGO offers
  const fetchBogoOffers = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      console.warn("⚠️ No cart_id found in localStorage");
      return;
    }

    try {
      const response = await fetchWithAuthBogo("/api/getTax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { cart_id: cartId },
      });

      if (response?.bogo_offers && response.bogo_offers.length > 0) {
        setBogoOffers(response.bogo_offers);

        // ✅ Automatically get the first BOGO offer id
        const firstBogoId = response.bogo_offers[0].id;
        // console.log("First BOGO ID:", firstBogoId);

        // Optionally, you can auto-apply it immediately
        // applyBogoOffer(firstBogoId);
      } else {
        setBogoOffers([]);
      }

      // console.log("Response", response);
    } catch (err) {
      console.error("❌ Failed to fetch BOGO offers:", err);
    }
  };

  useEffect(() => {
    fetchBogoOffers();
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchAddresses();
    }
  }, [companyId]);

  if (!companyId) {
    return (
      <div className="flex justify-between items-center w-full">
        <h1 className="text-xl font-[800] tracking-tight">Contact</h1>
        <button
          onClick={() => router.push("/login")}
          className="text-gray-700 transition underline"
        >
          Log In
        </button>
      </div>
    );
  }

  const applyBogoOffer = async (bogoId) => {
    if (applyingOffer || appliedOffers.includes(bogoId)) return; // prevent double click

    try {
      setApplyingOffer(true);

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Cart ID not found!");
        return;
      }

      const data = await fetchWithAuthBogo("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { bogo_id: Number(bogoId), cart_id: cartId },
      });

      if (data.status === "error") {
        throw new Error(data.message || "Failed to apply offer");
      }

      toast.success(data.message || "Offer applied successfully");

      // ✅ mark this offer as applied
      setAppliedOffers((prev) => [...prev, bogoId]);

      // ✅ refresh cart
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setApplyingOffer(false);
    }
  };

  // ✅ Use it inside fetchAddresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setLoadingadd(true);

      const data = await fetchWithAuth("/api/customer_address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      });
      // console.log("Address : ", data);

      if (data.status) {
        setAddresses(data.data);
      } else {
        toast.error(data.message || "Failed to fetch addresses ❌");
      }
    } catch (error) {
      console.error("Addresses API Error ❌", error);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
      setLoadingadd(false);
    }
  };

  // Separate active and inactive addresses
  const activeAddresses = addresses.filter((addr) => addr.active === "1");
  const inactiveAddresses = addresses.filter((addr) => addr.active === "0");

  // Handle edit button click
  const handleEditClick = (address) => {
    setSelectedAddress(address);
    setFormData({
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "",
      landmark: address.landmark || "",
      phone: address.phone || "",
    });
    setIsEditModalOpen(true);
  };

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle address update
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      const token = await getValidToken();
      const requestBody = {
        id: selectedAddress.id,
        company_id: selectedAddress.company_id,
        ...formData,
        active: 1,
      };

      const res = await fetch("/api/edit_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      // console.log("Response edit address", data);

      if (res.ok && data.status) {
        toast.success("Address updated successfully ✅");
        setIsEditModalOpen(false);
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to update address ❌");
      }
    } catch (error) {
      console.error("Update Address API Error ❌", error);
      toast.error("Something went wrong ❌");
    }
  };

  // Handle add new address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const token = await getValidToken();
      const requestBody = {
        company_id: companyId,
        ...formData,
        active: 1,
      };

      const res = await fetch("/api/edit_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      // console.log("Response add address", data);

      if (res.ok && data.status) {
        toast.success("Address added successfully ✅");
        setIsAddModalOpen(false);
        setFormData({
          line1: "",
          line2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
          landmark: "",
          phone: "",
        });
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to add address ❌");
      }
    } catch (error) {
      console.error("Add Address API Error ❌", error);
      toast.error("Something went wrong ❌");
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (id) => {
    toast(
      ({ closeToast }) => (
        <div className="p-5 bg-white rounded-2xl shadow-xl border border-gray-200  w-80 text-center">
          {/* Icon */}
          <div className="w-12 h-12 mx-auto flex items-center justify-center bg-red-100 rounded-full mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800  mb-1">
            Delete Address?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            This action cannot be undone.
          </p>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => closeToast()}
              className="px-5 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                try {
                  const token = await getValidToken();
                  const res = await fetch("/api/delete_address", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ id }),
                  });

                  const data = await res.json();
                  if (res.ok && data.status) {
                    toast.success("Address deleted successfully ", {
                      position: "top-right",
                    });
                    fetchAddresses();
                  } else {
                    toast.error(data.message || "Failed to delete ❌");
                  }
                } catch (error) {
                  console.error("Delete Address API Error ❌", error);
                  toast.error("Something went wrong ❌");
                } finally {
                  closeToast();
                }
              }}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
      }
    );
  };

  const handleOrderAndPayLogged = async () => {
    try {
      // console.log("🔄 Starting logged-in order creation process...");

      // ✅ Check auth readiness
      if (!isAuthReady) {
        toast.error("Authentication not ready yet. Please try again.");
        console.warn("⚠️ Auth not ready: isAuthReady =", isAuthReady);
        return;
      }

      // ✅ Get token
      const token = await getValidToken();
      // console.log("🔑 Retrieved Token:", token);

      // ✅ Get cart ID
      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Please select products before proceeding!");
        console.error("Cart ID not found!");
        return;
      }
      // console.log("🛒 Cart ID:", cartId);

      // ✅ Get active address ID
      const activeAddresses = addresses.filter((addr) => addr.active === "1");
      // console.log("📍 Active Addresses:", activeAddresses);

      if (!activeAddresses.length) {
        toast.error("Please select an active address before proceeding.");
        console.warn("⚠️ No active address selected!");
        return;
      }

      const addressId = selectedAddressId || activeAddresses[0]?.id || null;

      // console.log("🏠 Using Address ID:", addressId);

      // ✅ Prepare payload for logged-in users
      const customerPayload = {
        customer: {
          id: 0,
          company: "-",
          name: "",
          email: "",
          phone: "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "India",
        },
        company_id: companyId, // ✅ From useSession()
        address_id: addressId, // ✅ From activeAddresses
        cart_id: cartId, // ✅ From localStorage
        coupon_code: "0", // ✅ Default
      };

      // console.log(
      //   "📦 Payload being sent to /api/createOrder:",
      //   customerPayload
      // );

      // ✅ API call
      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerPayload),
      });

      const result = await res.json();

      // console.log("📥 Raw API Response:", result);

      // ✅ Check response status
      if (!res.ok) {
        console.error("❌ Error creating order:", result);
        throw new Error(result?.message || "Failed to create order.");
      }

      // console.log("✅ Logged-in order created successfully:", result);

      // 🧾 Save order data to localStorage
      localStorage.setItem("order_id_data", JSON.stringify(result));
      // console.log("💾 Order ID stored in localStorage:", result?.order_id);

      // 🔔 Dispatch event for other listeners
      window.dispatchEvent(
        new CustomEvent("orderIdDataUpdated", {
          detail: result?.order_id,
        })
      );

      razorRef.current?.click();

      // console.log(
      //   "📢 Custom event 'orderIdDataUpdated' dispatched with:",
      //   result?.order_id
      // );
    } catch (err) {
      console.error("🚨 Logged-in Order creation error:", err);
      toast.error(
        err.message || "Something went wrong while creating the order."
      );
    }
  };

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    if (image.startsWith("http") || image.startsWith("/")) return image;

    const originalUrl = `https://marketplace.yuukke.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  // Combine active + inactive based on toggle
  const allAddresses = [
    ...activeAddresses,
    ...(showInactive ? inactiveAddresses : []),
  ];

  // Move the selected address to the top if it exists
  const sortedAddresses = [...allAddresses].sort((a, b) => {
    if (a.id === selectedAddressId) return -1;
    if (b.id === selectedAddressId) return 1;
    return 0;
  });

  if (loadingadd) {
    // 🔄 Skeletons
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-start animate-pulse"
          >
            <div className="flex items-start gap-3 w-full">
              <div className="mt-1 w-4 h-4 rounded-full bg-gray-300" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ✅ Show "No addresses" ONLY after loading is done
  if (!loadingadd && sortedAddresses.length === 0) {
    return <p className="text-gray-500 text-sm">No addresses found.</p>;
  }
  return (
    <>
      <div className="space-y-4 relative">
        {/* Active + Inactive Addresses */}
        {sortedAddresses.map((address) => (
          <div
            key={address.id}
            className={`border rounded-lg p-4 bg-white shadow-sm flex justify-between items-start cursor-pointer transition
          ${
            selectedAddressId === address.id
              ? "border-green-500 ring-2 ring-green-400"
              : "hover:border-blue-400"
          }`}
            onClick={() => handleSelectAddress(address.id)}
          >
            {/* Left: Radio + Address Info */}
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="selectedAddress"
                checked={selectedAddressId === address.id}
                onChange={() => handleSelectAddress(address.id)}
                className="mt-1 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 cursor-pointer"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  Delivery to {address.line1}
                </p>
                <p className="text-sm text-gray-600 ">
                  {address.line2}, {address.city} - {address.postal_code}
                </p>
                <p className="text-sm text-gray-600 ">
                  {address.state}, {address.country}, Landmark:{" "}
                  {address.landmark}
                </p>
                <p className="text-sm text-gray-600 flex">
                  <PhoneCallIcon className="w-4 h-4 mr-1 mt-0.5" />
                  {address.phone}
                </p>
              </div>
            </div>

            {/* Right: Edit/Delete Buttons */}
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(address);
                }}
                className="text-blue-600 hover:text-blue-800"
                aria-label="Edit address"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAddress(address.id);
                }}
                className="text-red-600 hover:text-red-800"
                aria-label="Delete address"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Buttons Row - Top Right */}
        <div className="flex justify-end items-center gap-4 mt-2">
          {inactiveAddresses.length > 0 && (
            <button
              onClick={() => setShowInactive(!showInactive)}
              className="text-sm font-medium underline text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showInactive ? "Show Less" : "Change Addresses"}
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-sm font-medium underline text-green-600 hover:text-green-800 transition-colors"
          >
            + Add Address
          </button>
        </div>

        {/* Inactive Addresses */}
        {showInactive && (
          <>
            {/* {inactiveAddresses.map((address) => (
            <div
              key={address.id}
              className="border rounded-lg p-4 bg-gray-50  flex justify-between items-start"
            >
              <div>
                <p className="font-semibold text-gray-700 ">
                  {address.line1}
                </p>
                <p className="text-sm text-gray-600 ">
                  {address.line2}, {address.city} - {address.postal_code}
                </p>
                <p className="text-sm text-gray-600 ">
                  {address.state}, {address.country}
                </p>
                <p className="text-sm text-gray-600 ">
                  Landmark: {address.landmark}
                </p>
                <p className="text-sm text-gray-600 ">
                  📞 {address.phone}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditClick(address)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label="Edit address"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))} */}

            {/* Show Less Button */}
            {/* <button
            onClick={() => setShowInactive(false)}
            className="text-sm underline text-red-600 hover:text-red-800"
          >
            Show less
          </button> */}
          </>
        )}

        {/* Add Address Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white  p-6 rounded-xl shadow-lg w-full max-w-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 ">
                Add New Address
              </h2>
              <form onSubmit={handleAddAddress} className="space-y-3">
                {Object.keys(formData).map((field) => (
                  <input
                    key={field}
                    type="text"
                    name={field}
                    placeholder={field.replace("_", " ").toUpperCase()}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg "
                  />
                ))}
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Address Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 ">
                Edit Address
              </h2>
              <form onSubmit={handleUpdateAddress} className="space-y-3">
                {Object.keys(formData).map((field) => (
                  <input
                    key={field}
                    type="text"
                    name={field}
                    placeholder={field.replace("_", " ").toUpperCase()}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-lg "
                  />
                ))}
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Section */}
        <div className="">
          {/* 💸 More Offers */}
          {bogoOffers.length > 0 && (
            <div className="mt-6 mb-6 block md:hidden">
              <h2 className="text-xl font-bold mb-3">More offers</h2>

              <div className="space-y-4">
                {bogoOffers.map((offer) => (
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
                          className={`text-xs font-semibold text-white px-3 py-1 rounded-lg shadow transition-colors ml-4 shrink-0 ${
                            appliedOffers.includes(offer.id)
                              ? "bg-gray-500 cursor-not-allowed"
                              : "bg-[#A00300] hover:bg-red-700"
                          }`}
                          onClick={() => applyBogoOffer(offer.id)}
                          disabled={
                            applyingOffer || appliedOffers.includes(offer.id)
                          }
                        >
                          {appliedOffers.includes(offer.id)
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
                ))}
              </div>
            </div>
          )}

          <h1 className="text-xl font-[800] tracking-tight">Payment</h1>
          <p className="text-gray-400 text-xs">
            All transactions are secure and encrypted.
          </p>

          <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-white">
            <label
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between "
              onClick={handleToggle}
            >
              <div className="flex items-start gap-2 sm:items-center">
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={selectedMethod === "razorpay"}
                  onChange={handleRadioChange}
                  className="accent-black w-4 h-4 mt-1 sm:mt-0 cursor-pointer"
                />
                <span className="text-sm font-medium">
                  Razorpay Secure
                  <br className="block sm:hidden" />
                  <br className="hidden lg:block" />
                  <span className="text-xs text-gray-600">
                    (UPI, Cards, Wallets, NetBanking)
                  </span>
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2 justify-end sm:justify-normal">
                <img
                  src="/upi.svg"
                  alt="UPI"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <img
                  src="/visa.svg"
                  alt="Visa"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <img
                  src="/master.svg"
                  alt="Master"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <img
                  src="/rupay.svg"
                  alt="Rupay"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <div className="relative group">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md text-xs font-bold flex items-center justify-center cursor-pointer group-hover:bg-gray-200">
                    +16
                  </div>
                  <div className="absolute bottom-12 right-0 hidden group-hover:grid grid-cols-4 gap-2 bg-black shadow-xl rounded-lg border p-2 z-20 w-[176px]">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <img
                        key={i}
                        src={`/${i + 1}.svg`}
                        alt={`Payment ${i + 1}`}
                        className="w-7 h-7 object-contain"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </label>

            <AnimatePresence initial={false}>
              <motion.div
                key={showInfo ? "visible" : "hidden"}
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  marginBottom: showInfo ? 16 : 0, // Prevents button jump
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {showInfo && (
                  <div className="border-t pt-4 mt-6 text-center bg-gray-50">
                    <div className="flex justify-center mb-3">
                      <Wallet2 className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium max-w-md mx-auto">
                      After clicking “Pay now”, you'll be redirected to Razorpay
                      Payment Gateway to securely complete your purchase using
                      UPI, Cards, Wallets or NetBanking.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className=" block md:hidden">
            <h1 className="text-xl font-[800] tracking-tight mt-8">
              Order Summary
            </h1>

            {/* 🛍 Cart Items */}
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 mt-6 mb-4">
                <img
                  src={getImageSrc(item.image)}
                  alt={item.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.name} <br /> x {item.qty}
                  </p>
                  <p className="text-sm mt-1 text-right">
                    ₹
                    {(
                      Number(item.price?.toString().replace(/[^0-9.-]+/g, "")) *
                      Number(item.qty)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            {/* 🎁 Discount Input */}
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setIsApplied(false); // Reset button
                    setCouponMessage(""); // Clear previous message
                    setCouponValue(0); // Reset previous discount
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
                </div>
              </div>

              {/* Coupon message (error or success) */}
              {couponMessage && (
                <p
                  className={`text-xs font-medium mt-1 ${
                    isApplied ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {couponMessage}
                </p>
              )}
            </div>

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

              <div className="flex justify-between pt-2 font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <p className="text-xs text-gray-500">
                Including ₹{tax.toFixed(2)} in taxes
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleOrderAndPayLogged}
            disabled={!selectedAddressId} // <-- Disable when no address is selected
            className={`py-3 px-6 rounded-md w-full font-semibold transition-all duration-300 
      ${
        selectedAddressId
          ? "bg-black text-white hover:bg-gray-900 cursor-pointer"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
            title={!selectedAddressId ? "Select an address" : ""} // <-- Tooltip on hover
          >
            Pay Now
          </button>

          {/* Hidden RazorpayButton for manual trigger */}
          <div style={{ display: "none" }}>
            <RazorpayButtonLogged
              ref={razorRef}
              total={total}
              onSuccess={onSuccess}
              onFailure={onFailure}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutAddress;
