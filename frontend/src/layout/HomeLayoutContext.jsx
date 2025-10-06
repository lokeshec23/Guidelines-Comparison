// src/layout/HomeLayoutContext.jsx
import React, { createContext, useState, useContext, useCallback } from "react";

const HomeLayoutContext = createContext();

export const useHomeLayout = () => useContext(HomeLayoutContext);

export const HomeLayoutProvider = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard"); // ✅ default dashboard

  const toggleSidebar = useCallback(() => {
    try {
      setIsSidebarExpanded((prev) => !prev);
    } catch (error) {
      console.error("Error toggling sidebar:", error);
    }
  }, []);

  const changeSection = useCallback((sectionName) => {
    try {
      setActiveSection(sectionName);
    } catch (error) {
      console.error("Error changing section:", error);
    }
  }, []);

  return (
    <HomeLayoutContext.Provider
      value={{ isSidebarExpanded, toggleSidebar, activeSection, changeSection }}
    >
      {children}
    </HomeLayoutContext.Provider>
  );
};
