"use client";
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";

const RazorpayButtonLogged = forwardRef(
  ({ total, clearForm, onSuccess, onFailure }, ref) => {
    const [loading, setLoading] = useState(false);
    const { getValidToken } = useAuth();

    // Expose handlePayment to parent via ref
    useImperativeHandle(ref, () => ({
      click: () => {
        handlePayment();
      },
    }));

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    // console.log("🛠 Inside handlePayment | total prop value:", total);

    const handlePayment = async () => {
      // ✅ Guard: ensure we have a valid total
      const paymentAmount = Number(total);
      if (!paymentAmount || isNaN(paymentAmount)) {
        toast.error("Payment amount is not ready yet. Please try again!");
        return;
      }

      // console.log("💰 Final Payment Amount:", paymentAmount);

      setLoading(true);

      const res = await loadScript();
      if (!res) {
        toast.error("😵 Razorpay SDK failed to load!");
        setLoading(false);
        return;
      }

      try {
        // console.log("📦 Sending Razorpay Payment Request:", {
        //   amount: total,
        // });

        const orderResponse = await fetch("/api/razorpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: paymentAmount }),
        });

        const data = await orderResponse.json();
        // console.log("✅ Razorpay API Response:", data);

        // 🧠 Prefill only with phone from localStorage
        const storedPhone =
          JSON.parse(localStorage.getItem("selectedPhone")) || "";

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: "Yuukke's MarketPlace",
          description: "Order Payment",
          order_id: data.id,
          handler: async function (response) {
            // toast.success("🎉 Payment Successful!", {
            //   position: "top-center",
            //   autoClose: 4000,
            // });
            // console.log("✅ Payment ID:", response.razorpay_payment_id);
            // console.log("✅ Order ID:", response.razorpay_order_id);
            // console.log("✅ Signature:", response.razorpay_signature);

            localStorage.setItem(
              "razorpay_payment_id",
              response.razorpay_payment_id
            );
            window.dispatchEvent(
              new CustomEvent("razorpayPaymentIdUpdated", {
                detail: response.razorpay_payment_id,
              })
            );
            // 🧠 Get sale_id & cart_id from stored order
            const storedOrder = JSON.parse(
              localStorage.getItem("order_id_data")
            );
            const sale_id = storedOrder?.sale_id;
            const cart_id = storedOrder?.cart_id;

            const verificationPayload = {
              sale_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              razorpay_order_id: response.razorpay_order_id,
              guest: false,
              cart_id,
            };

            try {
              const token = await getValidToken();
              if (!token) {
                toast.error("🔐 Login required to verify payment.");
                return;
              }

              const verifyResponse = await fetch("/api/verifyRazor", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(verificationPayload),
              });

              const verifyResult = await verifyResponse.json();

              if (verifyResult?.status) {
                onSuccess?.();
              } else {
                onFailure?.();
                toast.error(
                  `❌ Verification Failed: ${
                    verifyResult?.message || "Unknown error"
                  }`,
                  {
                    position: "top-center",
                    autoClose: 5000,
                  }
                );
              }
            } catch (verifyError) {
              console.error("❌ Verification Failed:", verifyError);
              toast.error(
                "🚨 Verification request failed. Check your connection or try again."
              );
            }
          },
          modal: {
            ondismiss: function () {
              onFailure?.();
              toast.warning("⚠️ Payment was cancelled by you.", {
                position: "top-center",
                autoClose: 4000,
              });
            },
          },
          prefill: {
            contact: storedPhone || "",
          },
          remember: false,
          theme: {
            color: "#A00300",
          },
        };

        if (window.rzp) {
          window.rzp.close();
          window.rzp = null;
        }

        window.rzp = new window.Razorpay(options);
        window.rzp.open();
        clearForm?.();
      } catch (err) {
        console.error("🚨 Payment Error", err);
        toast.error("🚨 Payment failed. Try again.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold transition duration-300 ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        {loading ? "Processing..." : `Pay ₹${total}`}
      </button>
    );
  }
);

RazorpayButtonLogged.displayName = "RazorpayButtonLogged";

export default RazorpayButtonLogged;
