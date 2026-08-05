import React from 'react';
import './Hero.css';
import FaultyTerminal from '../reactbits/FaultyTerminal/FaultyTerminal';
import TextType from '../reactbits/TextType/TextType';
import DecryptedText from '../reactbits/DecryptedText/DecryptedText';
import AnimatedContent from '../reactbits/AnimatedContent/AnimatedContent';

const commits = [
  { hash: 'a1c0ffe', year: '2023', type: 'feat', msg: 'enrolled in Computer Science Engineering @ Amrita Vishwa Vidyapeetham' },
  { hash: '9b4d2e1', year: '2024', type: 'feat', msg: 'went full-stack — React + Node/Express, MongoDB & Postgres' },
  { hash: '7f3a8c2', year: '2025', type: 'feat', msg: 'explored ML / DL — TensorFlow, scikit-learn, Pandas' },
  { hash: 'c0de123', year: '2025', type: 'perf', msg: 'reached for C++ when raw speed was non-negotiable' },
  { hash: 'e6d9f00', year: '2025', type: 'research', msg: 'researching edge computing + model caching to cut latency' },
  { hash: 'HEAD', year: '2026', type: 'chore', msg: 'Software Development Intern — Summer 2026' },
];

const Hero = () => {
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
        <p className="kicker"><span className="prompt">➜</span> ~/portfolio <span className="tok">git:(main)</span></p>

        <div className="term hero-term">
          <div className="term-bar">
            <span className="term-dot r" /><span className="term-dot y" /><span className="term-dot g" />
            <span className="term-title">zsh — nanditha@dev</span>
          </div>
          <div className="term-body">
            <div className="term-line">
              <span className="prompt">$</span>{' '}
              <TextType
                as="span"
                text={['portfolio init', 'make impact', 'git status']}
                typingSpeed={70}
                pauseDuration={1600}
                deletingSpeed={35}
                className="term-type"
              />
            </div>
            <div className="term-out">→ initializing workspace<span className="cmt"> … ok</span></div>
            <div className="term-out">→ modules: <span className="tok">fullstack ml dl big-data ui/ux</span> <span className="cmt">✓</span></div>
          </div>
        </div>

        <h1 className="hero-log">
          <span className="hero-log-cmd">$ git log --author=</span>
          <span className="hero-log-name">
            <DecryptedText text='"Nanditha"' animateOn="view" sequential speed={45} revealDirection="start" parentClassName="hero-decrypt" />
          </span>
        </h1>

        <div className="hero-timeline">
          <div className="hero-beam" aria-hidden="true" />
          {commits.map((c, i) => (
            <AnimatedContent key={c.hash} distance={60} direction="vertical" delay={i * 0.05} duration={0.7}>
              <article className="commit cursor-target">
                <span className="commit-node" aria-hidden="true" />
                <div className="commit-head">
                  <span className="commit-hash">commit {c.hash}</span>
                  <span className={`commit-type t-${c.type}`}>{c.type}</span>
                  <span className="commit-year">{c.year}</span>
                </div>
                <p className="commit-author">Author: Nanditha C &lt;dev@nanditha&gt;</p>
                <p className="commit-msg">{c.msg}</p>
              </article>
            </AnimatedContent>
          ))}
        </div>

        <p className="hero-scroll">scroll ↓ to keep reading the history</p>
      </div>
    </section>
  );
};

export default Hero;
