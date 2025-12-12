"use client"
import React from 'react';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth';
import './page.css';

const About = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="about-container">
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About ChatBot Maker</h1>
          <p>Your AI-powered assistant platform for instant guidance and support</p>
        </div>
      </section>

      <section className="about-mission">
        <div className="about-mission-content">
          <h2>Our Mission</h2>
          <p>
            ChatBot Maker was created to democratize access to guidance and support. We believe that everyone should have
            instant access to the help they need, when they need it.
          </p>
          <p>
            Our platform enables anyone to create custom AI assistants tailored to specific needs, workflows, and
            knowledge domains, making expertise accessible to all.
          </p>
        </div>
      </section>

      <section className="about-features">
        <h2>Key Features</h2>
        <div className="about-features-grid">
          <div className="about-feature-card">
            <div className="about-feature-icon">🚀</div>
            <h3>Easy to Use</h3>
            <p>Create and deploy your chatbot in minutes with our intuitive interface</p>
          </div>
          <div className="about-feature-card">
            <div className="about-feature-icon">🤖</div>
            <h3>AI-Powered</h3>
            <p>Leverage advanced AI technology for intelligent and contextual responses</p>
          </div>
          <div className="about-feature-card">
            <div className="about-feature-icon">🛠️</div>
            <h3>Customizable</h3>
            <p>Tailor your chatbot to your specific needs and use cases</p>
          </div>
          <div className="about-feature-card">
            <div className="about-feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>Enterprise-grade security to protect your data and conversations</p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to Get Started?</h2>
        <p>Create your first AI assistant in minutes and start getting the guidance you need.</p>
        <div className="about-cta-buttons">
          {isLoggedIn ? (
            <Link href="/dashboard" className="about-primary-button">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/signup" className="about-primary-button">
                Get Started
              </Link>
              <Link href="/auth/Login" className="about-secondary-button">
                Login
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default About;