// src/components/Breadcrumb/Breadcrumb.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

export default function Breadcrumb({ trilha }) {
  return (
    <nav className={styles.breadcrumb}>
      {trilha.map((item, index) => (
        <span key={index}>
          {item.link ? (
            <Link to={item.link}>{item.label}</Link>
          ) : (
            <span>{item.label}</span>
          )}
          {index < trilha.length - 1 && (
            <span className={styles.separador}> &gt; </span>
          )}
        </span>
      ))}
    </nav>
  );
}
