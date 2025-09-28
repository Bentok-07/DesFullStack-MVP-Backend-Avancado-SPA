// src/components/CustomButton/CustomButton.jsx
import React from 'react';
import styles from './CustomButton.module.css';

export function CustomButton({ onClick, children, disabled, variant = 'primary' }) {
  const className = `${styles.customButton} ${styles[variant] || ''}`;

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
