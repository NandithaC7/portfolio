import React from 'react';
import './Hero.css';
import FaultyTerminal from '../reactbits/FaultyTerminal/FaultyTerminal';
import TextType from '../reactbits/TextType/TextType';
import AnimatedContent from '../reactbits/AnimatedContent/AnimatedContent';
import myPic from '../assets/mypic.png';

const Hero = () => {
  const [wobble, setWobble] = React.useState(false);
  return (
    <section id="home" className="hero">
      <div className="hero-bg" aria-hidden="true">
        <FaultyTerminal
          scale={1.6}
          gridMul={[2, 1]}
          digitSize={1.3}
          scanlineIntensity={0.4}
          glitchAmount={1}
          flickerAmount={0.8}
          tint="#ff3b2e"
          mouseReact
          mouseStrength={0.3}
          pageLoadAnimation
          brightness={0.5}
        />
      </div>

      <div className="hero-inner">
        <div className="hero-columns">
          <div className="hero-left">
            {/* Terminal path kicker */}
            <p className="kicker hero-kicker">
              <span className="prompt">➜</span> ~/nanditha<span className="tok">_</span>
            </p>

            {/* Terminal window */}
            <div className="term hero-term">
              <div className="term-bar">
                <span className="term-dot r" /><span className="term-dot y" /><span className="term-dot g" />
                <span className="term-title">zsh — nanditha@dev</span>
              </div>
              <div className="term-body">
                <div className="term-line">
                  <span className="prompt hero-prompt">$</span>{' '}
                  <TextType
                    as="span"
                    text={['portfolio init']}
                    typingSpeed={70}
                    pauseDuration={99999}
                    deletingSpeed={35}
                    loop={false}
                    className="term-type"
                  />
                </div>

                <div className="term-output-block">
                  <div className="term-out">
                    <span className="term-out-arrow">&gt;</span>{' '}
                    initializing workspace... <span className="term-ok">✓</span>
                  </div>
                  <div className="term-out term-out-blank">&nbsp;</div>
                  <div className="term-out">
                    <span className="term-out-arrow">&gt;</span>{' '}
                    status:
                  </div>
                  <div className="term-out term-status">
                    &nbsp;&nbsp;<span className="status-dot" />Currently building.
                  </div>
                </div>
              </div>
            </div>

            {/* About me — outside terminal */}
            <AnimatedContent distance={40} direction="vertical" delay={0.3} duration={0.8}>
              <h2 className="hero-git-log">
                <span className="prompt">$</span> git log --author="Nanditha"
              </h2>
              <p className="hero-about">
                My Git history suggests I know what I'm doing. My browser history says otherwise. I'm a Computer Science student who spends more time building than talking about building—from enterprise-style web applications and backend systems to machine learning projects and cloud infrastructure. I enjoy understanding how software actually works under the hood, and if something doesn't exist yet, I'll probably try building it before looking for an alternative.
              </p>
            </AnimatedContent>
          </div>
          
          <div className="hero-right">
            <img 
              src={myPic} 
              alt="Nanditha" 
              className={`hero-pic ${wobble ? 'wobble-anim' : ''}`} 
              onClick={() => {
                setWobble(false);
                setTimeout(() => setWobble(true), 10);
              }} 
              onAnimationEnd={() => setWobble(false)}
            />
          </div>
        </div>

        <p className="hero-scroll">scroll ↓ to keep reading the history</p>
      </div>
    </section>
  );
};

export default Hero;
