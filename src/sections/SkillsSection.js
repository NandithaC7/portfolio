import React, { useEffect, useRef } from 'react';
import './SkillsSection.css';

const branchData = [
  {
    name: 'frontend',
    color: '#61dafb',
    skills: ['react', 'html5', 'css3', 'javascript'],
  },
  {
    name: 'backend',
    color: '#68d391',
    skills: ['node', 'express', 'spring-boot', 'django'],
  },
  {
    name: 'machine-learning',
    color: '#ff3b2e',
    skills: ['tensorflow', 'scikit-learn', 'pytorch', 'pandas'],
  },
  {
    name: 'deep-learning',
    color: '#d7ff3f',
    skills: ['pytorch', 'tensorflow', 'keras'],
  },
  {
    name: 'big-data',
    color: '#f6a623',
    skills: ['pandas', 'spark', 'hadoop'],
  },
];

const standaloneSkills = ['python', 'postgresql', 'mongodb', 'docker', 'git'];

const SkillsSection = () => {
  const sectionRef = useRef(null);
  const branchRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('branch-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    branchRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className="sec skills">
      <div className="sec-inner">
        {/* Terminal heading */}
        <p className="kicker">
          <span className="tok">$</span> git branch <span className="cmt"># skill tree</span>
        </p>

        <div className="git-branch-viz" ref={sectionRef}>
          {/* Main trunk line */}
          <div className="git-trunk">
            <div className="trunk-line" />

            {branchData.map((branch, bi) => (
              <div
                key={branch.name}
                className="git-branch-row"
                ref={(el) => (branchRefs.current[bi] = el)}
                style={{ '--branch-color': branch.color, '--branch-delay': `${bi * 0.15}s` }}
              >
                {/* Branch line from trunk */}
                <div className="branch-connector">
                  <div className="branch-node-main" />
                  <div className="branch-line-horiz" />
                  <div className="branch-label-wrap">
                    <span className="branch-asterisk">*</span>
                    <span className="branch-name-text">{branch.name}</span>
                  </div>
                </div>

                {/* Skills as commit nodes on the branch */}
                <div className="branch-commits">
                  {branch.skills.map((skill, si) => (
                    <div
                      key={skill}
                      className="commit-node-wrap"
                      style={{ '--commit-delay': `${bi * 0.15 + si * 0.08}s` }}
                    >
                      <div className="commit-node-dot" />
                      <span className="commit-skill-label">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Standalone tools row */}
          <div
            className="git-branch-row git-tools-row"
            ref={(el) => (branchRefs.current[branchData.length] = el)}
            style={{ '--branch-color': '#8f8f88', '--branch-delay': `${branchData.length * 0.15}s` }}
          >
            <div className="branch-connector">
              <div className="branch-node-main" />
              <div className="branch-line-horiz" />
              <div className="branch-label-wrap">
                <span className="branch-asterisk">*</span>
                <span className="branch-name-text">tools</span>
              </div>
            </div>
            <div className="branch-commits">
              {standaloneSkills.map((skill, si) => (
                <div
                  key={skill}
                  className="commit-node-wrap"
                  style={{ '--commit-delay': `${branchData.length * 0.15 + si * 0.08}s` }}
                >
                  <div className="commit-node-dot" />
                  <span className="commit-skill-label">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
