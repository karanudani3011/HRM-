import React, { useState } from 'react';
import './DeveloperPage.css';

// Inline social icons — no lucide-react dependency
const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);
const MailIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// Developer data — place photos in /public/images/ with matching filenames
const DEVELOPERS = [
  {
    id: 'jeeldave',
    name: 'Jeel Dave',
    role: 'Lead Web Architect, Frontend Engineer & Business Developer',
    bio: 'Architects modern React applications with premium UI/UX, seamless transitions, and clean client-side architectures. Dedicated to bringing high-fidelity glassmorphism and stunning responsiveness to every pixel.',
    skills: ['React.js', 'JavaScript (ES6+)', 'Tailwind CSS', 'Vite', 'HTML5 & CSS3', 'UI/UX Design'],
    initials: 'JD',
    photo: '/images/jeel-dave.png',
    github: 'https://github.com/JeelDave08',
    linkedin: 'https://www.linkedin.com/in/jeel-dave-b9976935b/?originalSubdomain=in',
    email: 'jeeldave8@gmail.com',
  },
  {
    id: 'karanudani',
    name: 'Karan Udani',
    role: 'Full Stack Developer, Systems Admin & Business Developer',
    bio: 'Bridges front-end experiences with secure, robust database engines and application servers. Specializes in building full-lifecycle applications, handling integrations, and optimization.',
    skills: ['Node.js', 'Express.js', 'Firebase', 'Supabase', 'RESTful APIs', 'SQL / NoSQL'],
    initials: 'KU',
    photo: '/images/karan-udani.jpeg',
    github: 'https://github.com/karanudani3011',
    linkedin: 'https://www.linkedin.com/in/karan-udani-web-developer',
    email: 'karanudani30@gmail.com',
  },

];

// Avatar component — shows photo if it exists, otherwise falls back to initials
const DevAvatar = ({ photo, name, initials }) => {
  const [imgFailed, setImgFailed] = useState(false);
  if (!imgFailed && photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="developer-image"
        onError={() => setImgFailed(true)}
      />
    );
  }
  return <div className="developer-image-placeholder">{initials}</div>;
};

const DeveloperPage = () => {
  return (
    <div className="developer-page">
      {/* Hero Banner */}
      <div className="developer-hero">
        <div className="container">
          <h1>Meet Our Development Team</h1>
          <p>
            The visionaries, engineers, and designers behind HRM Doctors Choice —
            committed to delivering a premium, secure, and compliant healthcare network.
          </p>
        </div>
      </div>

      <div className="container developer-content">
        <div className="developer-intro">
          <h2>The Minds Behind the Platform</h2>
          <p>
            Built by a passionate trio of developers, HRM Doctors Choice is the result
            of countless hours of craftsmanship — combining modern frontend design,
            robust backend infrastructure, and thoughtful user experience to create
            a healthcare platform India can rely on.
          </p>
        </div>

        {/* Developer Cards Grid */}
        <div className="developer-grid">
          {DEVELOPERS.map((dev) => (
            <div className="developer-card" key={dev.id}>
              {/* Profile Image */}
              <div className="developer-image-container">
                <DevAvatar photo={dev.photo} name={dev.name} initials={dev.initials} />
              </div>

              {/* Info */}
              <h3 className="developer-name">{dev.name}</h3>
              <div className="developer-role">{dev.role}</div>
              <p className="developer-bio">{dev.bio}</p>

              {/* Skills */}
              <div className="developer-skills">
                {dev.skills.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>

              {/* Social Links */}
              <div className="developer-footer">
                <div className="social-links">
                  <a href={dev.github} target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
                    <GithubIcon size={18} />
                  </a>
                  <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
                    <LinkedinIcon size={18} />
                  </a>
                  <a href={`mailto:${dev.email}`} className="social-link" title="Email">
                    <MailIcon size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;
