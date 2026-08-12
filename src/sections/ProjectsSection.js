import React, { useState } from 'react';
import './ProjectsSection.css';
import AnimatedContent from '../reactbits/AnimatedContent/AnimatedContent';
import { FaGithub } from 'react-icons/fa';
import { motion, AnimatePresence } from 'motion/react';

const projects = [
  {
    name: 'iWFM',
    fullName: 'Enterprise Workforce Management Platform',
    status: 'testing',
    statusText: 'Testing',
    desc: 'Enterprise workforce management platform with workflow automation, RBAC, scheduling, field operations, analytics and document management.',
    stack: ['Spring Boot', 'React', 'PostgreSQL', 'Keycloak'],
    repo: 'https://github.com/NandithaC7/iWFM',
    problem: 'Workforce operations require coordinated scheduling, workflow management, authentication, field operations, and document handling. The project explores how these requirements can be combined into a structured enterprise-style application.',
    whatItDoes: 'iWFM provides a workforce management workflow with scheduling, workflow stages, user access control, and operational management. It uses a versioned state-machine approach to manage workflow transitions and asynchronous events.',
    contribution: 'This was personally built as a learning project to understand enterprise software architecture and workforce management systems. It was developed after learning from existing enterprise projects and systems rather than being presented as the main product I developed during my internship.',
    architecture: 'Spring Boot backend with React/TypeScript frontend and PostgreSQL, with Keycloak OAuth2/RBAC for authentication and authorization. Apache Camel, Kafka, SQS and RabbitMQ are used for event-driven workflow experimentation.',
    technologies: ['Spring Boot', 'Java 17', 'React', 'TypeScript', 'PostgreSQL', 'Keycloak', 'Apache Camel', 'Kafka', 'RabbitMQ', 'SQS', 'ONNX Runtime'],
    statusExpanded: 'Testing / learning-focused implementation.',
  },
  {
    name: 'Agentic AI for Autonomous Cloud Platforms',
    fullName: 'Multi-Agent Cloud Management System',
    status: 'completed',
    statusText: 'Completed',
    desc: 'Multi-agent cloud management platform using MCP, FastAPI, React and Azure with autonomous cost optimization, deployment and security agents.',
    stack: ['FastAPI', 'React', 'Azure', 'MCP'],
    repo: 'https://github.com/NandithaC7/agentic-ai-for-autonomous-cloud-platforms',
    problem: 'Cloud infrastructure requires continuous monitoring, deployment, security checks, and resource optimization. Managing these tasks manually can require repeated operational decisions across different cloud services and tools.',
    whatItDoes: 'The platform uses AI agents to interact with cloud infrastructure and assist with autonomous cloud management through natural language and tool-based orchestration.',
    contribution: 'Worked on the implementation of the autonomous cloud-management platform, including the AI-agent architecture, MCP integration, cloud tooling, and supporting application components.',
    architecture: 'The system follows an MCP-based architecture with specialized agents responsible for different cloud-management functions. An orchestration layer coordinates these agents and their tools.',
    technologies: ['React', 'FastAPI', 'Python', 'MCP', 'Azure', 'Gemini', 'Docker', 'OAuth'],
    statusExpanded: 'Completed hackathon/project implementation.',
  },
  {
    name: 'SplitStock',
    fullName: 'Shared Household Inventory Platform',
    status: 'wip',
    statusText: 'In Development',
    desc: 'Shared household inventory platform with expense tracking, ML-based depletion prediction and automated restock alerts.',
    stack: ['React', 'Node', 'MongoDB', 'Python'],
    repo: 'https://github.com/NandithaC7/SplitStock',
    problem: 'Shared households need a way to track inventory usage while also keeping expenses and individual contributions organized. Manual tracking makes it difficult to understand consumption, balances, and when shared items are likely to run out.',
    whatItDoes: 'SplitStock allows households to manage shared inventory, record usage, track expenses, calculate balances, and manage settlements. It also provides real-time updates between household members.',
    mlComponent: 'An ML-based depletion prediction engine analyzes recent usage patterns to forecast when stock may run out and generate restock recommendations.',
    architecture: 'React/Vite frontend communicates with a Django REST Framework backend and PostgreSQL database. Django Channels provides WebSocket-based real-time updates, while JWT handles authentication.',
    technologies: ['Django REST Framework', 'React', 'Vite', 'PostgreSQL', 'Django Channels', 'WebSockets', 'JWT', 'Python', 'ML'],
    statusExpanded: 'Fully functional locally.\nDeployment configuration for Render, Vercel and Supabase is prepared but production deployment is not yet live.',
  },
  {
    name: 'Swiftly',
    fullName: 'Real-Time Car-Pooling Platform',
    status: 'deploy',
    statusText: 'Deployed',
    desc: 'Real-time car-pooling platform with ride lifecycle management and live updates. Contributed primarily to backend development and deployment.',
    stack: ['Node', 'Express', 'PostgreSQL', 'WebSockets'],
    repo: 'https://github.com/Car-Pooling-System',
    problem: 'Car-pooling systems need reliable ride creation, matching, lifecycle management, and real-time communication between users.',
    whatItDoes: 'Swiftly provides a web-based car-pooling experience where users can participate in rides and receive real-time updates throughout the ride lifecycle.',
    contribution: 'My contribution focused primarily on backend development and deployment, working on the services responsible for handling real-time application behaviour and backend functionality.',
    architecture: 'The application uses a backend service architecture with real-time communication and persistent database support for ride and user-related information.',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'WebSockets'],
    statusExpanded: 'Deployed.',
  },
  {
    name: 'Foresight',
    fullName: 'Intelligent Prediction & Analysis',
    status: 'wip',
    statusText: 'Training Models',
    desc: 'Academic ML project for intelligent prediction and analysis.',
    stack: ['Python', 'scikit-learn', 'Pandas', 'TensorFlow'],
    repo: 'https://github.com/NandithaC7/Foresight-ML',
    problem: 'Determining the condition and progression of produce quality can be difficult when relying only on visual inspection. The project explores multimodal information for intelligent prediction and analysis.',
    whatItDoes: 'Foresight is an academic ML project focused on analyzing produce condition and developing predictive models for intelligent assessment.',
    data: 'The project works with multimodal information including visual and sensor-based data for the prediction task.',
    contribution: 'Focused on the machine-learning workflow, including dataset handling, preprocessing, model development and experimentation.',
    architecture: '',
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'scikit-learn'],
    statusExpanded: 'Training models / active academic development.',
  },
  {
    name: 'Urban Crime Pattern Analysis',
    fullName: 'Hotspot Prediction System',
    status: 'proto',
    statusText: 'Initial Stage',
    desc: 'Big Data analytics project using predictive analysis for crime hotspots.',
    stack: ['Python', 'PySpark', 'Pandas', 'Hadoop'],
    repo: 'https://github.com/NandithaC7/Urban-Crime-Pattern-Analysis-Hotspot-Prediction',
    problem: 'Large-scale crime datasets contain geographic and temporal patterns that can be difficult to identify manually. Understanding these patterns can help analyze where and when crime incidents tend to concentrate.',
    whatItDoes: 'The project applies Big Data processing and predictive analysis to identify crime patterns and analyze potential hotspot regions.',
    dataProcessing: 'The project focuses on processing and analyzing crime data at scale rather than treating the problem as a simple classification task.',
    contribution: 'Working on the data-processing, analytical and predictive components of the project as part of the Big Data coursework/project workflow.',
    architecture: '',
    technologies: ['Python', 'PySpark', 'Pandas', 'Hadoop'],
    statusExpanded: 'Initial Stage.',
  },
  {
    name: 'Motion Consistency Evaluation',
    fullName: 'Unmodified Surveillance Video',
    status: 'wip',
    statusText: 'Implementation',
    desc: 'Final Year Project — AI-based motion consistency evaluation for surveillance videos.',
    stack: ['Python', 'PyTorch', 'OpenCV', 'TensorFlow'],
    repo: 'https://github.com/NandithaC7/Motion-Consistency-Evaluation-in-Unmodified-Surveillance-Video',
    problem: 'Surveillance video analysis can be affected by inconsistent or unexpected motion patterns. Identifying such inconsistencies requires understanding temporal behaviour across video frames.',
    whatItDoes: 'The project investigates AI-based methods for evaluating motion consistency in unmodified surveillance video data.',
    researchFocus: 'The work focuses on video understanding, temporal information, motion behaviour and AI-based evaluation rather than simple frame-level image classification.',
    contribution: 'This is my final-year research project, involving investigation, implementation and experimentation of approaches for evaluating motion consistency in surveillance video.',
    architecture: '',
    technologies: ['Python', 'PyTorch', 'OpenCV', 'TensorFlow'],
    statusExpanded: 'Implementation / Final Year Project.',
  },
];

