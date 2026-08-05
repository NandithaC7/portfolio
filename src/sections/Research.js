import React from 'react';
import './Research.css';
import ScrollReveal from '../reactbits/ScrollReveal/ScrollReveal';
import AnimatedContent from '../reactbits/AnimatedContent/AnimatedContent';

const entries = [
  { tag: 'research', when: '2025 — present', title: 'Edge Computing & Model Caching', place: 'Research Paper', body: 'Investigating model caching and resource allocation on the edge to slash real-time latency for AI-driven workloads.' },
  { tag: 'internship', when: 'Summer 2026', title: 'Software Development Intern', place: 'Industry', body: 'Building and shipping production features across the stack as a Software Development Intern.' },
  { tag: 'education', when: '2023 — present', title: 'B.Tech, Computer Science Engineering — III year', place: 'Amrita Vishwa Vidyapeetham, Coimbatore', body: 'Core CS, systems, and applied ML — with a soft spot for clean, smooth user interfaces.' },
  { tag: 'education', when: 'completed', title: 'High School — CBSE', place: 'Chinmaya International Residential School', body: '12th Grade CBSE Boards: 89.8%.' },
  { tag: 'certification', when: 'certified', title: 'Full-Stack Development · Machine Learning', place: 'Udemy · Coursera', body: 'Udemy course on Full-Stack Development and Coursera course on Machine Learning.' },
];

const Research = () => {
  return (
    <section id="research" className="sec research">
      <div className="sec-inner research-grid">
        <div className="research-head">
          <p className="kicker"><span className="tok">$</span> git show --experience</p>
          <h2 className="display research-title">RESEARCH<br /><span className="stroke">&amp;</span><br /><span className="accent">WORK</span></h2>
        </div>

        <div className="research-body">
          <div className="research-reveal">
            <ScrollReveal baseOpacity={0.08} baseRotation={2} blurStrength={5} enableBlur containerClassName="rr" textClassName="rr-text">
              Beyond the coursework, the work that actually shipped — research, internships, and the certifications along the way.
            </ScrollReveal>
          </div>

          <div className="research-list">
            {entries.map((e, i) => (
              <AnimatedContent key={e.title} distance={50} delay={i * 0.05} duration={0.7}>
                <article className="rentry cursor-target">
                  <div className="rentry-meta">
                    <span className={`rtag r-${e.tag}`}>{e.tag}</span>
                    <span className="rentry-when">{e.when}</span>
                  </div>
                  <h3 className="rentry-title">{e.title}</h3>
                  <p className="rentry-place">{e.place}</p>
                  <p className="rentry-body">{e.body}</p>
                </article>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Research;
