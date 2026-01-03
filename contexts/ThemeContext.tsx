"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThemeContext } from "./ThemeContextValue";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    // Check if user has previously set a theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Otherwise check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Update localStorage and document class when theme changes
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.add("dark-mode");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.remove("dark-mode");
    }

    // Update browser header and mobile status bar colors
    updateBrowserThemeColors(isDarkMode);
  }, [isDarkMode]);

  const updateBrowserThemeColors = (isDark: boolean) => {
    // Define theme colors
    const lightThemeColor = "#ff8c00"; // Primary orange
    const darkThemeColor = "#111827"; // Dark gray
    const currentColor = isDark ? darkThemeColor : lightThemeColor;

    // Update existing theme-color meta tag
    let themeColorMeta = document.querySelector(
      'meta[name="theme-color"]:not([media])'
    ) as HTMLMetaElement;
    if (themeColorMeta) {
      themeColorMeta.content = currentColor;
    } else {
      // Create theme-color meta tag if it doesn't exist
      themeColorMeta = document.createElement("meta");
      themeColorMeta.name = "theme-color";
      themeColorMeta.content = currentColor;
      document.head.appendChild(themeColorMeta);
    }

    // Update Microsoft Edge/IE status bar color
    let msNavButtonMeta = document.querySelector(
      'meta[name="msapplication-navbutton-color"]'
    ) as HTMLMetaElement;
    if (msNavButtonMeta) {
      msNavButtonMeta.content = currentColor;
    } else {
      msNavButtonMeta = document.createElement("meta");
      msNavButtonMeta.name = "msapplication-navbutton-color";
      msNavButtonMeta.content = currentColor;
      document.head.appendChild(msNavButtonMeta);
    }

    // Update Apple Safari status bar style
    let appleStatusBarMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    ) as HTMLMetaElement;
    if (appleStatusBarMeta) {
      appleStatusBarMeta.content = isDark ? "black-translucent" : "default";
    } else {
      appleStatusBarMeta = document.createElement("meta");
      appleStatusBarMeta.name = "apple-mobile-web-app-status-bar-style";
      appleStatusBarMeta.content = isDark ? "black-translucent" : "default";
      document.head.appendChild(appleStatusBarMeta);
    }

    // Update manifest theme color if it exists
    const manifestLink = document.querySelector(
      'link[rel="manifest"]'
    ) as HTMLLinkElement;
    if (manifestLink) {
      // Note: This would require a dynamic manifest, which is more complex
      // For now, we'll focus on the meta tags which work for most browsers
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
