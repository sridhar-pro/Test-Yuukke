"use client";
import { useState, useEffect } from "react";
import { X, CreditCard, CheckCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PopupForm = ({ isOpen, onClose, mode, defaultCatalogue }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    giftingFor: "",
    budget: "",
    quantity: "",
    // catalogue: defaultCatalogue ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [insertedId, setInsertedId] = useState(null);

  // Load Razorpay script once
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Reset form and manage body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        giftingFor: "",
        budget: "",
        quantity: "",
        // catalogue: defaultCatalogue ?? "",
      });
      setPaymentSuccess(false);
      setInsertedId(null);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]); //defaultCatalogue

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Razorpay payment initiation
  const initiatePayment = async () => {
    return new Promise((resolve) => {
      const options = {
        key: "rzp_live_lclCyKLWqjYCIJ",
        amount: "50000", // ₹500
        currency: "INR",
        name: "Corporate Gifting",
        description: "Pre-booking Deposit",
        image:
          "https://marketplace.yuukke.com/themes/default/admin/assets/images/fav.ico",
        handler: function (response) {
          resolve(response);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled")); // payment cancelled
          },
        },
        theme: {
          color: "#F37254",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  // Update payment status
  const updatePaymentStatus = async (prebookingId, paymentId) => {
    let authToken = localStorage.getItem("authToken");

    if (!authToken) {
      const authResponse = await fetch(
        "https://marketplace.yuukke.com/api/v1/Auth/api_login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "admin",
            password: "Admin@123",
          }),
        }
      );

      const authData = await authResponse.json();
      if (authData.status === "success") {
        authToken = authData.token;
        localStorage.setItem("authToken", authToken);
      } else {
        throw new Error("Authentication failed");
      }
    }

    const response = await fetch("/api/prebook_gifts_payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        id: prebookingId,
        payment_status: 1,
        razorpay_payment_id: paymentId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let authToken = localStorage.getItem("authToken");

      // Get auth token if missing
      if (!authToken) {
        const authResponse = await fetch(
          "https://marketplace.yuukke.com/api/v1/Auth/api_login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "admin",
              password: "Admin@123",
            }),
          }
        );

        const authData = await authResponse.json();
        if (authData.status === "success") {
          authToken = authData.token;
          localStorage.setItem("authToken", authToken);
        } else {
          throw new Error("Authentication failed");
        }
      }

      // Save form data
      const requestBody = {
        full_name: formData.name,
        phone_number: formData.phone,
        email: formData.email,
        city: formData.city,
        gifting_for: formData.giftingFor,
        budget_per_gift: formData.budget,
        quantity_required: formData.quantity,
        prebookingType: "quotation", // Pass mode directly here
        // catalogue: formData.catalogue,
      };

      // console.log("request-body", requestBody);

      const response = await fetch("/api/save_prebook_gift", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        return handleSubmit(e);
      }

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status && result.id) {
        setInsertedId(result.id);

        if (mode === "prebooking") {
          toast.loading("Redirecting to payment...");
          const paymentResponse = await initiatePayment();

          if (paymentResponse.razorpay_payment_id) {
            await updatePaymentStatus(
              result.id,
              paymentResponse.razorpay_payment_id
            );
            setPaymentSuccess(true);
            toast.success("Payment successful! Prebooking confirmed.");
          } else {
            throw new Error("Payment failed");
          }
        } else {
          toast.success(
            "Request submitted successfully! Our team will contact you soon."
          );
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        throw new Error("Failed to save prebooking");
      }
    } catch (error) {
      console.error("[Form Error]:", error);
      toast.error(
        mode === "prebooking"
          ? "Payment failed. Please try again."
          : "Failed to submit request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg relative my-8 mx-auto max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 transition bg-white rounded-full p-1 shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6">
            {paymentSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  Thank you for your pre-booking. We'll contact you within 24
                  hours to confirm your order details.
                </p>
                <button
                  onClick={onClose}
                  className="bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="font-gift">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                    {mode === "prebooking"
                      ? "Pre-book Your Gifts Now"
                      : "Get a Free Quotation"}
                  </h2>
                  <p className="text-gray-600 text-center mb-6">
                    {mode === "prebooking"
                      ? "Secure your gifts today with a small deposit."
                      : "Request a customized quotation for your gifting needs."}
                  </p>

                  {mode === "prebooking" && (
                    <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        ₹500 deposit required to secure your pre-booking.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        required
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                      />
                    </div>

                    {/* Business Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your business email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Enter your city"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                      />
                    </div>

                    {/* Gifting For */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gifting For
                      </label>
                      <select
                        name="giftingFor"
                        value={formData.giftingFor}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition bg-white"
                      >
                        <option value="">Select an option</option>
                        <option value="internal-employees">
                          Internal Employees
                        </option>
                        <option value="clients-customers">
                          Clients / Customers
                        </option>
                        <option value="cxos-executives">
                          CXOs / Executives / Elite Partners
                        </option>
                        <option value="others">Others</option>
                      </select>
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget per Gift (₹)
                      </label>
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                        placeholder="Enter your budget per gift"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Required
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        placeholder="Enter quantity required"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                      />
                    </div>

                    {/* Catalogue */}
                    {mode === "prebooking" && defaultCatalogue && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catalogue
                        </label>
                        <select
                          name="catalogue"
                          value={formData.catalogue}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition bg-white"
                        >
                          <option value={defaultCatalogue}>
                            {defaultCatalogue}
                          </option>
                        </select>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-700 via-pink-600 to-red-600 text-white py-3 rounded-lg font-semibold text-md hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                    >
                      {loading
                        ? "Processing..."
                        : mode === "prebooking"
                        ? "Proceed to Payment"
                        : "Request Quotation"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PopupForm;
