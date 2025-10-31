"use client";
import React, { useState, useEffect } from "react";
import { Edit3, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";
import { PhoneCallIcon, Edit2, X, Home } from "lucide-react";

const Addresses = () => {
  const { getValidToken } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const companyId = localStorage.getItem("company_id");

  // Fetch all addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = await getValidToken();
      const res = await fetch("/api/customer_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ company_id: companyId }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        setAddresses(data.data);
      } else {
        toast.error(data.message || "Failed to fetch addresses ❌");
      }
    } catch (error) {
      console.error("Addresses API Error ❌", error);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle address add
  const handleAddAddress = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding address...");
    try {
      const token = await getValidToken();
      const requestBody = { company_id: companyId, ...formData, active: 1 };

      const res = await fetch("/api/edit_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        toast.update(toastId, {
          render: "Address added successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setIsAddModalOpen(false);
        resetForm();
        fetchAddresses();
      } else {
        toast.update(toastId, {
          render: data.message || "Failed to add address ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Add Address API Error ❌", error);
      toast.update(toastId, {
        render: "Something went wrong ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  // Handle address update
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating address...");
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
      if (res.ok && data.status) {
        toast.update(toastId, {
          render: "Address updated successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setIsEditModalOpen(false);
        resetForm();
        fetchAddresses();
      } else {
        toast.update(toastId, {
          render: data.message || "Failed to update address ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Update Address API Error ❌", error);
      toast.update(toastId, {
        render: "Something went wrong ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (id) => {
    const toastId = toast.loading("Deleting address...");
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
        toast.update(toastId, {
          render: "Address deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        fetchAddresses();
      } else {
        toast.update(toastId, {
          render: data.message || "Failed to delete ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Delete Address API Error ❌", error);
      toast.update(toastId, {
        render: "Something went wrong ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const resetForm = () => {
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
    setSelectedAddress(null);
  };

  // Open edit modal with prefilled data
  const openEditModal = (address) => {
    setSelectedAddress(address);
    setFormData({ ...address });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <div className="space-y-8 w-full px-4 md:px-8 lg:px-16 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {/* <MapPin className="w-6 h-6 text-[#a00300]" /> */}
          My Addresses
        </h2>
        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#a00300] hover:bg-[#d86f6e] text-white px-5 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
        >
          <Plus size={18} /> Add Address
        </button>
      </div>

      {/* Address List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {/* Address Card Skeletons */}
          {[1, 2, 3].map((_, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`group relative p-6 rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 ${
                address.active === 1 ? "border-blue-500" : "border-gray-200"
              }`}
            >
              {/* Show Home Icon ONLY if active === 1 */}
              {address.active == 1 && (
                <div className="absolute top-5 right-5 text-blue-600">
                  <Home size={22} />
                </div>
              )}

              {/* Address Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {address.line1}
                </h3>
                <p className="text-sm text-gray-600">
                  {address.line2}, {address.city} - {address.postal_code}
                </p>
                <p className="text-sm text-gray-600">
                  {address.state}, {address.country}
                </p>
                {address.landmark && (
                  <p className="text-sm text-gray-600">
                    Landmark: {address.landmark}
                  </p>
                )}
                <p className="text-sm text-gray-700 flex items-center mt-3">
                  <PhoneCallIcon className="w-4 h-4 mr-1" />
                  {address.phone}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => openEditModal(address)}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition-transform hover:scale-105"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-transform hover:scale-105"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600 text-lg">No addresses found.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8 relative animate-fade-in">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {isAddModalOpen ? "Add New Address" : "Edit Address"}
            </h2>

            <form
              onSubmit={isAddModalOpen ? handleAddAddress : handleUpdateAddress}
              className="space-y-4"
            >
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <input
                  type="text"
                  name="line1"
                  value={formData.line1}
                  onChange={handleChange}
                  placeholder="Address Line 1"
                  required
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  name="line2"
                  value={formData.line2}
                  onChange={handleChange}
                  placeholder="Address Line 2"
                  required
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only digits up to 6
                    if (/^\d{0,6}$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="Postal Code"
                  required
                  maxLength={6}
                  pattern="\d{6}" // ✅ Must be exactly 6 digits
                  title="Postal code must be exactly 6 digits"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Landmark"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only digits up to 10
                    if (/^\d{0,10}$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="Phone Number"
                  required
                  maxLength={10}
                  pattern="\d{10}" // ✅ Ensures exactly 10 digits on form submit
                  title="Phone number must be exactly 10 digits"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-md transition-transform hover:scale-105"
              >
                {isAddModalOpen ? "Add Address" : "Update Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