const statusMap = {
  testing: { cls: 'wip', label: 'Testing' },
  completed: { cls: 'done', label: 'Completed' },
  wip: { cls: 'wip', label: 'In Development' },
  deploy: { cls: 'deploy', label: 'Deployed' },
  proto: { cls: 'proto', label: 'Initial Stage' },
};

const ExpandedSection = ({ title, children }) => {
  if (!children) return null;
  return (
    <div className="proj-expanded-section">
      <h4 className="expanded-label">{title}</h4>
      <div className="expanded-text">{children}</div>
    </div>
  );
};

const ProjectsSection = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleProject = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

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
            const isExpanded = expandedIndex === i;
            return (
              <AnimatedContent key={p.name} distance={40} direction="vertical" delay={i * 0.06} duration={0.65}>
                <div 
                  className={`proj-row cursor-target ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleProject(i)}
                >
                  {/* Orange thick top line */}
                  <div className="proj-row-bar" />

                  <div className="proj-row-body">
                    {/* Left: Name + description + stack */}
                    <div className="proj-row-left">
                      <div className="proj-row-title-row">
                        <h3 className="proj-row-name">{p.name}</h3>
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaGithub /> GitHub →
                      </a>
                      <span className="proj-clone-hint">
                        git clone {p.repo.replace('https://github.com/', '')}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        className="proj-expanded-container"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      >
                        <div className="proj-expanded-inner">
                          <div className="proj-expanded-grid">
                            <div className="proj-expanded-left">
                              <ExpandedSection title="PROBLEM">
                                {p.problem}
                              </ExpandedSection>
                              <ExpandedSection title="WHAT IT DOES">
                                {p.whatItDoes}
                              </ExpandedSection>
                              <ExpandedSection title="ML COMPONENT">
                                {p.mlComponent}
                              </ExpandedSection>
                              <ExpandedSection title="DATA">
                                {p.data}
                              </ExpandedSection>
                              <ExpandedSection title="DATA PROCESSING">
                                {p.dataProcessing}
                              </ExpandedSection>
                              <ExpandedSection title="RESEARCH FOCUS">
                                {p.researchFocus}
                              </ExpandedSection>
                              <ExpandedSection title="MY CONTRIBUTION">
                                {p.contribution}
                              </ExpandedSection>
                            </div>
                            
                            <div className="proj-expanded-right">
                              <ExpandedSection title="ARCHITECTURE">
                                {p.architecture}
                              </ExpandedSection>
                              <ExpandedSection title="TECHNOLOGIES">
                                <div className="expanded-tech-list">
                                  {p.technologies.map(tech => (
                                    <span key={tech} className="expanded-tech-item">{tech}</span>
                                  ))}
                                </div>
                              </ExpandedSection>
                              <ExpandedSection title="CURRENT STATUS">
                                {p.statusExpanded.split('\n').map((line, idx) => (
                                  <React.Fragment key={idx}>
                                    {line}<br/>
                                  </React.Fragment>
                                ))}
                              </ExpandedSection>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
