"use client";
import React from "react";
import { LogOut } from "lucide-react";
import { useSession } from "../context/SessionContext";

const LogoutButton = () => {
  const { isLoggedIn, handleLogout } = useSession();

  if (!isLoggedIn) return null; // Hide if not logged in

  return (
    <button
      onClick={handleLogout}
      className="flex items-start gap-2 px-3 py-1  transition"
      aria-label="Log out"
    >
      <LogOut className="w-4 h-4 text-red-600" />
      <span className="text-sm font-medium text-red-600">Logout</span>
    </button>
  );
};

export default LogoutButton;
