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
        <p className="kicker"><span className="tok">$</span> git push origin main</p>

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
            <StarBorder as="a" href="mailto:your@email.com" color="#ff3b2e" speed="4s" className="contact-cta cursor-target">
              Get in Touch <FaArrowRight />
            </StarBorder>
          </Magnet>

          <div className="contact-channels">
            <a className="channel cursor-target" href="mailto:your@email.com"><FaEnvelope /> email</a>
            <a className="channel cursor-target" href="https://github.com/your-github" target="_blank" rel="noreferrer"><FaGithub /> github</a>
            <a className="channel cursor-target" href="https://linkedin.com/in/your-linkedin" target="_blank" rel="noreferrer"><FaLinkedin /> linkedin</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
