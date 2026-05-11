import React from 'react';
import Hero from '../components/Hero';
import PostCarousel from '../components/PostCarousel';
import ServicePortals from '../components/ServicePortals';
import SampleShowcase from '../components/SampleShowcase';
import UIMockups from '../components/UIMockups';

const Home = () => {
  return (
    <main>
      <PostCarousel />
      <Hero />
      <ServicePortals />
      <SampleShowcase />
      <UIMockups />
    </main>
  );
};

export default Home;
