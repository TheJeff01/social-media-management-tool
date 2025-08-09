// ThemeToggle.jsx - Theme toggle switch component
import React from 'react';
import { useTheme } from './ThemeContext';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          {isDark ? <MdDarkMode /> : <MdLightMode />}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;