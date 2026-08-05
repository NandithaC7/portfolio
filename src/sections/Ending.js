import React from 'react';
import './Ending.css';
import FadeContent from '../reactbits/FadeContent/FadeContent';

const Ending = () => {
  return (
    <section className="ending" aria-label="Building digital experiences">
      <FadeContent blur duration={2600} threshold={0.2} className="ending-fade">
        <h2 className="ending-type">
          <span>BUILDING</span>
          <span>DIGITAL</span>
          <span>EXPERIENCES.</span>
        </h2>
      </FadeContent>
    </section>
  );
};

export default Ending;
