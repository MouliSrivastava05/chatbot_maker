"use client"
import React, { useContext, useEffect, useState } from 'react'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import "./navbar_holder/navbar.css"
import { AuthContext } from '@/context/auth';
import { destroyToken } from '@/helpers/auth';
import { useTheme } from '@/context/theme';

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear the token
      destroyToken();
      // Update the login state
      setIsLoggedIn(false);
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  // Return a loading state or null during server-side rendering
  if (!mounted) {
    return (
      <div className='Navbar'>
        <div className="nav-brand">
          <h1>ChatBot Maker</h1>
        </div>
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/about" className="nav-link">About</Link>
        </div>
      </div>
    );
  }

  return (
    <div className='Navbar'>
      <div className="nav-brand">
        <h1>ChatBot Maker</h1>
      </div>
      <div className="nav-links">
        <Link href="/" className="nav-link">Home</Link>
        <Link href="/about" className="nav-link">About</Link>
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <button onClick={handleLogout} className="nav-button logout">Logout</button>
          </>
        ) : (
          <>
            <Link href="/auth/Login" className="nav-button login">Login</Link>
            <Link href="/auth/signup" className="nav-button signup">Sign Up</Link>
          </>
        )}
        <button 
          onClick={toggleTheme} 
          className="nav-button theme-toggle"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
};

export default Navbar;