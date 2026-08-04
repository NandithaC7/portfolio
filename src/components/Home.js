import React from 'react';
import './Home.css';
import myPic from '../assets/mypic.jpeg';
import { FaGithub, FaLinkedin, FaEnvelope, FaArrowRight } from 'react-icons/fa';

function Home() {
  return (
    <section id="home" className="home-section">
      <div className="home-inner">
        <div className="home-text">
          <span className="home-eyebrow">Portfolio</span>

          <h1 className="home-title">
            <span className="accent">Hello,</span> I'm Nanditha
          </h1>
          <p className="home-role">Computer Science Student</p>

          <p className="intro">
            I'm a Computer Science student, currently navigating a chaotic 3rd year-- constant debugging and problem-solving. Where compiling often feels like gambling, StackOverflow adds more confusion than clarity, and VS Code never gets a break. I build things that (usually) work and have a soft spot for clean, smooth user interfaces.
          </p>
          <p className="home-quote">"Still figuring it out— one ';' at a time."</p>

          <div className="home-actions">
            <a href="/resume.pdf" download className="btn btn-primary">Download Resume</a>
            <a href="#contact" className="btn-link">Let's Talk <FaArrowRight /></a>
          </div>

          <div className="social-cards">
            <a className="social-card" href="mailto:your@email.com">
              <FaEnvelope />
              <div>
                <span className="social-card-name">Email</span>
                <span className="social-card-sub">Say Hello</span>
              </div>
            </a>
            <a className="social-card" href="https://github.com/your-github" target="_blank" rel="noreferrer">
              <FaGithub />
              <div>
                <span className="social-card-name">GitHub</span>
                <span className="social-card-sub">See My Work</span>
              </div>
            </a>
            <a className="social-card" href="https://linkedin.com/in/your-linkedin" target="_blank" rel="noreferrer">
              <FaLinkedin />
              <div>
                <span className="social-card-name">LinkedIn</span>
                <span className="social-card-sub">Connect</span>
              </div>
            </a>
          </div>
        </div>

        <div className="home-visual">
          <div className="home-blob"></div>
          <div className="home-pic-frame">
            <img src={myPic} alt="Nanditha" className="home-pic" />
          </div>
          <div className="home-badge">
            <span className="home-badge-num">3rd</span>
            <span className="home-badge-label">Year CSE</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
