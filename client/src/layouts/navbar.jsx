import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CartDropdown from "../components/CartDropdown";
import logo from "../assets/logo-transparent.png";
import axiosClient from "../api/axiosClient"; // <-- REFACTOR: Import axiosClient

const Navbar = ({ key }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  const mobileMenuRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  const userRole = Cookies.get("userRole");
  const userId = Cookies.get("userId");
  const isLoggedIn = !!userRole;

  const fetchCartData = async () => {
    if (!userId) {
      setCartItems([]);
      setLoadingCart(false);
      return;
    }
    try {
      // REFACTOR: Menggunakan axiosClient.get
      const response = await axiosClient.get(`/carts/user/${userId}`);
      const data = response.data;
      
      if (data?.CartItems) {
        setCartItems(data.CartItems);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [userId, key]);

  const handleClickOutside = (event) => {
    if (cartRef.current && !cartRef.current.contains(event.target)) {
      setIsCartOpen(false);
    }
    // Logika penutupan menu mobile
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isCartOpen) setIsCartOpen(false);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const removeItem = async (itemId) => {
    try {
      // REFACTOR: Menggunakan axiosClient.delete. Axios otomatis handle method DELETE dan credentials.
      await axiosClient.delete(`/carts/item/${itemId}`);

      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const CartIcon = ({ itemCount }) => (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-elegantburgundy text-purewhite rounded-full text-xs h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </div>
  );

  const HamburgerIcon = ({ isOpen }) => (
    <svg
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      {isOpen ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      )}
    </svg>
  );

  return (
    <nav className="bg-purewhite sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Shakilla Shop Logo"
              className="h-20 w-auto object-contain"
            />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-darkgray font-semibold text-sm transition-colors duration-300 hover:text-elegantburgundy tracking-wide">
              Home
            </Link>
            <Link to="/products" className="text-darkgray font-semibold text-sm transition-colors duration-300 hover:text-elegantburgundy tracking-wide">
              Products
            </Link>
            <Link to="/about" className="text-darkgray font-semibold text-sm transition-colors duration-300 hover:text-elegantburgundy tracking-wide">
              About Us
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  to={userRole === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                  className="hidden md:flex items-center px-4 py-2 text-sm font-semibold text-darkgray bg-lightmauve rounded-full hover:bg-elegantburgundy hover:text-purewhite transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden md:block text-darkgray font-semibold text-sm hover:text-elegantburgundy">
                  Login
                </Link>
                <Link to="/signup" className="hidden md:block px-4 py-2 text-sm font-semibold text-purewhite bg-elegantburgundy rounded-full hover:bg-softpink">
                  Daftar
                </Link>
              </>
            )}

            <div className="relative" ref={cartRef}>
              <button
                onClick={toggleCart}
                className="p-2 rounded-full text-darkgray hover:bg-lightmauve focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elegantburgundy transition-colors duration-300"
                aria-label="Toggles cart dropdown"
              >
                <CartIcon itemCount={cartItems.length} />
              </button>
              <CartDropdown
                cartItems={cartItems}
                onRemoveItem={removeItem}
                isCartOpen={isCartOpen}
                onToggle={toggleCart}
              />
            </div>
            
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-full text-darkgray hover:bg-lightmauve focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elegantburgundy transition-colors duration-300"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <HamburgerIcon isOpen={isMobileMenuOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        ref={mobileMenuRef}
        className={`absolute md:hidden bg-purewhite w-full shadow-lg overflow-hidden transition-all duration-300 ease-in-out z-[49] ${ // z-index diubah
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-2 text-center">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-darkgray hover:text-purewhite hover:bg-elegantburgundy transition-colors duration-300">
            Home
          </Link>
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-darkgray hover:text-purewhite hover:bg-elegantburgundy transition-colors duration-300">
            Products
          </Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-darkgray hover:text-purewhite hover:bg-elegantburgundy transition-colors duration-300">
            About Us
          </Link>
          {isLoggedIn ? (
            <>
              <Link to={userRole === "admin" ? "/admin/dashboard" : "/user/dashboard"} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-darkgray hover:text-purewhite hover:bg-elegantburgundy transition-colors duration-300">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-darkgray hover:text-purewhite hover:bg-elegantburgundy transition-colors duration-300">
                Login
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-purewhite bg-elegantburgundy hover:bg-softpink transition-colors rounded-lg">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
      
    </nav>
  );
};

export default Navbar;