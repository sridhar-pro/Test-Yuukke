"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, MoreVertical } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";
import Image from "next/image";

const MyEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [viewedEnquiry, setViewedEnquiry] = useState(null);

  const { getValidToken } = useAuth();

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      const token = await getValidToken();
      if (token && typeof token === "string" && token.length > 10) return token;
      if (attempt === 5) localStorage.removeItem("authToken");
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
      return fetchWithAuth(url, options, true);
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  // Fetch Enquiries
  const fetchEnquiries = async (currentPage = 1) => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem("company_id");
      // console.log("Company ID:", companyId);

      if (!companyId) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      const data = await fetchWithAuth("/api/enquiry", {
        method: "POST",
        body: JSON.stringify({
          company_id: Number(companyId),
          filters: { page: currentPage },
        }),
      });

      // console.log("📩 Enquiry Response:", data);

      if (data.status && data.data?.enquiries) {
        setEnquiries(data.data.enquiries);
        setPage(data.data.pagination.page || 1);
        setLimit(data.data.pagination.per_page || 10);
        setTotal(data.data.pagination.total_rows || 0);
      } else {
        toast.error(data.message || "Failed to fetch enquiries ❌");
      }
    } catch (err) {
      console.error("Enquiries API Error ❌", err);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries(page);
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
        <h2 className="text-xl font-bold mb-4 text-black">
          Enquiries Dashboard
        </h2>
        {/* Enquiry Table */}
        {!viewedEnquiry && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Enquiry ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-7 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {enquiries.length > 0 ? (
                    enquiries.map((enquiry, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {/* Enquiry ID */}
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {enquiry.id}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {enquiry.created_date}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                              enquiry.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {enquiry.comment_status}
                          </span>
                        </td>

                        {/* Details */}
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {enquiry.enquiry_status || "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <button
                              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition"
                              onClick={async () => {
                                try {
                                  const token = await getValidToken();

                                  // 🎯 Fetch enquiry details using enquiry.id
                                  const res = await fetch(
                                    "/api/enquirydetails",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: JSON.stringify({
                                        id: enquiry.id,
                                      }),
                                    }
                                  );

                                  const data = await res.json();

                                  // ✅ Handle successful response
                                  if (data.status === true) {
                                    // console.log(
                                    //   "📩 Enquiry Details:",
                                    //   data.data
                                    // );
                                    setViewedEnquiry(data.data); // store the detailed enquiry
                                  } else {
                                    toast.error(
                                      "Failed to fetch enquiry details. Try again."
                                    );
                                  }
                                } catch (err) {
                                  console.error(
                                    "❌ Error fetching enquiry details:",
                                    err
                                  );
                                  toast.error(
                                    "Something went wrong while fetching details!"
                                  );
                                }
                              }}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-10">
                        <div className="flex flex-col items-center justify-center py-16">
                          <img
                            src="/help.png"
                            alt="Help"
                            className="w-16 h-16 object-contain opacity-60"
                          />
                          <h3 className="mt-4 text-lg font-semibold text-gray-600">
                            No enquiries found
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            Need assistance? Try reaching out for support.
                          </p>
                          <button
                            onClick={() => router.push("/support")}
                            className="mt-6 px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                          >
                            Get Help
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 🌐 Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {enquiries.length > 0 ? (
                enquiries.map((enquiry, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-200 p-4 shadow-sm bg-white"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Enquiry ID: {enquiry.id}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                          enquiry.comment_status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {enquiry.comment_status}
                      </span>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-500 mb-1">
                      Date: {enquiry.created_date}
                    </p>

                    {/* Enquiry Info */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">
                          Status:
                        </span>{" "}
                        {enquiry.enquiry_status || "—"}
                      </p>
                    </div>

                    {/* 💥 Actions */}
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition"
                        onClick={async () => {
                          try {
                            const token = await getValidToken();

                            // 🎯 Fetch enquiry details
                            const res = await fetch("/api/enquirydetails", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                id: enquiry.id,
                              }),
                            });

                            const data = await res.json();

                            // ✅ Handle successful response
                            if (data.status === true) {
                              // console.log("📩 Enquiry Details:", data.data);
                              setViewedEnquiry(data.data); // show the enquiry detail view
                            } else {
                              toast.error(
                                "Failed to fetch enquiry details. Try again."
                              );
                            }
                          } catch (err) {
                            console.error(
                              "❌ Error fetching enquiry details:",
                              err
                            );
                            toast.error(
                              "Something went wrong while fetching details!"
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
                <p className="text-center text-gray-600">No enquiries found.</p>
              )}
            </div>

            {/* Pagination */}
            {enquiries.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                <button
                  disabled={page === 1}
                  onClick={() => fetchEnquiries(page - 1)}
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
                  onClick={() => fetchEnquiries(page + 1)}
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

        {/* Render Enquiry Details */}
        {viewedEnquiry && (
          <div className="flex flex-col">
            {/* Back button */}
            <div className="mb-6">
              <button
                onClick={() => setViewedEnquiry(null)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Enquiries
              </button>
            </div>

            {/* Enquiry Info + Product Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Enquiry Information */}
              <div className="bg-white rounded-2xl shadow-md p-6 ">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Enquiry Information
                </h2>
                <div className="space-y-4 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold text-gray-900">
                      Enquiry ID:
                    </span>{" "}
                    {viewedEnquiry.id}
                  </p>
                  {/* <p>
                    <span className="font-semibold text-gray-900">
                      Customer:
                    </span>{" "}
                    {viewedEnquiry.customer}
                  </p> */}
                  <p>
                    <span className="font-semibold text-gray-900">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                        viewedEnquiry.comment_status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {viewedEnquiry.comment_status}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Enquiry Date:
                    </span>{" "}
                    {viewedEnquiry.created_date}
                  </p>
                  <p className="capitalize">
                    <span className="font-semibold text-gray-900">
                      Enquiry Status:
                    </span>{" "}
                    {viewedEnquiry.enquiry_status}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Warehouse ID:
                    </span>{" "}
                    {viewedEnquiry.warehouse_id || "—"}
                  </p>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Product Details
                </h2>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Product Image */}
                  <div className="w-40 h-40 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                    <Image
                      src={getImageSrc(viewedEnquiry.product_image)}
                      alt={viewedEnquiry.product_name || "Product Image"}
                      className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
                      width={160}
                      height={160}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col justify-center text-sm text-gray-700 gap-y-3">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">
                      {viewedEnquiry.product_name}
                    </h3>
                    <p className="mb-1">
                      <span className="font-semibold text-gray-900">
                        Product Code:
                      </span>{" "}
                      {viewedEnquiry.product_code}
                    </p>
                    {/* <p className="mb-1">
                      <span className="font-semibold text-gray-900">Type:</span>{" "}
                      {viewedEnquiry.type || "—"}
                    </p> */}
                    <p className="mb-2">
                      <span className="font-semibold text-gray-900">
                        Product ID:
                      </span>{" "}
                      {viewedEnquiry.product_id}
                    </p>

                    {/* Status */}
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full self-start capitalize ${
                        viewedEnquiry.enquiry_status === "requested"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {viewedEnquiry.enquiry_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* 💬 Enquiry Conversation Section */}
            {viewedEnquiry.reply && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Enquiry Discussion
                </h2>

                <div className="space-y-6">
                  {/* 🧑‍💼 User Question */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                      Q
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl text-gray-800 w-full">
                      <p className="font-semibold mb-1 text-gray-900">
                        User’s Enquiry
                      </p>
                      <p className="text-sm">{viewedEnquiry.enquiry_details}</p>
                    </div>
                  </div>

                  {/* 🤖 Admin/Staff Reply */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 font-semibold">
                      A
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-gray-800 w-full">
                      <p className="font-semibold mb-1 text-gray-900">Reply</p>
                      <div
                        className="text-sm"
                        dangerouslySetInnerHTML={{
                          __html: viewedEnquiry.reply,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEnquiries;
