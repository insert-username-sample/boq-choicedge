import React from 'react';
import '../styles/glowing-button.css';

interface GlowingButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const GlowingButton: React.FC<GlowingButtonProps> = ({ text, onClick, className = '', icon, children }) => {
  return (
    <div className="relative">
      <button
        className={`neon-button ${className}`}
        onClick={onClick}
      >
        <div className="button-content">
          {icon && <div className="icon-wrapper">{icon}</div>}
          <span className="relative z-10">{text}</span>
          {children}
        </div>
      </button>
    </div>
  );
};

export default GlowingButton;