import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Skills from './components/Skills';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Home />
      <About />
      <Skills />
      <Projects />
      <Contact />
    </div>
  );
}

export default App;
