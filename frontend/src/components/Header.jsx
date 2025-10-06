// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = user?.username?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 shadow-md fixed top-0 left-0 right-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center">
        <img src="/vite.svg" alt="Logo" className="h-9 w-auto" />
      </div>

      {/* Right: Avatar Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div
          className="w-10 h-10 rounded-full bg-gradient-to-r from-[#26a3dd] to-[#12699D] flex items-center cursor-pointer justify-center text-white font-bold text-md shadow-md hover:opacity-90 transition"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {initial}
        </div>

        {/* Dropdown */}
        <div
          className={`absolute right-0 mt-3 min-w-[280px] max-w-[320px] bg-white  rounded-lg border z-50 p-4 transform transition-all duration-200 ease-out origin-top-right ${
            dropdownOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          }`}
        >
          {/* User Info */}
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#12699D] text-white font-bold text-lg">
              {initial}
            </div>
            <div className="overflow-hidden">
              <div className="text-gray-900 font-semibold text-base truncate">
                {user?.username || "Unknown User"}
              </div>
              <div className="text-gray-500 text-sm truncate">
                {user?.email || ""}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-3">
            <button
              onClick={logout}
              className="w-full px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
