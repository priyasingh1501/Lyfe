import React from 'react';
import { motion } from 'framer-motion';
import { componentStyles, animations } from '../../styles/designTokens';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  disabled = false,
  loading = false,
  animate = true,
  ...props 
}) => {
  const baseClasses = componentStyles.button[variant];
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };
  
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();
  
  const MotionComponent = animate ? motion.button : 'button';
  
  return (
    <MotionComponent
      className={buttonClasses}
      disabled={disabled || loading}
      whileHover={animate && !disabled ? animations.hover : undefined}
      whileTap={animate && !disabled ? animations.tap : undefined}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </MotionComponent>
  );
};

export default Button;
