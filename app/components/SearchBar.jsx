"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

const SearchBar = () => {
  const [isActive, setIsActive] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token found");
      return;
    }

    try {
      const res = await axios.post(
        "/api/getProducts",
        {
          filters: {
            page: 1,
            query: searchTerm,
            limit: 10,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.products) {
        setResults(res.data.products);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsActive(false);
      setShowDropdown(false);
      setQuery("");
      setResults([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(
        `/products/query?query=${encodeURIComponent(query)}`,
        { scroll: false } // 👈 ensures it re-renders content
      );
      setIsActive(false);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Search Icon Button */}
      {!isActive && (
        <button
          onClick={() => {
            setIsActive(true);
            setQuery("");
            setResults([]);
            setShowDropdown(false);
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Open search"
        >
          <Search className="w-4 md:w-5 h-4 md:h-5 text-black cursor-pointer" />
        </button>
      )}

      {/* Search Overlay (appears when active) */}
      {isActive && (
        <div
          className="absolute top-20 md:top-full -right-[10rem] md:right-3 z-50 -mt-10"
          ref={containerRef}
        >
          {/* Search Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-white border border-gray-800 shadow-lg rounded-full px-4 py-3 focus-within:ring-2 ring-gray-300 transition-all duration-200 w-[90vw] max-w-md md:w-[450px]"
          >
            <Search className="w-4 md:w-5 h-4 md:h-5 text-gray-400 mr-2" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              autoFocus
              placeholder="Search for the perfect gift..."
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsActive(false);
                setShowDropdown(false);
              }}
              className="text-gray-400 hover:text-[#A00300] transition duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Dropdown Results */}
          {showDropdown && results.length > 0 && (
            <div className="mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl w-[90vw] max-w-md md:w-[400px] flex flex-col">
              {/* Scrollable products list */}
              <div className="max-h-80 overflow-y-auto scrollbar-hide">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      router.push(`/products/${product.slug}`);
                      setIsActive(false);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all duration-150 border-b border-b-gray-300 last:border-none"
                  >
                    <img
                      src={`https://marketplace.yuukke.com/assets/uploads/${product.image}`}
                      alt={product.name}
                      className="w-20 md:w-24 h-20 md:h-24 object-cover rounded-xl shadow-sm"
                    />
                    <div className="flex flex-col justify-center overflow-hidden">
                      <p className="text-lg capitalize font-semibold text-gray-900 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.details || "Perfect for every occasion!"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Results (sticky at bottom) */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200">
                <button
                  onClick={() => {
                    router.push(
                      `/products/query?query=${encodeURIComponent(query)}`
                    );
                    setIsActive(false);
                    setShowDropdown(false);
                  }}
                  className="w-full py-3 bg-[#A00300] text-white font-medium rounded-b-2xl hover:bg-[#850200] transition"
                >
                  View All Results →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
