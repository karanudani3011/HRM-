import React from 'react';
import ServicePortals from '../components/ServicePortals';

const Services = () => {
  return (
    <div className="services-page" style={{ paddingTop: '40px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
      <ServicePortals />
    </div>
  );
};

export default Services;
