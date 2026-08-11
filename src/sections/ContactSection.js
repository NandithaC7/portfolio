import React from 'react';
import './ContactSection.css';
import SplitText from '../reactbits/SplitText/SplitText';
import TextType from '../reactbits/TextType/TextType';
import Magnet from '../reactbits/Magnet/Magnet';
import StarBorder from '../reactbits/StarBorder/StarBorder';
import { FaEnvelope, FaGithub, FaLinkedin, FaArrowRight } from 'react-icons/fa';

const ContactSection = () => {
  return (
    <section id="contact" className="sec contact">
      <div className="sec-inner">
        {/* Subtle terminal line — replaces the huge Impact section */}
        <p className="contact-cmd-line">
          <span className="contact-prompt">$</span>{' '}
          <TextType
            as="span"
            text={['sudo make impact']}
            loop={false}
            typingSpeed={65}
            startOnVisible
            className="contact-type"
          />
        </p>

        <p className="kicker" style={{ marginTop: '0.6rem' }}>
          <span className="tok">$</span> git push origin main
        </p>

        <div className="contact-title">
          <SplitText text="LET'S BUILD" tag="span" className="display line" splitType="chars" delay={25} from={{ opacity: 0, y: 60 }} to={{ opacity: 1, y: 0 }} />
          <SplitText text="SOMETHING" tag="span" className="display line stroke" splitType="chars" delay={25} from={{ opacity: 0, y: 60 }} to={{ opacity: 1, y: 0 }} />
          <SplitText text="WORTH USING." tag="span" className="display line accent" splitType="chars" delay={25} from={{ opacity: 0, y: 60 }} to={{ opacity: 1, y: 0 }} />
        </div>

        <p className="contact-meta">
          <TextType as="span" text={['// meaning: let\'s build together.']} loop={false} typingSpeed={45} startOnVisible className="contact-meta-type" />
        </p>

        <div className="contact-actions">
          <Magnet padding={100} magnetStrength={2.5} wrapperClassName="contact-magnet">
            <StarBorder as="a" href="mailto:nandithareddyc7@gmail.com" color="#ff3b2e" speed="4s" className="contact-cta cursor-target">
              Get in Touch <FaArrowRight />
            </StarBorder>
          </Magnet>

          <div className="contact-channels">
            <a className="channel cursor-target" href="mailto:nandithareddyc7@gmail.com">
              <FaEnvelope /> email
            </a>
            <a className="channel cursor-target" href="https://github.com/NandithaC7" target="_blank" rel="noreferrer">
              <FaGithub /> github
            </a>
            <a className="channel cursor-target" href="https://linkedin.com/in/nanditha-reddy-c" target="_blank" rel="noreferrer">
              <FaLinkedin /> linkedin
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
