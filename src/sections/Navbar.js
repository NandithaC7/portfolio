import React from 'react';
import './Navbar.css';
import GooeyNav from '../reactbits/GooeyNav/GooeyNav';
import Magnet from '../reactbits/Magnet/Magnet';
import StarBorder from '../reactbits/StarBorder/StarBorder';

const items = [
  { label: 'Home', href: '#home' },
  { label: 'Work', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Resume', href: '#resume' },
  { label: 'Contact', href: '#contact' },
];

const Navbar = () => {
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

      <Magnet padding={60} magnetStrength={4} wrapperClassName="nav-cta-magnet">
        <StarBorder as="a" href="#contact" color="#ff3b2e" speed="5s" className="nav-cta cursor-target">
          Let's Talk
        </StarBorder>
      </Magnet>
    </header>
  );
};

export default Navbar;
