import React from 'react';
import SampleShowcase from '../components/SampleShowcase';

const Samples = () => {
  return (
    <div className="samples-page" style={{ paddingTop: '40px', backgroundColor: '#ffffff', minHeight: 'calc(100vh - 200px)' }}>
      <SampleShowcase />
    </div>
  );
};

export default Samples;
