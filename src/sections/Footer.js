import React from 'react';
import './Footer.css';
import ShinyText from '../reactbits/ShinyText/ShinyText';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-commit">
        <span className="footer-prompt">$</span>
        <ShinyText text={'git commit -m "building digital experiences"'} speed={4} color="#8f8f88" shineColor="#ff3b2e" className="footer-shiny" />
      </div>
      <div className="footer-meta">
        <span>© 2026 Nanditha C.</span>
        <span className="footer-tags">Designed. Developed. Iterated.</span>
      </div>
    </footer>
  );
};

export default Footer;
