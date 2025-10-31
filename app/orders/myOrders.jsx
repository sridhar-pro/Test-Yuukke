"use client";
import React, { useState, useEffect } from "react";
import { MoreVertical, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";
import InvoiceDownload from "./InvoiceDownload";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);

  const [viewedOrder, setViewedOrder] = useState(null);

  const { getValidToken } = useAuth();

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      const token = await getValidToken();

      if (token && typeof token === "string" && token.length > 10) {
        return token;
      }

      if (attempt === 5) {
        localStorage.removeItem("authToken"); // force refresh if token exists but is trash
      }

      await wait(delay);
      attempt++;
    }

    throw new Error("❌ Auth token unavailable after multiple retries.");
  };

  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getTokenWithRetry();

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true); // Retry once silently
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  // Refactored fetchOrders
  const fetchOrders = async (currentPage = 1) => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem("company_id");

      if (!companyId) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      const data = await fetchWithAuth("/api/customer_orders", {
        method: "POST",
        body: JSON.stringify({
          company_id: Number(companyId),
          filters: {
            page: currentPage, // ✅ API expects page inside filters
          },
        }),
      });

      // console.log("Customer Orders Response ✅", data);

      if (data.status && data.data?.orders) {
        setOrders(data.data.orders);
        setLimit(data.data.filters.limit || 12);
        setPage(data.data.info.page || 1);
        setTotal(data.data.info.total || 0);
      } else {
        toast.error(data.message || "Failed to fetch orders ❌");
      }
    } catch (error) {
      console.error("Orders API Error ❌", error);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, []);

  const totalPages = Math.ceil(total / limit);

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full px-6 lg:px-12">
        {[1, 2, 3].map((_, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-xl p-4 shadow-sm animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-auto">
      <div className="flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-10">
        <h2 className="text-xl font-bold mb-4 text-black">Orders Dashboard</h2>

        {/* Show orders table only if no order is viewed */}
        {!viewedOrder && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 ">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Total Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order.reference_no}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.date}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {order.grand_total}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                              order.payment_status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                              order.sale_status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {order.sale_status}
                          </span>
                        </td>

                        {/* view products */}
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <button
                              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200"
                              onClick={async () => {
                                try {
                                  const token = await getValidToken();
                                  const res = await fetch("/api/viewdetails", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      order_id: order.id,
                                    }),
                                  });

                                  const data = await res.json();
                                  // console.log(
                                  //   "📦 View Details Response:",
                                  //   data
                                  // );

                                  if (data.status === "success") {
                                    setViewedOrder(data); // store response
                                  }
                                } catch (err) {
                                  console.error(
                                    "❌ Error fetching view details:",
                                    err
                                  );
                                }
                              }}
                            >
                              View
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-left">
                          <InvoiceDownload order={order} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-6 text-gray-600"
                      >
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {orders.length > 0 ? (
                orders.map((order, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-200 p-4 shadow-sm bg-white"
                  >
                    {/* Header: Order + Invoice */}
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Order: {order.reference_no}
                      </p>
                      <InvoiceDownload order={order} />
                    </div>

                    {/* Date & Total */}
                    <p className="text-xs text-gray-500 mb-1">
                      Date: {order.date}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Total: {order.grand_total}
                    </p>

                    {/* 🔥 Status Labels */}
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">
                          Payment:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                            order.payment_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">
                          Status:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                            order.sale_status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.sale_status}
                        </span>
                      </div>
                    </div>

                    {/* ⚙️ Actions: View Products */}
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition"
                        onClick={async () => {
                          try {
                            const token = await getValidToken();
                            const res = await fetch("/api/viewdetails", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                order_id: order.id,
                              }),
                            });

                            const data = await res.json();
                            if (data.status === "success") {
                              setViewedOrder(data);
                            }
                          } catch (err) {
                            console.error(
                              "❌ Error fetching view details:",
                              err
                            );
                          }
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No orders found.</p>
              )}
            </div>

            {/* Pagination */}
            {orders.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                <button
                  disabled={page === 1}
                  onClick={() => fetchOrders(page - 1)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    page === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Previous
                </button>

                <span className="text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => fetchOrders(page + 1)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    page === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Render products of viewed order */}
        {viewedOrder && viewedOrder.seller_group?.length > 0 && (
          <div className="flex flex-col">
            {/* Back button */}
            <div className="mb-6">
              <button
                onClick={() => setViewedOrder(null)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Orders
              </button>
            </div>

            {/* If multiple seller groups, separate packages */}
            {viewedOrder.seller_group.length > 1 ? (
              viewedOrder.seller_group.map((group, gIdx) => (
                <div key={gIdx} className="mb-10">
                  {/* Package Header */}
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Package {gIdx + 1}
                  </h2>

                  {/* Product grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="relative flex flex-col items-center bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 group"
                      >
                        {/* Product Image */}
                        <div className="w-full h-44 flex items-center justify-center overflow-hidden rounded-xl mb-4">
                          <Image
                            src={getImageSrc(item.image)}
                            alt={item.product_name || "Product Image"}
                            className="object-contain w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                            width={180}
                            height={180}
                          />
                        </div>

                        {/* Product Name */}
                        <h3 className="text-md font-semibold text-center text-gray-800 mb-2 line-clamp-2">
                          {item.product_name}
                        </h3>

                        {/* Price + Quantity */}
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-lg font-bold text-[#A00300]">
                            ₹{parseFloat(item.subtotal).toFixed(2)}
                          </p>
                          <span className="text-sm text-gray-600 mt-0.5">
                            x {parseInt(item.quantity)}
                          </span>
                        </div>

                        {/* Review Section */}
                        {item.product_review === true && (
                          <ReviewForm
                            orderId={viewedOrder.order_id}
                            productId={item.id}
                          />
                        )}

                        {/* Hover border accent */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#A00300] pointer-events-none transition-all duration-300"></div>
                      </div>
                    ))}
                  </div>

                  {/* Cancel Button / Status */}
                  <div className="mt-6 flex justify-start">
                    {group.cancelable?.status === 1 ? (
                      <button
                        disabled={cancellingIndex === gIdx}
                        className={`px-5 py-2 rounded-lg transition-colors ${
                          cancellingIndex === gIdx
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-[#a00300] text-white hover:bg-red-700"
                        }`}
                        onClick={() =>
                          handleCancelPackage(
                            group.items[0]?.shiprocket_order_id,
                            gIdx
                          )
                        }
                      >
                        {cancellingIndex === gIdx
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    ) : group.cancelable?.status === 2 ? (
                      <p className="px-5 py-2 text-gray-500 font-medium border border-gray-300 rounded-lg">
                        {"Order cancelled" || group.cancelable.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              // 👇 Single seller group
              <div className="mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {viewedOrder.seller_group[0].items.map((item) => (
                    <div
                      key={item.id}
                      className="relative flex flex-col items-center bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 group"
                    >
                      {/* Image */}
                      <div className="w-full h-44 flex items-center justify-center overflow-hidden rounded-xl mb-4">
                        <Image
                          src={getImageSrc(item.image)}
                          alt={item.product_name || "Product Image"}
                          className="object-contain w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                          width={180}
                          height={180}
                        />
                      </div>

                      {/* Product Name */}
                      <h3 className="text-md font-semibold text-center text-gray-800 mb-1 line-clamp-2">
                        {item.product_name}
                      </h3>

                      {/* Price + Quantity */}
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-lg font-bold text-[#A00300]">
                          ₹{parseFloat(item.subtotal).toFixed(2)}
                        </p>
                        <span className="text-sm text-gray-600 mt-0.5">
                          x {parseInt(item.quantity)}
                        </span>
                      </div>

                      {/* Review Section */}
                      {item.product_review === true && (
                        <ReviewForm
                          orderId={viewedOrder.order_id}
                          productId={item.id}
                        />
                      )}

                      {/* Hover border accent */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#A00300] pointer-events-none transition-all duration-300"></div>
                    </div>
                  ))}
                </div>

                {/* Cancel Button / Status for single package */}
                <div className="mt-6 flex justify-start">
                  {viewedOrder.seller_group[0].cancelable?.status === 1 ? (
                    <button
                      disabled={cancellingIndex === 0}
                      className={`px-5 py-2 rounded-lg transition-colors ${
                        cancellingIndex === 0
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-[#a00300] text-white hover:bg-red-700"
                      }`}
                      onClick={() =>
                        handleCancelPackage(
                          viewedOrder.seller_group[0].items[0]
                            ?.shiprocket_order_id,
                          0
                        )
                      }
                    >
                      {cancellingIndex === 0 ? "Cancelling..." : "Cancel Order"}
                    </button>
                  ) : viewedOrder.seller_group[0].cancelable?.status === 2 ? (
                    <p className="px-5 py-2 text-gray-500 font-medium border border-gray-300 rounded-lg">
                      {"Order cancelled" ||
                        viewedOrder.seller_group[0].cancelable.message}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
