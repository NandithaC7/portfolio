import React from 'react';
import './Projects.css';
import { FaArrowRight } from 'react-icons/fa';

import redImg from '../assets/red.jpg';
import greenImg from '../assets/green.png';
import blueImg from '../assets/blue.png';
import orangeImg from '../assets/orange.png';
import grayImg from '../assets/gray.png';

const projects = [
  { img: redImg, title: 'EdgeAIGC', desc: 'Smart traffic monitoring with model caching & resource allocation.' },
  { img: greenImg, title: 'STM32F401', desc: 'Real-world case scenario using STM32F401 board.' },
  { img: blueImg, title: 'ZYNK', desc: 'Journal-style social media website to digitize your life.' },
  { img: orangeImg, title: 'Research Paper', desc: 'Paper on edge computing, model caching, and more.' },
  { img: orangeImg, title: 'Ticket Booking', desc: 'Responsive movie ticket booking system with frontend/backend.' },
  { img: grayImg, title: 'Coming Soon', desc: 'Project in progress. Stay tuned!' },
];

function Projects() {
  return (
    <section id="projects" className="section projects-section">
      <span className="section-eyebrow">My Work</span>
      <h2 className="section-title">Featured <span className="accent">Projects</span></h2>

      <div className="project-grid">
        {projects.map((project, i) => (
          <div className="project-card" key={`${project.title}-${i}`}>
            <div className="project-image-wrap">
              <img src={project.img} className="project-image" alt={project.title} />
            </div>
            <div className="project-body">
              <div className="project-heading">
                <h3 className="project-title">{project.title}</h3>
                <span className="project-arrow"><FaArrowRight /></span>
              </div>
              <p className="project-desc">{project.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;
