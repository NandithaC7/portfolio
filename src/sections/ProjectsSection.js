import React from 'react';
import './ProjectsSection.css';
import AnimatedContent from '../reactbits/AnimatedContent/AnimatedContent';
import { FaGithub } from 'react-icons/fa';

const projects = [
  {
    name: 'iWFM',
    fullName: 'Enterprise Workforce Management Platform',
    status: 'testing',
    statusText: 'Testing',
    desc: 'Enterprise workforce management platform with workflow automation, RBAC, scheduling, field operations, analytics and document management.',
    stack: ['Spring Boot', 'React', 'PostgreSQL', 'Keycloak'],
    repo: 'https://github.com/NandithaC7/iWFM',
  },
  {
    name: 'Agentic AI for Autonomous Cloud Platforms',
    fullName: 'Multi-Agent Cloud Management System',
    status: 'completed',
    statusText: 'Completed',
    desc: 'Multi-agent cloud management platform using MCP, FastAPI, React and Azure with autonomous cost optimization, deployment and security agents.',
    stack: ['FastAPI', 'React', 'Azure', 'MCP'],
    repo: 'https://github.com/NandithaC7/agentic-ai-for-autonomous-cloud-platforms',
  },
  {
    name: 'SplitStock',
    fullName: 'Shared Household Inventory Platform',
    status: 'wip',
    statusText: 'In Development',
    desc: 'Shared household inventory platform with expense tracking, ML-based depletion prediction and automated restock alerts.',
    stack: ['React', 'Node', 'MongoDB', 'Python'],
    repo: 'https://github.com/NandithaC7/SplitStock',
  },
  {
    name: 'Swiftly',
    fullName: 'Real-Time Car-Pooling Platform',
    status: 'deploy',
    statusText: 'Deployed',
    desc: 'Real-time car-pooling platform with ride lifecycle management and live updates. Contributed primarily to backend development and deployment.',
    stack: ['Node', 'Express', 'PostgreSQL', 'WebSockets'],
    repo: 'https://github.com/Car-Pooling-System',
  },
  {
    name: 'Foresight',
    fullName: 'Intelligent Prediction & Analysis',
    status: 'wip',
    statusText: 'Training Models',
    desc: 'Academic ML project for intelligent prediction and analysis.',
    stack: ['Python', 'scikit-learn', 'Pandas', 'TensorFlow'],
    repo: 'https://github.com/NandithaC7/Foresight-ML',
  },
  {
    name: 'Urban Crime Pattern Analysis',
    fullName: 'Hotspot Prediction System',
    status: 'proto',
    statusText: 'Initial Stage',
    desc: 'Big Data analytics project using predictive analysis for crime hotspots.',
    stack: ['Python', 'PySpark', 'Pandas', 'Hadoop'],
    repo: 'https://github.com/NandithaC7/Urban-Crime-Pattern-Analysis-Hotspot-Prediction',
  },
  {
    name: 'Motion Consistency Evaluation',
    fullName: 'Unmodified Surveillance Video',
    status: 'wip',
    statusText: 'Implementation',
    desc: 'Final Year Project — AI-based motion consistency evaluation for surveillance videos.',
    stack: ['Python', 'PyTorch', 'OpenCV', 'TensorFlow'],
    repo: 'https://github.com/NandithaC7/Motion-Consistency-Evaluation-in-Unmodified-Surveillance-Video',
  },
];

const statusMap = {
  testing: { cls: 'wip', label: 'Testing' },
  completed: { cls: 'done', label: 'Completed' },
  wip: { cls: 'wip', label: 'In Development' },
  deploy: { cls: 'deploy', label: 'Deployed' },
  proto: { cls: 'proto', label: 'Initial Stage' },
};

const ProjectsSection = () => {
  return (
    <section id="projects" className="sec projects">
      <div className="sec-inner">
        <p className="kicker">
          <span className="tok">$</span> git status <span className="cmt"># what I build</span>
        </p>
        <h2 className="display proj-heading">
          THINGS I<br /><span className="stroke">BUILD</span>
        </h2>

        <div className="proj-repo-list">
          {projects.map((p, i) => {
            const s = statusMap[p.status] || { cls: p.status, label: p.statusText };
            return (
              <AnimatedContent key={p.name} distance={40} direction="vertical" delay={i * 0.06} duration={0.65}>
                <div className="proj-row cursor-target">
                  {/* Orange thick top line */}
                  <div className="proj-row-bar" />

                  <div className="proj-row-body">
                    {/* Left: Name + description + stack */}
                    <div className="proj-row-left">
                      <div className="proj-row-title-row">
                        <h3 className="proj-row-name">{p.name}</h3>
                        <span className={`gstatus proj-row-status ${s.cls}`}>
                          <span className="dot" />
                          {p.statusText}
                        </span>
                      </div>
                      <p className="proj-row-fullname">{p.fullName}</p>
                      <p className="proj-row-desc">{p.desc}</p>
                      <div className="proj-row-stack">
                        {p.stack.map((tech, ti) => (
                          <React.Fragment key={tech}>
                            <span className="proj-tech">{tech}</span>
                            {ti < p.stack.length - 1 && <span className="proj-dot">•</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Right: GitHub button + clone hint */}
                    <div className="proj-row-right">
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="proj-github-btn"
                        aria-label={`GitHub: ${p.name}`}
                      >
                        <FaGithub /> GitHub →
                      </a>
                      <span className="proj-clone-hint">
                        git clone {p.repo.replace('https://github.com/', '')}
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedContent>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
