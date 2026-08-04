import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import './Contact.css';

const Contact = () => (
  <section className="section contact" id="contact">
    <div className="contact-grid">
      <div className="contact-info">
        <span className="section-eyebrow">Get In Touch</span>
        <h2 className="section-title">Contact <span className="accent">Me</span></h2>

        <div className="contact-socials">
          <a className="contact-social" href="mailto:your@email.com">
            <FaEnvelope />
            <span>Email</span>
          </a>
          <a className="contact-social" href="https://github.com/your-github" target="_blank" rel="noreferrer">
            <FaGithub />
            <span>GitHub</span>
          </a>
          <a className="contact-social" href="https://linkedin.com/in/your-linkedin" target="_blank" rel="noreferrer">
            <FaLinkedin />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>

      <form className="contact-form">
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows="5" required></textarea>
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
    </div>
  </section>
);

export default Contact;
