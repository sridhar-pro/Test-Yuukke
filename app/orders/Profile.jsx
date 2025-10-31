"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  Lock,
  Edit,
  UserX,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import { toast } from "react-toastify";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const { getValidToken } = useAuth();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await getValidToken();

      const res = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();

      if (data.status === "success") {
        setProfile(data.data);
      } else {
        toast.error(data.message || "Failed to load profile ❌");
      }
    } catch (err) {
      console.error("❌ Profile fetch error:", err);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 w-full -translate-y-28">
        {/* 🧍‍♂️ Lucide Icon */}
        <div className="bg-gray-100 p-6 rounded-full mb-4 shadow-inner">
          <UserX className="w-16 h-16 text-gray-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          No Profile Found
        </h2>

        {/* Message */}
        <p className="text-gray-500 max-w-md">
          We couldn’t find your profile details right now. Try refreshing the
          page or updating your account info.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-auto">
      <div className="flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-neutral-200 bg-white p-6 md:p-10">
        <h2 className="text-xl font-bold mb-6 text-black">My Profile</h2>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="flex items-center gap-3 border rounded-lg p-4 shadow-sm bg-gray-50">
            <User className="text-[#a00300]" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold text-gray-900">{profile.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border rounded-lg p-4 shadow-sm bg-gray-50">
            <Mail className="text-[#a00300]" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-gray-900">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border rounded-lg p-4 shadow-sm bg-gray-50">
            <Phone className="text-[#a00300]" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-semibold text-gray-900">
                {profile.phone || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border rounded-lg p-4 shadow-sm bg-gray-50">
            <Building2 className="text-[#a00300]" />
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-semibold text-gray-900">
                {profile.company || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border rounded-lg p-4 shadow-sm bg-gray-50">
            <CalendarDays className="text-[#a00300]" />
            <div>
              <p className="text-sm text-gray-500">Joined On</p>
              <p className="font-semibold text-gray-900">
                {profile.joined_at || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Security + Actions */}
        <div className="flex flex-col md:flex-row gap-6">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 font-medium hover:bg-yellow-200 transition">
            <Lock className="w-4 h-4" /> Change Password
          </button>
        </div>

        {/* Extra Info / Activity */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Account Activity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="font-semibold text-gray-900">
                {profile.last_login || "—"}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="font-semibold text-gray-900">
                {profile.total_orders || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
              <p className="text-sm text-gray-500">Total Enquiries</p>
              <p className="font-semibold text-gray-900">
                {profile.total_enquiries || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
