import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';
import TargetCursor from './reactbits/TargetCursor/TargetCursor';
import ClickSpark from './reactbits/ClickSpark/ClickSpark';
import Noise from './reactbits/Noise/Noise';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import ProjectsSection from './sections/ProjectsSection';
import Impact from './sections/Impact';
import Research from './sections/Research';
import SkillsSection from './sections/SkillsSection';
import Resume from './sections/Resume';
import ContactSection from './sections/ContactSection';
import Ending from './sections/Ending';
import Footer from './sections/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
  // ScrollTrigger positions are computed on mount, but the display font (Anton)
  // and the WebGL hero change layout heights after load. Refresh once things
  // settle so scroll-reveal triggers (esp. the Projects grid right under the
  // hero) fire at the correct positions instead of staying invisible.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refresh);
    }
    const timers = [setTimeout(refresh, 600), setTimeout(refresh, 1500)];
    window.addEventListener('load', refresh);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <div className="app">
      <TargetCursor targetSelector=".cursor-target" spinDuration={3} cursorColor="#ff3b2e" hideDefaultCursor />
      <Noise patternAlpha={12} patternRefreshInterval={3} />
      <ClickSpark sparkColor="#ff3b2e" sparkCount={10} sparkRadius={18} duration={450}>
        <div className="spark-root">
          <Navbar />
          <main>
            <Hero />
            <ProjectsSection />
            <Impact />
            <Research />
            <SkillsSection />
            <Resume />
            <ContactSection />
            <Ending />
          </main>
          <Footer />
        </div>
      </ClickSpark>
    </div>
  );
}

export default App;
