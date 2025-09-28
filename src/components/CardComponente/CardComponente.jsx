// src/components/CardComponente/CardComponente.jsx
import React from 'react';
import styles from './CardComponente.module.css';
import { CustomButton } from '../CustomButton/CustomButton';
import { FaStar } from 'react-icons/fa';

export function CardComponente({
  contexto = 'produtos',
  modoLista = false,
  title,
  image,
  brand,
  category,
  rating,
  price,
  discount,
  quantidade,
  onVerDetalhes,
  onAdicionar,
  onDiminuir,
  onAumentar,
}) {
  if (modoLista) {
    return (
      <div className={styles.cardLista}>
        <img src={image} alt={title} className={styles.thumbLista} />
        <div className={styles.infoLista}>
          <p className={styles.nomeProduto}>{title}</p>
          <p className={styles.precoLista}>$ {price.toFixed(2)}</p>
        </div>
        <div className={styles.botoesLista}>
          <CustomButton variant="outline" onClick={onVerDetalhes}>
            Detalhes
          </CustomButton>
          <CustomButton variant="danger" onClick={onAdicionar}>
            Remover
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles[contexto]}`}>
      {image && <img src={image} alt={title} className={styles.imagem} />}
      <h5 className={styles.titulo}>{title}</h5>

      {contexto === 'finalizar' ? (
        <p className={styles.precoFinalizar}>$ {price.toFixed(2)}</p>
      ) : contexto === 'carrinho' ? (
        <div className={styles.conteudoCarrinho}>
          <div className={styles.infoCarrinho}>
            <p className={styles.marca}>Marca: {brand}</p>
            <p className={styles.preco}>Preço unitário: $ {price.toFixed(2)}</p>
            <p className={styles.quantidade}>Quantidade: {quantidade || 1}</p>
            <p className={styles.subtotal}>
              Subtotal: $ {(price * (quantidade || 1)).toFixed(2)}
            </p>
          </div>

          <div className={styles.controleQuantidade}>
            <button onClick={onDiminuir} className={styles.btnQuantidade}>-</button>
            <span className={styles.quantidade}>{quantidade}</span>
            <button onClick={onAumentar} className={styles.btnQuantidade}>+</button>
          </div>

          <div className={styles.botoes}>
            <CustomButton variant="outline" onClick={onVerDetalhes}>
              Detalhes
            </CustomButton>
            <CustomButton variant="danger" onClick={onAdicionar}>
              Remover
            </CustomButton>
          </div>
        </div>
      ) : (
        <>
          <p className={styles.marca}>Marca: {brand}</p>
          <p className={styles.categoria}>Categoria: {category}</p>
          <div className={styles.linhaInfo}>
            <span className={styles.rating}>
              <FaStar style={{ marginRight: '4px', color: '#f39c12' }} />
              {rating}
            </span>
            {discount && (
              <span className={styles.desconto}>Baixou {discount}%</span>
            )}
          </div>
          <p className={styles.preco}>$ {price.toFixed(2)}</p>
          <div className={styles.botoes}>
            <CustomButton variant="outline" onClick={onVerDetalhes}>
              Ver detalhes
            </CustomButton>
            <CustomButton variant="success" onClick={onAdicionar}>
              Adicionar ao Carrinho
            </CustomButton>
          </div>
        </>
      )}
    </div>
  );
}
