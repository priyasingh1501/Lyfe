import React from 'react';
import { motion } from 'framer-motion';
import { componentStyles, animations } from '../../styles/designTokens';

const Card = ({ 
  children, 
  variant = 'base', 
  className = '', 
  onClick, 
  animate = true,
  ...props 
}) => {
  const baseClasses = componentStyles.card[variant];
  const isInteractive = variant === 'interactive' || onClick;
  
  const cardClasses = `
    ${baseClasses}
    ${isInteractive ? 'cursor-pointer' : ''}
    ${className}
  `.trim();
  
  const MotionComponent = animate ? motion.div : 'div';
  
  return (
    <MotionComponent
      className={cardClasses}
      onClick={onClick}
      whileHover={animate && isInteractive ? animations.hover : undefined}
      whileTap={animate && isInteractive ? animations.tap : undefined}
      initial={animate ? animations.fade.initial : undefined}
      animate={animate ? animations.fade.animate : undefined}
      exit={animate ? animations.fade.exit : undefined}
      transition={animate ? animations.fade.transition : undefined}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export default Card;
