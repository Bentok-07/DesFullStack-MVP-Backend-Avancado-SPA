// src/pages/Detalhes/Detalhes.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';


import { CustomButton } from '../../components/CustomButton/CustomButton';
import Loader from '../../components/Loader/Loader';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { adicionarAoCarrinho } from '../../utils/CarrinhoUtils';

import styles from './Detalhes.module.css';



function Detalhes() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [imagemAtiva, setImagemAtiva] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Busca os dados do produto ao carregar a página
  useEffect(() => {
    async function buscarProduto() {
      setCarregando(true);
      try {
        const resp = await fetch(`https://dummyjson.com/products/${id}`);
        const json = await resp.json();
        setProduto(json);
        setImagemAtiva(json.thumbnail);
      } catch {
        alert('Erro ao carregar o produto');
      } finally {
        setCarregando(false);
      }
    }

    buscarProduto();
  }, [id]);

  if (carregando || !produto) return <Loader />;

  return (
    <div className={styles.detalhesContainer}>
      <Breadcrumb
        trilha={[
          { label: 'Início', link: '/' },
          { label: produto.category, link: `/componentes/${produto.category}` },
          { label: produto.title },
        ]}
      />

      <div className={styles.internContainer}>
        {/* Galeria de imagens */}
        <div className={styles.imagemContainer}>
          <img src={imagemAtiva} alt={produto.title} className={styles.imagemPrincipal} />
          <div className={styles.galeria}>
            {produto.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Imagem ${index + 1}`}
                onClick={() => setImagemAtiva(img)}
                className={styles.thumb}
              />
            ))}
          </div>
        </div>

        {/* Informações do produto */}
        <div className={styles.infoContainer}>
          <h2>{produto.title}</h2>
          <p className={styles.marca}><strong>Marca:</strong> {produto.brand}</p>
          <p><strong>Categoria:</strong> {produto.category}</p>
          <p>
            <strong>Avaliação:</strong>{' '}
            <FaStar style={{ color: '#f39c12', marginRight: '4px' }} />
            {produto.rating}
          </p>

          <p className={styles.precoCheio}>
            De R$ {(produto.price / (1 - produto.discountPercentage / 100)).toFixed(2)}
          </p>
          <p className={styles.desconto}>Baixou {produto.discountPercentage}%</p>
          <p className={styles.precoFinal}>$ {produto.price.toFixed(2)}</p>

          <p className={styles.descricao}>
            <strong>Descrição:</strong><br />
            {produto.description}
          </p>

          <CustomButton variant="success" onClick={() => adicionarAoCarrinho(produto)}>
            Adicionar ao Carrinho
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

export default Detalhes;
