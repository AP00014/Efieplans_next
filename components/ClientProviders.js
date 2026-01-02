"use client";

import { ThemeProvider } from "../contexts/ThemeContext";
import ProjectsPrefetchProvider from "./ProjectsPrefetchProvider";

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      <ProjectsPrefetchProvider>{children}</ProjectsPrefetchProvider>
    </ThemeProvider>
  );
}
