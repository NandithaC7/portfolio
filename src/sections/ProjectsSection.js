import React from 'react';
import './ProjectsSection.css';
import SplitText from '../reactbits/SplitText/SplitText';
import SpotlightCard from '../reactbits/SpotlightCard/SpotlightCard';
import AnimatedContent from '../reactbits/AnimatedContent/AnimatedContent';
import { FaGithub, FaArrowRight, FaBookOpen } from 'react-icons/fa';

import redImg from '../assets/red.jpg';
import greenImg from '../assets/green.png';
import blueImg from '../assets/blue.png';
import orangeImg from '../assets/orange.png';
import grayImg from '../assets/gray.png';

const projects = [
  { img: redImg, title: 'EdgeAIGC', status: 'wip', statusText: '🚧 In Progress', desc: 'Smart traffic monitoring with model caching & resource allocation.', tags: ['Python', 'Edge', 'ML'] },
  { img: greenImg, title: 'STM32F401', status: 'done', statusText: '✔ Completed', desc: 'Real-world case scenario using the STM32F401 board.', tags: ['C', 'Embedded'] },
  { img: blueImg, title: 'ZYNK', status: 'deploy', statusText: '🚀 Ready for Deployment', desc: 'Journal-style social media website to digitize your life.', tags: ['React', 'Node', 'MongoDB'] },
  { img: orangeImg, title: 'Research Paper', status: 'done', statusText: '✔ Completed', desc: 'Paper on edge computing, model caching, and more.', tags: ['Edge Computing', 'Research'] },
  { img: orangeImg, title: 'Ticket Booking', status: 'done', statusText: '✔ Completed', desc: 'Responsive movie ticket booking system with frontend/backend.', tags: ['React', 'Node'] },
  { img: grayImg, title: 'Coming Soon', status: 'proto', statusText: '🟠 Prototype', desc: 'Project in progress. Stay tuned!', tags: ['WIP'] },
];

const ProjectsSection = () => {
  return (
    <section id="projects" className="sec projects">
      <div className="sec-inner">
        <p className="kicker"><span className="tok">$</span> git status <span className="cmt"># what I build</span></p>

        <div className="things-title">
          <SplitText text="THINGS" tag="span" className="display line" splitType="chars" delay={30} duration={0.9} from={{ opacity: 0, y: 60 }} to={{ opacity: 1, y: 0 }} />
          <SplitText text="I" tag="span" className="display line accent" splitType="chars" delay={30} duration={0.9} from={{ opacity: 0, y: 60 }} to={{ opacity: 1, y: 0 }} />
          <SplitText text="BUILD" tag="span" className="display line stroke" splitType="chars" delay={30} duration={0.9} from={{ opacity: 0, y: 60 }} to={{ opacity: 1, y: 0 }} />
        </div>

        <div className="proj-grid">
          {projects.map((p, i) => (
            <AnimatedContent key={`${p.title}-${i}`} distance={70} delay={(i % 3) * 0.06} duration={0.7}>
              <SpotlightCard className="proj-card cursor-target" spotlightColor="rgba(255, 59, 46, 0.25)">
                <div className="proj-media">
                  <img src={p.img} alt={p.title} className="proj-img" />
                  <span className={`gstatus ${p.status} proj-status`}><span className="dot" />{p.statusText}</span>
                </div>
                <div className="proj-body">
                  <h3 className="proj-title">{p.title}</h3>
                  <p className="proj-desc">{p.desc}</p>
                  <div className="proj-tags">
                    {p.tags.map((t) => <span className="proj-tag" key={t}>{t}</span>)}
                  </div>
                  <div className="proj-actions">
                    <a href="#projects" className="proj-link cursor-target"><FaGithub /> GitHub</a>
                    <a href="#projects" className="proj-link cursor-target"><FaBookOpen /> Case Study</a>
                    <a href="#projects" className="proj-link cursor-target">Demo <FaArrowRight /></a>
                  </div>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
