import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { FaRegPaperPlane } from 'react-icons/fa';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <a href="#home" className="logo">
        <span className="logo-mark">NC</span>
        <span className="logo-text">Nanditha C</span>
      </a>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About Me</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact Me</a></li>
      </ul>
      <a href="#contact" className="nav-cta">
        <FaRegPaperPlane /> Let's Talk
      </a>
    </nav>
  );
};

export default Navbar;
