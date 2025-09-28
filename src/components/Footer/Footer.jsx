// src/components/Footer/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.copy}>
        &copy; {new Date().getFullYear()} Bellari. Todos os direitos reservados.
      </div>
    </footer>
  );
}
