// shakilla_shop/client/src/layouts/sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// Hapus import Cookies
import logo from "../assets/logo-transparent.png";
import axiosClient from "../api/axiosClient";

const Sidebar = ({ menu, isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- PERBAIKAN: Ambil dari sessionStorage ---
  const userRole = sessionStorage.getItem("userRole");
  const userId = sessionStorage.getItem("userId");

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Menghapus semua data otentikasi dari sessionStorage
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userId");

    // Mengarahkan ke halaman login dan me-refresh untuk membersihkan state global React
    navigate("/login", { replace: true });
    window.location.reload();
  };

  // ... (handleLinkClick, useEffect, toggleDropdown, defaultMenu remain the same) ...

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  // contoh menu dengan icon svg bawaan
  const defaultMenu = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: "Products",
      to: "/admin/list-produk",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V7a2 2 0 00-2-2h-4V3H10v2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4"
          />
        </svg>
      ),
      children: [
        { label: "Tambah Produk", to: "/admin/tambah-produk" },
        { label: "List Produk", to: "/admin/list-produk" },
        { label: "List Kategori", to: "/admin/list-kategori" },
      ],
    },
    {
      label: "Users",
      to: "/admin/users",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m0 0A4.001 4.001 0 0112 4a4 4 0 014 4m-4 4a4 4 0 01-4-4"
          />
        </svg>
      ),
    },
    {
      label: "Orders",
      to: "/admin/riwayat",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v10a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      label: "Beranda",
      to: "/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
          />
        </svg>
      ),
    },
  ];

  const finalMenu = menu && menu.length > 0 ? menu : defaultMenu;

  return (
    <>
      {/* Tombol Hamburger dan Header untuk Mobile */}
      <div className="fixed top-0 left-0 w-screen flex items-center justify-between px-4 py-3 bg-purewhite shadow-md md:hidden z-50">
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Shakilla Shop Logo"
            className="h-16 w-auto object-contain"
          />
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-darkgray hover:bg-lightmauve focus:outline-none focus:ring-2 focus:ring-elegantburgundy"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>

      {/* Versi Desktop Sidebar */}
      <aside
        className={`h-screen bg-purewhite border-r border-lightmauve shadow-xl flex-col fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out hidden md:flex
          ${isSidebarOpen ? "w-64" : "w-20"}
        `}
      >
        {/* Header Desktop */}
        <div
          className={`h-16 flex items-center ${
            isSidebarOpen ? "justify-between" : "justify-center"
          } px-4 border-b border-lightmauve`}
        >
          {isSidebarOpen && (
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Shakilla Shop Logo"
                className="h-16 w-auto object-contain"
              />
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-lightmauve focus:outline-none focus:ring-2 focus:ring-elegantburgundy hidden md:block"
          >
            <svg
              className={`w-5 h-5 text-darkgray transform transition-transform duration-300 ${
                isSidebarOpen ? "" : "rotate-180"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
        </div>

        {/* Menu Navigasi Desktop */}
        <nav className="mt-4 flex-1 overflow-y-auto overflow-x-hidden px-2 md:px-4">
          <ul className="space-y-1">
            {finalMenu.map((item, idx) => {
              const itemTo =
                item.label === "Dashboard" && userRole
                  ? userRole === "admin"
                    ? "/admin/dashboard"
                    : "/user/dashboard"
                  : item.to;

              const isActive =
                item.label === "Beranda"
                  ? location.pathname === itemTo
                  : location.pathname.startsWith(itemTo);

              const hasChildren = item.children && item.children.length > 0;
              const isDropdownOpen = openDropdown === item.label;

              return (
                <li key={idx}>
                  {!hasChildren ? (
                    <Link
                      to={itemTo}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200
            ${isSidebarOpen ? "justify-start" : "justify-center"}
            ${
              isActive
                ? "bg-lightmauve text-elegantburgundy font-semibold"
                : "text-darkgray hover:bg-lightmauve"
            }
          `}
                      title={!isSidebarOpen ? item.label : ""}
                    >
                      {item.icon}
                      {isSidebarOpen && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-200
                          ${
                            isSidebarOpen ? "justify-between" : "justify-center"
                          }
                          ${
                            isDropdownOpen ||
                            (isActive && item.label !== "Beranda")
                              ? "bg-lightmauve text-elegantburgundy font-semibold"
                              : "text-darkgray hover:bg-lightmauve"
                          }
                        `}
                        title={!isSidebarOpen ? item.label : ""}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {isSidebarOpen && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>
                        {isSidebarOpen && (
                          <svg
                            className={`w-5 h-5 text-darkgray transform transition-transform duration-300 ${
                              isDropdownOpen ? "rotate-90" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            ></path>
                          </svg>
                        )}
                      </button>
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden
                          ${
                            isDropdownOpen
                              ? "max-h-40 opacity-100"
                              : "max-h-0 opacity-0"
                          }
                        `}
                      >
                        <ul
                          className={`pl-8 mt-1 space-y-1 ${
                            !isSidebarOpen && "pl-4"
                          }`}
                        >
                          {item.children.map((child, cidx) => {
                            const isChildActive =
                              location.pathname === child.to;
                            return (
                              <li key={cidx}>
                                <Link
                                  to={child.to}
                                  className={`block px-4 py-2 rounded-lg transition-colors duration-200
                                    ${
                                      isChildActive
                                        ? "bg-softpink text-elegantburgundy font-medium"
                                        : "text-darkgray/70 hover:bg-lightmauve"
                                    }
                                  `}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Tombol Logout Desktop */}
        <div className="mt-auto p-4 border-t border-lightmauve">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-darkgray hover:bg-softpink/50 hover:text-elegantburgundy font-semibold transition-colors duration-200
              ${isSidebarOpen ? "justify-start" : "justify-center"}
            `}
            title={!isSidebarOpen ? "Logout" : ""}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {isSidebarOpen && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Versi Mobile Dropdown Menu */}
      <div
        className={`md:hidden fixed top-20 left-0 right-0 bottom-0 z-[49] bg-purewhite shadow-xl overflow-y-auto transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-6">
          <nav>
            <ul className="space-y-1">
              {finalMenu.map((item, idx) => {
                const itemTo =
                  item.label === "Dashboard" && userRole
                    ? userRole === "admin"
                      ? "/admin/dashboard"
                      : "/user/dashboard"
                    : item.to;
                return (
                  <li key={idx}>
                    <Link
                      to={itemTo}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block p-3 rounded-lg text-base font-medium text-darkgray hover:text-purewhite hover:bg-elegantburgundy transition-colors duration-300"
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.children.map((child, cidx) => (
                          <li key={cidx}>
                            <Link
                              to={child.to}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-4 py-2 rounded-lg text-sm text-darkgray/70 hover:bg-lightmauve"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Tombol Logout Mobile */}
          <div className="mt-4 border-t border-lightmauve pt-4">
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left p-3 rounded-lg text-base font-medium text-elegantburgundy hover:text-purewhite hover:bg-softpink transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay untuk mobile di luar menu */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 z-[48] bg-black/50 transition-opacity duration-300"
        />
      )}

      {/* Modal Konfirmasi Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-purewhite p-6 rounded-lg shadow-xl w-80">
            <h3 className="text-xl font-bold mb-4 text-darkgray">
              Konfirmasi Logout
            </h3>
            <p className="text-darkgray/70 mb-6">
              Apakah Anda yakin ingin keluar dari akun ini?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-2 px-4 border border-lightmauve rounded-md shadow-sm text-sm font-medium text-darkgray hover:bg-lightmauve transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purewhite bg-elegantburgundy hover:bg-softpink transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
