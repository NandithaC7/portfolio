import React, { useState } from 'react';
import './Research.css';
import AnimatedContent from '../reactbits/AnimatedContent/AnimatedContent';
import { FaFilePdf, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const commits = [
  {
    hash: 'a81cf32',
    tag: 'INTERNSHIP',
    tagColor: '#61dafb',
    org: 'Centillion Networks',
    role: 'Software Engineering Intern (Full-Stack & ML)',
    year: '2026',
    shortDesc: 'Worked alongside engineering teams to understand enterprise-scale software development...',
    desc: 'Worked alongside engineering teams to understand enterprise-scale software development by exploring existing products including HRMS and the flagship GeoVex platform. Gained exposure to backend APIs, authentication, database design, workflow automation, and production software architecture. Contributed to the Pole Asset Detection project through dataset annotation and YOLOv8 model fine-tuning, while independently building the iWFM web application to reinforce full-stack development concepts.',
    stack: ['Spring Boot', 'React', 'PostgreSQL', 'Java', 'TypeScript', 'JWT', 'REST API', 'YOLOv8', 'Python', 'Git'],
    certificates: [
      { label: 'View Offer Letter', link: '/certificates/centillion_offer.pdf' },
      { label: 'View Certificate', link: '/certificates/centillion_certificate.pdf' }
    ]
  },
  {
    hash: '9f2db4e',
    tag: 'INTERNSHIP',
    tagColor: '#61dafb',
    org: 'F2 O&M',
    role: 'IT & Networks Internship',
    year: '2025',
    shortDesc: 'Completed an internship within the Information Technology department...',
    desc: 'Completed an internship within the Information Technology department of an industrial power generation company, gaining practical exposure to enterprise networking, server administration, IT infrastructure, and cybersecurity fundamentals. Observed real-world IT operations, troubleshooting procedures, system maintenance in large-scale industrial environments.',
    stack: ['Windows Server', 'Networking', 'Linux', 'Active Directory', 'Cyber Security', 'Hardware', 'TCP/IP'],
    certificates: [
      { label: 'View Certificate', link: '/certificates/f2om_certificate.pdf' }
    ]
  },
  {
    hash: '3ab7f91',
    tag: 'RESEARCH PAPER',
    tagColor: '#ff3b2e',
    org: 'Motion Consistency Evaluation',
    role: 'in Unmodified Surveillance Video',
    year: '2026 (IN PROGRESS)',
    shortDesc: 'Currently developing my final-year research project focused on evaluating motion consistency...',
    desc: 'Currently developing my final-year research project focused on evaluating motion consistency in surveillance footage without modifying the original video stream. The work investigates deep learning techniques for detecting motion irregularities, improving scene understanding, and supporting intelligent video analytics for secure camera networks. Current efforts include literature review, dataset preparation, model development, and evaluation using recent state-of-the-art approaches.',
    stack: ['Python', 'PyTorch', 'OpenCV', 'YOLO', 'Computer Vision', 'Deep Learning'],
    certificates: []
  },
  {
    hash: 'e98fd22',
    tag: 'HACKATHON',
    tagColor: '#d7ff3f',
    org: 'NitroStack Agentic AI Hackathon',
    role: '',
    year: '2026',
    shortDesc: 'Participated in building an AI-powered autonomous cloud platform using MCP architecture...',
    desc: 'Participated in building an AI-powered autonomous cloud platform using MCP architecture and multi-agent systems.',
    stack: ['FastAPI', 'React', 'MCP', 'Azure', 'Python', 'Docker', 'LLMs'],
    certificates: [
      { label: 'View Certificate', link: '/certificates/nitrostack_certificate.pdf' }
    ]
  },
];

const Research = () => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (hash) => {
    setExpandedId(expandedId === hash ? null : hash);
  };

  return (
    <section id="research" className="sec research">
      <div className="sec-inner">
        {/* Section heading */}
        <div className="research-head">
          <p className="kicker">
            <span className="tok">$</span> git log --author=&quot;Nanditha&quot;
          </p>
          <h2 className="display research-title">
            EXPERIENCE<br />
            <span className="stroke">&amp;</span><br />
            <span className="accent">RESEARCH</span>
          </h2>
        </div>

        {/* Git-log timeline */}
        <div className="research-timeline">
          <div className="research-beam" aria-hidden="true" />

          {commits.map((c, i) => {
            const isExpanded = expandedId === c.hash;
            return (
              <AnimatedContent key={c.hash} distance={60} direction="vertical" delay={i * 0.08} duration={0.7}>
                <article 
                  className={`rcommit cursor-target ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(c.hash)}
                >
                  <span className="rcommit-node" aria-hidden="true" />
                  <div className="rcommit-inner">
                    {/* Header row: hash | tag | year */}
                    <div className="rcommit-head">
                      <span className="rcommit-hash">commit {c.hash}</span>
                      <span
                        className="rcommit-tag"
                        style={{ color: c.tagColor, borderColor: c.tagColor }}
                      >
                        [{c.tag}]
                      </span>
                      <span className="rcommit-year">{c.year}</span>
                    </div>

                    {/* Org & Role */}
                    <h3 className="rcommit-org">{c.org}</h3>
                    {c.role && <p className="rcommit-role">{c.role}</p>}

                    {/* Description - changes based on state */}
                    <div className="rcommit-desc-container">
                      <p className="rcommit-desc">
                        {isExpanded ? c.desc : c.shortDesc}
                      </p>
                    </div>

                    {/* Expandable details */}
                    {isExpanded && (
                      <div className="rcommit-details">
                        {/* Tech Stack */}
                        {c.stack && c.stack.length > 0 && (
                          <div className="rcommit-stack">
                            <h4 className="stack-heading">Tech Stack</h4>
                            <div className="stack-tags">
                              {c.stack.map(tech => (
                                <span key={tech} className="stack-tag">{tech}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certificates */}
                        {c.certificates && c.certificates.length > 0 && (
                          <div className="rcommit-certs">
                            {c.certificates.map(cert => (
                              <a 
                                key={cert.label}
                                href={cert.link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="cert-btn cursor-target"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaFilePdf className="cert-icon" /> {cert.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expand/Collapse Hint */}
                    <div className="rcommit-expand-hint">
                      {isExpanded ? (
                        <><FaChevronUp /> Collapse</>
                      ) : (
                        <><FaChevronDown /> Read More</>
                      )}
                    </div>
                  </div>
                </article>
              </AnimatedContent>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Research;
