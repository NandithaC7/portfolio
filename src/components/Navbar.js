import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { FaRegPaperPlane, FaSun, FaMoon } from 'react-icons/fa';

const Navbar = ({ theme, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <a href="#home" className="logo" aria-label="Home">
        <span className="logo-mark">NC</span>
      </a>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About Me</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact Me</a></li>
      </ul>
      <div className="nav-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
        <a href="#contact" className="nav-cta">
          <FaRegPaperPlane /> Let's Talk
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
