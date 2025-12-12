"use client"
import React from 'react';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth';
import './page.css';

export default function Home() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Create Your Own AI Assistant</h1>
          <p>Build custom chatbots powered by advanced AI to help with your specific needs</p>
          <div className="hero-buttons">
            {isLoggedIn ? (
              <Link href="/dashboard" className="primary-button">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/signup" className="primary-button">
                  Get Started
                </Link>
                <Link href="/auth/Login" className="secondary-button">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Quick Setup</h3>
            <p>Create your AI assistant in minutes with our simple interface</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Customizable</h3>
            <p>Tailor your chatbot to your specific needs and use cases</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Smart Responses</h3>
            <p>Powered by advanced AI for intelligent and contextual responses</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Your data is protected with enterprise-grade security</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up for free and get started in seconds</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Build Your Bot</h3>
            <p>Define your bots purpose and context</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Chatting</h3>
            <p>Interact with your AI assistant instantly</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who are already creating their own AI assistants</p>
        {isLoggedIn ? (
          <Link href="/dashboard" className="primary-button">
            Go to Dashboard
          </Link>
        ) : (
          <Link href="/auth/signup" className="primary-button">
            Create Your First Bot
          </Link>
        )}
      </section>
    </div>
  );
} 