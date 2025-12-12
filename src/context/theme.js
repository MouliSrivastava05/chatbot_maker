"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    console.log('Initial theme check:', { savedTheme, prefersDark });
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
      console.log('Setting initial theme to dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
      console.log('Setting initial theme to light');
    }
  }, []);

  const toggleTheme = () => {
    console.log('Toggling theme, current isDarkMode:', isDarkMode);
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Apply theme to HTML element
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    console.log('Theme toggled to:', newTheme ? 'dark' : 'light');
    console.log('HTML element data-theme:', htmlElement.getAttribute('data-theme'));
  };

  // Log theme state changes
  useEffect(() => {
    console.log('Theme state changed:', isDarkMode);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 