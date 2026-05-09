import { motion } from 'framer-motion';
import styles from './Card.module.css';

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  glow = false,
  onClick,
  animate = true
}) {
  const Component = animate ? motion.div : 'div';
  const animateProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};
  
  return (
    <Component
      className={`${styles.card} ${styles[variant]} ${glow ? styles.glow : ''} ${className}`}
      onClick={onClick}
      {...animateProps}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`${styles.cardHeader} ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`${styles.cardContent} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`${styles.cardFooter} ${className}`}>{children}</div>;
}
