import React from 'react';
import DoctorSearch from '../components/DoctorSearch';

const FindDoctor = () => {
  return (
    <div className="find-doctor-page" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <DoctorSearch />
    </div>
  );
};

export default FindDoctor;
