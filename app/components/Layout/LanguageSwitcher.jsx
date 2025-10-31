"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react"; // or use any other icon lib

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languageOptions = [
    { code: "en", label: "English - EN" },
    { code: "hi", label: "हिंदी - HI" },
    { code: "ta", label: "தமிழ் - TA" },
    { code: "gu", label: "ગુજરાતી - GU" },
    { code: "te", label: "తెలుగు - TE" },
  ];

  const toggleDropdown = () => setOpen((prev) => !prev);

  const changeLang = (lang) => {
    i18n.changeLanguage(lang.toLowerCase());
    localStorage.setItem("i18nextLng", lang);
    setOpen(false); // Close dropdown after selection
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLangCode = i18n?.language
    ? i18n.language.split("-")[0].toUpperCase()
    : "EN";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1 px-3 py-2  text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-md transition-all"
      >
        <Globe className="w-4 h-4 text-gray-900" />
        {currentLangCode}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">
          {languageOptions.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => changeLang(code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                i18n.language === code
                  ? "font-semibold text-[#A00300]"
                  : "text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
