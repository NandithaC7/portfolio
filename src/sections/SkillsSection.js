import React from 'react';
import './SkillsSection.css';
import SpotlightCard from '../reactbits/SpotlightCard/SpotlightCard';
import AnimatedContent from '../reactbits/AnimatedContent/AnimatedContent';
import { FaReact, FaNodeJs, FaJs, FaHtml5, FaCss3Alt, FaPython, FaGitAlt, FaCuttlefish, FaCode } from 'react-icons/fa';
import { SiCplusplus, SiMongodb } from 'react-icons/si';

const branches = [
  {
    name: 'main', current: true, category: 'Software Engineering',
    icons: [{ i: <FaCuttlefish />, l: 'C' }, { i: <SiCplusplus />, l: 'C++' }, { i: <FaGitAlt />, l: 'Git' }],
    chips: ['DSA', 'Systems'],
  },
  {
    name: 'feat/full-stack', category: 'Full-Stack Development',
    icons: [{ i: <FaReact />, l: 'React' }, { i: <FaNodeJs />, l: 'Node' }, { i: <FaJs />, l: 'JS' }, { i: <FaHtml5 />, l: 'HTML5' }, { i: <FaCss3Alt />, l: 'CSS3' }, { i: <SiMongodb />, l: 'MongoDB' }],
    chips: ['Express', 'Postgres'],
  },
  {
    name: 'feat/ml-dl', category: 'Machine & Deep Learning',
    icons: [{ i: <FaPython />, l: 'Python' }],
    chips: ['TensorFlow', 'scikit-learn', 'Pandas'],
  },
  {
    name: 'feat/big-data', category: 'Big Data Analytics',
    icons: [{ i: <FaCode />, l: 'MATLAB' }],
    chips: ['Pandas', 'Analytics', 'Edge'],
  },
  {
    name: 'feat/ui-ux', category: 'UI / UX Design',
    icons: [{ i: <FaCss3Alt />, l: 'CSS3' }],
    chips: ['Figma', 'Motion', 'Editorial'],
  },
];

const SkillsSection = () => {
  return (
    <section id="skills" className="sec skills">
      <div className="sec-inner">
        <p className="kicker"><span className="tok">$</span> git branch --list <span className="cmt"># pick a skill tree</span></p>
        <h2 className="display skills-title">BRANCHES</h2>

        <div className="branch-grid">
          {branches.map((b, i) => (
            <AnimatedContent key={b.name} distance={60} delay={(i % 3) * 0.06} duration={0.7}>
              <SpotlightCard className={`branch-card cursor-target ${b.current ? 'is-current' : ''}`} spotlightColor="rgba(215, 255, 63, 0.18)">
                <div className="branch-top">
                  <span className="branch-name">{b.current ? '* ' : ''}{b.name}</span>
                  {b.current && <span className="branch-here">HEAD</span>}
                </div>
                <h3 className="branch-category">{b.category}</h3>
                <div className="branch-icons">
                  {b.icons.map((ic) => (
                    <span className="branch-icon" key={ic.l} title={ic.l}>{ic.i}</span>
                  ))}
                </div>
                <div className="branch-chips">
                  {b.chips.map((c) => <span className="branch-chip" key={c}>{c}</span>)}
                </div>
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
