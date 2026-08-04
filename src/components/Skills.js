import React from 'react';
import './Skills.css';
import {
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaPython,
  FaReact,
  FaNodeJs,
  FaGitAlt,
  FaCuttlefish,
  FaCode
} from 'react-icons/fa';
import { SiCplusplus, SiMongodb } from 'react-icons/si';

const skills = [
  { icon: <FaHtml5 />, name: 'HTML5' },
  { icon: <FaCss3Alt />, name: 'CSS3' },
  { icon: <FaJs />, name: 'JavaScript' },
  { icon: <FaPython />, name: 'Python' },
  { icon: <FaReact />, name: 'React.js' },
  { icon: <FaNodeJs />, name: 'Node.js' },
  { icon: <SiMongodb />, name: 'MongoDB' },
  { icon: <FaCode />, name: 'MATLAB' },
  { icon: <FaGitAlt />, name: 'Git' },
  { icon: <FaCuttlefish />, name: 'C' },
  { icon: <SiCplusplus />, name: 'C++' },
];

const Skills = () => {
  return (
    <section className="section skills-section" id="skills">
      <span className="section-eyebrow">What I Use</span>
      <h2 className="section-title">My <span className="accent">Skills</span></h2>

      <div className="skills-grid">
        {skills.map((skill) => (
          <div className="skill-card" key={skill.name}>
            <span className="skill-icon">{skill.icon}</span>
            <span className="skill-name">{skill.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
