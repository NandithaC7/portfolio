import React from 'react';
import './Resume.css';
import TextType from '../reactbits/TextType/TextType';
import Magnet from '../reactbits/Magnet/Magnet';
import StarBorder from '../reactbits/StarBorder/StarBorder';
import { FaDownload } from 'react-icons/fa';

const Resume = () => {
  return (
    <section id="resume" className="sec resume">
      <div className="sec-inner resume-inner">
        <div className="resume-copy">
          <p className="kicker"><span className="tok">$</span> git archive</p>
          <h2 className="display resume-title">GRAB THE <span className="accent">ARCHIVE</span></h2>
          <p className="resume-cmd">
            <TextType as="span" text={['git archive --format=pdf --output=nanditha.pdf HEAD']} loop={false} typingSpeed={35} startOnVisible className="resume-type" />
          </p>
        </div>
        <Magnet padding={90} magnetStrength={3} wrapperClassName="resume-magnet">
          <StarBorder as="a" href="/resume.pdf" download color="#d7ff3f" speed="5s" className="resume-btn cursor-target">
            <FaDownload /> Download Résumé
          </StarBorder>
        </Magnet>
      </div>
    </section>
  );
};

export default Resume;
