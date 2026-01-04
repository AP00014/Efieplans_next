"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaSun, FaMoon, FaUserPlus } from "react-icons/fa";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import AuthModal from "../AuthModal";
import UserAvatar from "../UserAvatar";
import "../../styles/components/Navbar.css";

// Simple, Fast Hamburger Menu Component
const FastHamburger = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`fast-menu-toggle ${isOpen ? "open" : ""}`}
      aria-label="Toggle mobile menu"
      type="button"
    >
      <div className="hamburger-lines">
        <span className="line line1"></span>
        <span className="line line2"></span>
        <span className="line line3"></span>
      </div>
    </button>
  );
};

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  const handleMobileMenuClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`navbar ${
        isScrolled ? "navbar-scrolled" : "navbar-transparent"
      } ${mounted && isDarkMode ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <div className="container-custom navbar-container">
        {/* Logo - Far Left */}
        <Link href="/" className="navbar-logo">
          <img
            src="https://res.cloudinary.com/dpzndrhse/image/upload/v1750667944/efieplans_logo_edited_kq1tmo.avif"
            alt="Efie plans Construction Logo"
            className="navbar-logo-image"
          />
        </Link>

        {/* Desktop Navigation - Center */}
        <div className="navbar-desktop">
          <Link href="/#home" className="navbar-link">
            Home
          </Link>
          <Link href="/#about" className="navbar-link">
            About
          </Link>

          <Link href="/projects" className="navbar-link">
            Projects
          </Link>
          <Link href="/blog" className="navbar-link">
            Blog
          </Link>


          <Link href="/#contact" className="navbar-link">
            Contact
          </Link>
        </div>

        {/* Controls - Far Right */}
        <div className="navbar-right">
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="desktop-theme-toggle"
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {mounted && isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>

            {user ? (
              /* User Avatar when authenticated */
              <UserAvatar />
            ) : (
              /* Get Started Button when not authenticated */
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="navbar-get-started-btn"
                aria-label="Get Started"
              >
                <FaUserPlus size={16} />
                <span>Get Started</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="navbar-mobile-controls md:hidden">
            <FastHamburger
              isOpen={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            />
          </div>
        </div>
      </div>

      {/* Fast Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fast-mobile-overlay" onClick={handleMobileMenuClick}>
          <div
            className="fast-mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="fast-menu-header">
              <Link
                href="/"
                className="fast-menu-logo"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <img
                  src="https://res.cloudinary.com/dpzndrhse/image/upload/v1750667944/efieplans_logo_edited_kq1tmo.avif"
                  alt="Efie plans Construction Logo"
                  className="fast-menu-logo-img"
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="fast-menu-nav">
              <Link
                href="/#home"
                className="fast-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/#about"
                className="fast-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/projects"
                className="fast-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                href="/blog"
                className="fast-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>



              <Link
                href="/#contact"
                className="fast-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Authentication UI for Mobile */}
              {user ? (
                /* User Avatar for Mobile when authenticated */
                <div className="fast-menu-user-section">
                  <UserAvatar />
                </div>
              ) : (
                /* Get Started Button for Mobile when not authenticated */
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="fast-menu-link fast-get-started"
                  aria-label="Get Started"
                >
                  <div className="fast-theme-content">
                    <FaUserPlus className="fast-theme-icon" />
                    Get Started
                  </div>
                </button>
              )}

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="fast-menu-link fast-theme-toggle"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                <div className="fast-theme-content">
                  {mounted && isDarkMode ? (
                    <>
                      <FaSun className="fast-theme-icon" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <FaMoon className="fast-theme-icon" />
                      Dark Mode
                    </>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
