"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { XCircle } from "lucide-react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [name, setName] = useState(null); // ⬅️ New
  const [userId, setUserId] = useState(null);
  const [groupId, setGroupId] = useState(null);

  // 🚫 Prevent multiple logout toasts
  const isLoggingOut = useRef(false);

  // 🔄 Load session from localStorage
  const loadSession = () => {
    const storedCompanyId = localStorage.getItem("company_id");
    const storedName = localStorage.getItem("name"); // ⬅️ New
    const storedUserId = localStorage.getItem("user_id");
    const storedGroupId = localStorage.getItem("group_id");
    setIsLoggedIn(!!storedCompanyId);
    setCompanyId(storedCompanyId);
    setName(storedName); // ⬅️ Set
    setUserId(storedUserId);
    setGroupId(storedGroupId);
  };

  // On mount, and listen for manual storage wipes
  useEffect(() => {
    loadSession();

    const handleStorageChange = () => {
      if (event.key === "company_id" && !event.newValue) {
        // Only react to logout from OTHER tabs
        if (isLoggedIn) {
          // Update state silently, no toast here
          setIsLoggedIn(false);
          setCompanyId(null);
          setName(null); // ⬅️ Clear
          setUserId(null);
          setGroupId(null);
          router.push("/");
        }
      } else {
        loadSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isLoggedIn, router]);

  // ✅ Login function
  const handleLogin = ({
    company_id,
    name, // ⬅️ Expecting this from API
    user_id,
    access_token,
    refresh_token,
    group_id,
  }) => {
    localStorage.setItem("company_id", company_id);
    localStorage.setItem("name", name); // ⬅️ Store
    localStorage.setItem("user_id", user_id);
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    if (group_id) {
      localStorage.setItem("group_id", group_id);
      setGroupId(group_id);
    }

    setIsLoggedIn(true);
    setCompanyId(company_id);
    setName(name); // ⬅️ Set
    setUserId(user_id);
  };

  // ✅ Logout function
  const handleLogout = () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    localStorage.clear();
    setIsLoggedIn(false);
    setCompanyId(null);
    setName(null); // ⬅️ Clear
    setUserId(null);
    setGroupId(null);

    // 🔔 Single toast on manual logout
    toast.info(
      <div className="flex items-center gap-2">
        <XCircle className="w-5 h-5 text-red-400" />
        <span>You have been logged out</span>
      </div>,
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        icon: false,
        style: {
          background: "#000",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
        },
      }
    );

    router.push("/");

    setTimeout(() => {
      isLoggingOut.current = false;
    }, 500);
  };

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn,
        companyId,
        name, // ⬅️ Expose
        userId,
        groupId,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
