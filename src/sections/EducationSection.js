import React from 'react';
import './EducationSection.css';
import AnimatedContent from '../reactbits/AnimatedContent/AnimatedContent';
import amritLogo from '../assets/amrit.svg';
import cirsLogo from '../assets/cirss.jpg';

const education = [
  {
    logo: amritLogo,
    logoAlt: 'Amrita Vishwa Vidyapeetham',
    institution: 'Amrita Vishwa Vidyapeetham',
    degree: 'B.Tech Computer Science Engineering',
    period: '2023 — Present',
    detail: 'CGPA 6.63',
    detailLabel: 'CGPA',
    isImg: false,
  },
  {
    logo: cirsLogo,
    logoAlt: 'CIRS',
    institution: 'CIRS',
    degree: 'Higher Secondary',
    period: 'Completed',
    detail: '89.8%',
    detailLabel: 'Score',
    isImg: true,
  },
];

const EducationSection = () => {
  return (
    <section id="education" className="sec education">
      <div className="sec-inner">
        <p className="kicker">
          <span className="tok">$</span> cat education.log
        </p>
        <h2 className="display edu-title">
          EDU<span className="accent">CATION</span>
        </h2>

        <div className="edu-cards">
          {education.map((e, i) => (
            <AnimatedContent key={e.institution} distance={40} direction="vertical" delay={i * 0.12} duration={0.7}>
              <div className="edu-card">
                <div className="edu-card-logo">
                  <img src={e.logo} alt={e.logoAlt} className={e.isImg ? 'edu-logo-img' : 'edu-logo-svg'} />
                </div>
                <div className="edu-card-body">
                  <p className="edu-period">{e.period}</p>
                  <h3 className="edu-institution">{e.institution}</h3>
                  <p className="edu-degree">{e.degree}</p>
                </div>
                <div className="edu-card-score">
                  <span className="edu-score-label">{e.detailLabel}</span>
                  <span className="edu-score-value">{e.detail}</span>
                </div>
              </div>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
