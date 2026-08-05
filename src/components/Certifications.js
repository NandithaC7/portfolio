import React from 'react';
import './Certifications.css';
import { FaCertificate } from 'react-icons/fa';

const certifications = [
  'Udemy Course on Full-Stack Development',
  'Coursera Course on Machine Learning',
];

const Certifications = () => {
  return (
    <section id="certifications" className="section certifications-section">
      <span className="section-eyebrow">Credentials</span>
      <h2 className="section-title">
        Publications and <span className="accent">Certifications</span>
      </h2>

      <div className="cert-grid">
        {certifications.map((item) => (
          <div className="cert-card" key={item}>
            <span className="cert-icon"><FaCertificate /></span>
            <p className="cert-text">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Certifications;
