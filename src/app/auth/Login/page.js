"use client";
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, socialLogin } from '@/services/auth';
import { AuthContext } from '@/context/auth';
import './page.css';
import { auth, googleProvider } from '@/firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const { setIsLoggedIn } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      // If no response or invalid response structure
      if (!response || typeof response !== 'object') {
        setError(
          <div>
            Hey there! 👋<br />
            We don&#39;t have an account with {email} yet. No worries though!<br />
            <Link href="/auth/signup" className="auth-link">
              Click here to create your account
            </Link>
          </div>
        );
        return;
      }

      // Handle error responses
      if (response.err) {
        if (response.err === "User does not exists") {
          setError(
            <div>
              Hey there! 👋<br />
              We don&#39;t have an account with {email} yet. No worries though!<br />
              <Link href="/auth/signup" className="auth-link">
                Click here to create your account
              </Link>
            </div>
          );
        } else if (response.err === "Password does not match") {
          setError(
            <div>
              Hmm, that password doesn&#39;t seem right for {email} 🤔<br />
              <Link href="/auth/forgot-password" className="auth-link">
                Forgot your password? Click here to reset it
              </Link>
            </div>
          );
        } else {
          setError(response.err);
        }
        return;
      }

      // Check for token
      if (!response.token) {
        setError(
          <div>
            Hey there! 👋<br />
            We don&#39;t have an account with {email} yet. No worries though!<br />
            <Link href="/auth/signup" className="auth-link">
              Click here to create your account
            </Link>
          </div>
        );
        return;
      }

      // Successful login
      localStorage.setItem("token", response.token);
      setIsLoggedIn(true);
      
      // Show welcome message
      setSuccessMessage(
        <div className="auth-success">
          Welcome back! 🎉<br />
          Redirecting you to your dashboard...
        </div>
      );

      // Wait for 1.5 seconds to show the welcome message before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err) {
      console.error('Login error:', err);
      setError(
        <div>
          Hey there! 👋<br />
          We don't have an account with {email} yet. No worries though!<br />
          <Link href="/auth/signup" className="auth-link">
            Click here to create your account
          </Link>
        </div>
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMessage('');
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
        
        setSuccessMessage(
          <div className="auth-success">
            Welcome! 🎉<br />
            Redirecting you to your dashboard...
          </div>
        );

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
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
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {successMessage && <div className="auth-success">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don&#39;t have an account?{' '}
            <Link href="/auth/signup" className="auth-link">
              Sign up
            </Link>
          </p>
          <div style={{ marginTop: '12px' }}>
            <button 
              type="button" 
              className="auth-button" 
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? 'Signing in with Google...' : 'Continue with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
