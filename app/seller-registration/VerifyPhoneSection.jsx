"use client";

import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/utils/AuthContext";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";

const VerifyPhoneSection = () => {
  const [step, setStep] = useState("phone");
  const [status, setStatus] = useState(null); // ✅ success | error | null
  const [errorMsg, setErrorMsg] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    business_type: 1,
  });

  const { getValidToken, isAuthReady } = useAuth();

  const ensureAuthReady = () =>
    new Promise((resolve) => {
      if (isAuthReady) return resolve();
      const interval = setInterval(() => {
        if (isAuthReady) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });

  // 🧾 Send OTP
  const handleSendOtp = async () => {
    if (!phone) return toast.warning("Please enter your phone number");
    setLoading(true);

    try {
      await ensureAuthReady();
      const token = await getValidToken();

      const response = await fetch("/api/triggerotp-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: Number(phone) }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        // show server message if available
        toast.error(data.message || "Failed to send OTP");
        throw new Error(data.message || "Failed to send OTP");
      }

      setServerOtp(data.data?.otp);
      toast.success("OTP sent successfully!");
      console.log("✅ OTP Triggered:", data.data?.otp);
      setStep("verify");
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      // toast only if it wasn’t already shown
      if (!err.message.includes("Failed to send OTP")) {
        toast.error(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP — simplified version
  const handleVerifyOtp = async () => {
    if (!otp) return toast.warning("Please enter the OTP");

    setLoading(true);
    try {
      await ensureAuthReady();
      const token = await getValidToken();

      const response = await fetch("/api/verifyotp-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: Number(otp), phone: Number(phone) }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "OTP verification failed");
      }

      console.log("✅ OTP Verified via API");
      toast.success("OTP verified successfully!");
      setStep("form");
    } catch (err) {
      console.error("❌ OTP verification failed:", err);
      toast.error(err.message || "Invalid or expired OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "business_type" ? Number(value) : value,
    }));
  };

  // 🚀 Submit Registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      business_type,
    } = formData;

    if (!firstname || !lastname || !email || !password) {
      return toast.warning("Please fill all required fields.");
    }

    if (!confirmPassword) {
      return toast.warning("Please confirm your password.");
    }

    if (password.length < 10) {
      return toast.error("Password must be at least 10 characters long.");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match. Please check again!");
    }

    if (!phone) {
      return toast.warning("Phone number is required.");
    }

    setLoading(true);
    try {
      await ensureAuthReady();
      const token = await getValidToken();

      const payload = {
        email: email.trim(),
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        business_type: Number(business_type),
        phone_no: String(phone),
        password,
      };

      console.log("📦 Payload being sent:", payload);

      Object.entries(payload).forEach(([key, value]) => {
        console.log(`${key}:`, value, `→ type: ${typeof value}`);
      });

      const response = await fetch("/api/seller-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📩 Registration Response:", data);

      if (data.status === "success" && data.code === 201) {
        if (Number(business_type) === 1) {
          toast.success("Registration completed!");
          setStatus("success");
        } else {
          const paymentInfo = data.data?.paymentInfo;
          if (paymentInfo) {
            await handlePayment(paymentInfo, data.data?.phone);
          } else {
            console.warn("⚠️ No payment info found for paid plan.");
            toast.error("Payment details missing. Please contact support.");
            setErrorMsg("Payment details missing. Please contact support.");
            setStatus("error");
          }
        }
      } else {
        const msg =
          data.message ||
          data.data?.message ||
          "Registration failed. Please try again.";
        toast.error(msg);
        setErrorMsg(msg);
        setStatus("error");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setErrorMsg("Something went wrong. Please try again later.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // 💳 Razorpay Payment
  const handlePayment = async (paymentInfo, phone) => {
    const loadRazorpay = () =>
      new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve();
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject("❌ Razorpay SDK failed to load");
        document.body.appendChild(script);
      });

    try {
      await loadRazorpay();

      const options = {
        key: "rzp_live_lclCyKLWqjYCIJ",
        amount: paymentInfo.amount,
        currency: paymentInfo.currency || "INR",
        name: "Yuukke Seller Registration",
        description: "Upgrade to Premium or Verified Seller",
        order_id: paymentInfo.order_id,
        prefill: {
          email: formData.email,
          contact: phone,
        },

        // 🟢 SUCCESS handler
        handler: async (response) => {
          console.log("🎉 Payment Successful:", response);

          try {
            await ensureAuthReady();
            const token = await getValidToken();

            const updateRes = await fetch("/api/update_paymentseller", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                email: formData.email,
                payment_id: response.razorpay_payment_id,
                amount: paymentInfo.amount / 100,
              }),
            });

            const updateData = await updateRes.json();
            console.log("✅ Payment Update Response:", updateData);

            if (updateData.status === "success") {
              toast.success("Payment completed successfully!");
              setStatus("success");
            } else {
              setStatus("error");
            }
          } catch (err) {
            console.error("❌ Payment update error:", err);
            setStatus("error");
          }
        },

        // 🔴 Failure / Cancellation handler
        modal: {
          ondismiss: async () => {
            console.warn("⚠️ Payment cancelled or closed by user.");

            try {
              await ensureAuthReady();
              const token = await getValidToken();

              const delRes = await fetch("/api/delete_paymentseller", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  email: formData.email,
                }),
              });

              const delData = await delRes.json();
              console.log("🗑️ Payment Delete Response:", delData);

              if (delData.status === "success") {
                toast.error("Payment cancelled. Please try again.");
                setErrorMsg("Payment cancelled. Please try again.");
              } else {
                toast.error("Payment failed or could not be processed.");
                setErrorMsg("Payment failed or could not be processed.");
              }

              setStatus("error");
            } catch (err) {
              console.error("❌ Payment delete error:", err);
              toast.error("Something went wrong while cancelling payment.");
              setErrorMsg("Something went wrong while cancelling payment.");
              setStatus("error");
            }
          },
        },

        theme: { color: "#000F4D" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("💥 Razorpay init error:", err);
      toast.error("Razorpay SDK failed to load. Please refresh and try again.");
      setStatus("error");
    }
  };

  return (
    <section
      id="verify-phone"
      className="bg-gradient-to-b from-white to-gray-50 py-16 text-center"
    >
      <div className="max-w-lg mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* ✅ SUCCESS SCREEN */}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center bg-white shadow-lg rounded-2xl p-8"
            >
              <CheckCircle className="text-green-500 w-16 h-16 mb-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                Registration Successful!
              </h2>
              <p className="text-gray-600 mt-2">
                {`${
                  formData.business_type === 1
                    ? "You’ve been registered as a free Yuukke seller!"
                    : "Payment completed successfully. Welcome aboard!"
                }`}
              </p>
            </motion.div>
          )}

          {/* ❌ FAILURE SCREEN */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center bg-white shadow-lg rounded-2xl p-8"
            >
              <XCircle className="text-red-500 w-16 h-16 mb-3" />
              <h2 className="text-2xl font-bold text-gray-800">
                {errorMsg?.toLowerCase().includes("payment")
                  ? "Payment Failed"
                  : "Registration Failed"}
              </h2>
              <p className="text-gray-600 mt-2 text-center">
                {errorMsg ||
                  "Something went wrong. Please try again or contact support."}
              </p>
              <button
                onClick={() => {
                  setStep("form");
                  setStatus(null);
                }}
                className="mt-4 bg-[#000F4D] text-white px-6 py-2 rounded-md hover:bg-[#001B80]"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* 🧩 EXISTING STEPS (phone → verify → form) */}
          {!status && (
            <>
              {step === "phone" && (
                <motion.div
                  key="phone-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <div className="flex items-center border border-[#000F4D] rounded-md px-3 py-1.5 w-full sm:w-auto bg-white shadow-sm">
                    <PhoneInput
                      country={"in"}
                      value={phone}
                      onChange={(value) => setPhone(value)}
                      inputStyle={{
                        border: "none",
                        boxShadow: "none",
                        width: "100%",
                        fontSize: "14px",
                      }}
                      buttonStyle={{
                        border: "none",
                        background: "none",
                      }}
                      containerStyle={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                      placeholder="Phone No"
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className={`bg-[#000F4D] hover:bg-[#001B80] text-white font-bold text-sm px-6 py-3 rounded-md shadow-md transition-all ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "SENDING..." : "SEND OTP"}
                  </button>
                </motion.div>
              )}
              {step === "verify" && (
                <motion.div
                  key="verify-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white shadow-md rounded-2xl p-6 text-center space-y-5"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    Verify OTP
                  </h3>
                  <p className="text-sm text-gray-500">
                    Enter the 6-digit code sent to your phone ending with{" "}
                    <span className="font-medium">
                      {phone.slice(-3).padStart(phone.length, "*")}
                    </span>
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,6}$/.test(value)) setOtp(value);
                    }}
                    placeholder="Enter OTP"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-center tracking-widest"
                  />
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setStep("phone")}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      Change Number
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className={`bg-[#000F4D] hover:bg-[#001B80] text-white font-bold px-6 py-2 rounded-md transition-all ${
                        loading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "VERIFYING..." : "VERIFY"}
                    </button>
                  </div>
                </motion.div>
              )}
              {step === "form" && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white shadow-md rounded-2xl p-6 text-left space-y-4"
                >
                  <h3 className="text-xl font-semibold text-center mb-4">
                    Complete Your Registration
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="firstname"
                      placeholder="First Name"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                      className="border border-gray-300 rounded-md px-4 py-2"
                    />
                    <input
                      type="text"
                      name="lastname"
                      placeholder="Last Name"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      className="border border-gray-300 rounded-md px-4 py-2"
                    />
                  </div>

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />

                  {/* 🔑 Password Field */}
                  <input
                    type="password"
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  />

                  {/* 🧠 Confirm Password (local state, not sent to backend) */}
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    className={`w-full border rounded-md px-4 py-2 ${
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />

                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                  >
                    <option value={1}>Free</option>
                    <option value={2}>Verified</option>
                    <option value={3}>Premium</option>
                  </select>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#000F4D] hover:bg-[#001B80] text-white font-bold py-3 rounded-md"
                  >
                    {loading ? "SUBMITTING..." : "SUBMIT"}
                  </button>
                </motion.form>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default VerifyPhoneSection;
