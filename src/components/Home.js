import React from 'react';
import './Home.css';
import myPic from '../assets/mypic.jpeg'; 
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

function Home() {
  return (
    <section id="home" className="home-section">
      <div className="home-content">
        <img src={myPic} alt="Nanditha" className="home-pic" />

        <div className="home-text">
          <h1 className="name"> </h1>

          <div className="social-icons">
            <a href="mailto:your@email.com">
              <FaEnvelope />
            </a>
            <a href="https://github.com/your-github" target="_blank" rel="noreferrer">
              <FaGithub />
            </a>
            <a href="https://linkedin.com/in/your-linkedin" target="_blank" rel="noreferrer">
              <FaLinkedin />
            </a>
          </div>

          <p className="intro">
            I'm a Computer Science student, currently navigating a chaotic 3rd year-- constant debugging and problem-solving. Where compiling often feels like gambling, StackOverflow adds more confusion than clarity, and VS Code never gets a break. I build things that (usually) work and have a soft spot for clean, smooth user interfaces.
            <br /><br />
            "Still figuring it out— one ';'   at a time."
          </p>
          <a href="/resume.pdf" download className="resume-btn">Download Resume</a>

        </div>
      </div>
    </section>
  );
}

export default Home;