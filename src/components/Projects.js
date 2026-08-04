import React from 'react';
import './Projects.css'; // Make sure this import is at the top

import redImg from '../assets/red.jpg';
import greenImg from '../assets/green.png';
import blueImg from '../assets/blue.png';
import orangeImg from '../assets/orange.png';
import grayImg from '../assets/gray.png';

function Projects() {
  return (
    <section id="projects" className="projects-section">
      <h2 className="section-title">Projects</h2>

      <div className="project-grid">

        <div className="project-card">
          <img src={redImg} className="project-image" alt="EdgeAIGC" />
          <div className="project-overlay">
            <div className="project-title">EdgeAIGC</div>
            <div className="project-desc">Smart traffic monitoring with model caching & resource allocation.</div>
          </div>
        </div>

        <div className="project-card">
          <img src={greenImg} className="project-image" alt="STM32F401" />
          <div className="project-overlay">
            <div className="project-title">STM32F401</div>
            <div className="project-desc">Real-world case scenario using STM32F401 board.</div>
          </div>
        </div>

        <div className="project-card">
          <img src={blueImg} className="project-image" alt="ZYNK" />
          <div className="project-overlay">
            <div className="project-title">ZYNK</div>
            <div className="project-desc">Journal-style social media website to digitize your life.</div>
          </div>
        </div>

        <div className="project-card">
          <img src={orangeImg} className="project-image" alt="Research Paper" />
          <div className="project-overlay">
            <div className="project-title">Research Paper</div>
            <div className="project-desc">Paper on edge computing, model caching, and more.</div>
          </div>
        </div>

        <div className="project-card">
          <img src={orangeImg} className="project-image" alt="Movie Booking System" />
          <div className="project-overlay">
            <div className="project-title">Ticket Booking</div>
            <div className="project-desc">Responsive movie ticket booking system with frontend/backend.</div>
          </div>
        </div>

        <div className="project-card">
          <img src={grayImg} className="project-image" alt="Upcoming" />
          <div className="project-overlay">
            <div className="project-title">Coming Soon</div>
            <div className="project-desc">Project in progress. Stay tuned!</div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Projects;
