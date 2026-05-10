import React from 'react';
import './Hero.css';
import heroBg from '../assets/hero-bg.png';

const Hero = () => {
  return (
    <section className="hero">
      <div 
        className="hero-background" 
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="hero-overlay"></div>
      </div>
      
      <div className="container hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            Transforming Healthcare<br/>Through Innovation
          </h1>
          <p className="hero-subtitle">
            Connect Doctors, HR Professionals, Hospitals & Patients on India's Most<br/>Trusted Medical Network
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
