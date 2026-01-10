"use client";
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup, login, socialLogin } from '@/services/auth';
import { AuthContext } from '@/context/auth';
import './page.css';
import { auth, googleProvider } from '@/firebase';
import { signInWithPopup } from 'firebase/auth';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { setIsLoggedIn } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // First sign up the user
      await signup({
        email: formData.email,
        password: formData.password,
      });

      // Then automatically log them in
      const loginResponse = await login({
        email: formData.email,
        password: formData.password,
      });

      // Store the token
      localStorage.setItem("token", loginResponse.token);
      setIsLoggedIn(true);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    
    try {
      // Check if Firebase is properly configured
      if (!auth || !googleProvider) {
        throw new Error('Firebase authentication is not properly configured');
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user?.email;
      
      if (!email) {
        throw new Error('No email found in Google account');
      }

      // Register/login user with our backend
      const reg = await socialLogin({ email });
      
      if (reg?.token) {
        localStorage.setItem("token", reg.token);
        setIsLoggedIn(true);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Failed to create user session');
      }
    } catch (err) {
      console.error('Google sign-in failed:', err);
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      // Handle specific Firebase errors
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join us and start creating your AI assistants</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link href="/auth/Login" className="auth-link">
              Sign in
            </Link>
          </p>
          <div style={{ marginTop: '12px' }}>
            <button 
              type="button" 
              className="auth-button" 
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? 'Signing up with Google...' : 'Continue with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
