// src/components/ModalConfirmacao/ModalConfirmacao.jsx
import React from 'react';
import styles from './ModalConfirmacao.module.css';

export default function ModalConfirmacao({ titulo, mensagem, onConfirmar, onCancelar }) {
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles.modal}>
        <h3>{titulo || "Confirmar Ação"}</h3>
        <p>{mensagem || "Tem certeza que deseja continuar?"}</p>
        <div className={styles['modal-botoes']}>
          <button className={styles['btn-confirmar']} onClick={onConfirmar}>Confirmar</button>
          <button className={styles['btn-cancelar']} onClick={onCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
