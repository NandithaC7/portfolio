import React from 'react';
import './Impact.css';
import TextType from '../reactbits/TextType/TextType';
import GlitchText from '../reactbits/GlitchText/GlitchText';

const Impact = () => {
  return (
    <section className="sec impact">
      <div className="impact-inner">
        <p className="impact-cmd">
          <span className="prompt">$</span>{' '}
          <TextType as="span" text={['sudo make impact']} loop={false} typingSpeed={90} initialDelay={200} startOnVisible className="impact-type" />
        </p>
        <div className="impact-glitch">
          <GlitchText speed={0.6} enableOnHover={false} enableShadows className="impact-word">MAKE</GlitchText>
          <GlitchText speed={0.8} enableOnHover={false} enableShadows className="impact-word accent-word">IMPACT</GlitchText>
        </div>
        <p className="impact-sub">{'// compiling research · experience · impact ↓'}</p>
      </div>
    </section>
  );
};

export default Impact;
