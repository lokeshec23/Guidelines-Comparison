// src/layout/HomeLayoutContext.jsx
import React, { createContext, useState, useContext, useCallback } from "react";

const HomeLayoutContext = createContext();

export const useHomeLayout = () => useContext(HomeLayoutContext);

export const HomeLayoutProvider = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("Ingestion");

  // Toggle sidebar expand/collapse
  const toggleSidebar = useCallback(() => {
    try {
      setIsSidebarExpanded((prev) => !prev);
    } catch (error) {
      console.error("Error toggling sidebar:", error);
    }
  }, []);

  // Change active section
  const changeSection = useCallback((sectionName) => {
    try {
      setActiveSection(sectionName);
    } catch (error) {
      console.error("Error changing section:", error);
    }
  }, []);

  const value = {
    isSidebarExpanded,
    toggleSidebar,
    activeSection,
    changeSection,
  };

  return (
    <HomeLayoutContext.Provider value={value}>
      {children}
    </HomeLayoutContext.Provider>
  );
};
