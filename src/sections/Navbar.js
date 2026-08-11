import React from 'react';
import './Navbar.css';
import GooeyNav from '../reactbits/GooeyNav/GooeyNav';
import Magnet from '../reactbits/Magnet/Magnet';
import StarBorder from '../reactbits/StarBorder/StarBorder';

const items = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#research' },
  { label: 'Resume', href: '#resume' },
  { label: 'Contact', href: '#contact' },
];

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Navbar = ({ theme, toggleTheme }) => {
  return (
    <header className="nav">
      <a href="#home" className="nav-logo cursor-target" aria-label="Home">
        <span className="nav-logo-mark">~/</span>
        <span className="nav-logo-text">nanditha</span>
        <span className="nav-caret">_</span>
      </a>

      <div className="nav-links">
        <GooeyNav items={items} particleCount={12} animationTime={520} colors={[1, 2, 3, 1, 2, 3, 1, 4]} />
      </div>

      <div className="nav-right">
        <button
          className="theme-toggle cursor-target"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <Magnet padding={60} magnetStrength={4} wrapperClassName="nav-cta-magnet">
          <StarBorder as="a" href="#contact" color="#ff3b2e" speed="5s" className="nav-cta cursor-target">
            Let's Talk
          </StarBorder>
        </Magnet>
      </div>
    </header>
  );
};

export default Navbar;
