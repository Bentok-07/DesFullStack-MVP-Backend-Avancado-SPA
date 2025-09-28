// src/pages/Home/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Home.module.css';
import Loader from '../../components/Loader/Loader';
import fundoHero from '../../assets/fundo-abstrato.jpg';

export default function Home() {
  const [categorias, setCategorias] = useState([]);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const navigate = useNavigate();

  // Busca categorias e produtos para compor o carrossel
  useEffect(() => {
    async function buscarDados() {
      try {
        const respostaCategorias = await fetch('https://dummyjson.com/products/categories');
        const listaCategorias = await respostaCategorias.json();

        const respostaProdutos = await fetch('https://dummyjson.com/products?limit=1000');
        const dadosProdutos = await respostaProdutos.json();

        const categoriasComImagem = listaCategorias.map(cat => {
          const slug = cat.slug;
          const name = cat.name;
          const produto = dadosProdutos.products.find(p => p.category === slug);
          return {
            name,
            slug,
            imagem: produto?.thumbnail || '',
          };
        });

        setCategorias(categoriasComImagem);
        setCarregando(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setCarregando(false);
      }
    }

    buscarDados();
  }, []);

  // Ajusta responsividade ao redimensionar a janela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navegação no carrossel
  const anterior = () => {
    if (indiceAtivo > 0) setIndiceAtivo(indiceAtivo - 1);
  };

  const proximo = () => {
    if (indiceAtivo < categorias.length - 5) setIndiceAtivo(indiceAtivo + 1);
  };

  const visiveis = isMobile ? categorias : categorias.slice(indiceAtivo, indiceAtivo + 6);

  if (carregando) return <Loader />;

  return (
    <>
      <div
        className={styles.heroSection}
        style={{ backgroundImage: `url(${fundoHero})` }}
      >
        <div className={styles.heroOverlay}>
          <h1>Bem-vindo à Bellari</h1>
          <p>Descubra produtos incríveis. Selecione uma categoria abaixo para ver mais.</p>
        </div>
      </div>

      <div className={styles.homeContainer}>
        <div className={styles.carrossel}>
          <button onClick={anterior} className={styles.seta}>&lt;</button>

          <div className={styles.cards}>
            {visiveis.map((cat) => (
              <div
                key={cat.slug}
                className={styles.card}
                onClick={() => navigate(`/componentes/${cat.slug}`)}
              >
                <div className={styles.fotoFake}>
                  {cat.imagem ? (
                    <img src={cat.imagem} alt={cat.name} className={styles.imagemCategoria} />
                  ) : (
                    <span>{cat.name}</span>
                  )}
                </div>
                <p className={styles.nomeCategoria}>{cat.name}</p>
              </div>
            ))}
          </div>

          <button onClick={proximo} className={styles.seta}>&gt;</button>
        </div>
      </div>
    </>
  );
}
