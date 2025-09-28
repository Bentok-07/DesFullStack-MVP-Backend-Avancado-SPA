// src/components/Loader/Loader.jsx
import React from 'react';
import styles from './Loader.module.css';

export default function Loader() {
  return (
    <div className={styles['loader-container']}>
      <div className={styles.loader}></div>
      <p>Carregando...</p>
    </div>
  );
}
