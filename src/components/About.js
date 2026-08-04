import React from 'react';
import cirss from '../assets/cirss.jpg';
import amrita from '../assets/amrit.svg';
import './About.css';

function About() {
  return (
    <section id="about" className="section about-section">
      <span className="section-eyebrow">Introduction</span>
      <h2 className="section-title">About <span className="accent">Me</span></h2>

      <p className="about-para">
        I’m all about decking up slick, user‑friendly UIs. Right now I’m exploring in full‑stack —React + Node/Express on top,
        MongoDB & Postgres underneath—building fast, scalable apps. I’m also digging into edge computing to slash latency 
        for real‑time stuff. On the ML side I roll with Python (TensorFlow, scikit‑learn, Pandas), and when raw speed’s a must, 
        I break out the C++. Always leveling up my coding chops to keep things clean, efficient, and maintainable.
      </p>

      <div className="about-cards">
        <div className="about-card">
          <h3 className="about-card-title">Certifications</h3>
          <p>✅ Udemy Course on Full-Stack Development</p>
          <p>✅ Coursera Course on Machine Learning</p>
        </div>

        <div className="about-card">
          <h3 className="about-card-title">Internships</h3>
          <p>☀️ Summer Internship 2026 – Software Development Intern</p>
        </div>
      </div>

      <h3 className="about-section-heading">Education</h3>
      <div className="edu-timeline">
        <div className="edu-entry">
          <img src={amrita} alt="Amrita Logo" className="edu-logo" />
          <div>
            <h4>Computer Science Engineering - III rd Year</h4>
            <p>Amrita Vishwa Vidyapeetham, Coimbatore</p>
            <p>CGPA: -</p>
          </div>
        </div>

        <div className="edu-entry">
          <img src={cirss} alt="Chinmaya Logo" className="edu-logo" />
          <div>
            <h4>High School - Chinmaya International Residential School</h4>
            <p>12th Grade CBSE BOARDS: 89.8%</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
