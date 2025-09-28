// src/pages/Componentes/Componentes.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CardComponente } from '../../components/CardComponente/CardComponente';
import { adicionarAoCarrinho } from '../../utils/CarrinhoUtils';
import Loader from '../../components/Loader/Loader';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

import styles from './Componentes.module.css';

function Componentes() {
  const [componentes, setComponentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();
  const { categoria } = useParams();

  // Requisição à API ao carregar ou trocar a categoria
  useEffect(() => {
    async function buscarProdutos() {
      setCarregando(true);
      setErro(null);

      try {
        const resposta = await fetch(`https://dummyjson.com/products/category/${categoria}`);
        if (!resposta.ok) throw new Error('Erro ao buscar a API');

        const json = await resposta.json();
        setComponentes(json.products);
      } catch (err) {
        setErro('Erro ao carregar produtos. Tente novamente mais tarde.');
      } finally {
        setCarregando(false);
      }
    }

    buscarProdutos();
  }, [categoria]);

  if (carregando) return <Loader />;
  if (erro) return <p>{erro}</p>;

  return (
    <div className={styles.componentesContainer}>
      <Breadcrumb
        trilha={[
          { label: 'Início', link: '/' },
          { label: 'Componentes' },
        ]}
      />
      <h2 className={styles['titulo-pagina']}>Lista de Produtos</h2>

      <div className={styles['grid-produtos']}>
        {componentes.map((prod) => (
          <CardComponente
            key={prod.id}
            contexto="produtos"
            title={prod.title}
            image={prod.thumbnail}
            brand={prod.brand}
            category={prod.category}
            rating={prod.rating}
            price={prod.price}
            discount={prod.discountPercentage}
            onVerDetalhes={() => navigate(`/detalhes/${prod.id}`)}
            onAdicionar={() => adicionarAoCarrinho(prod)}
          />
        ))}
      </div>
    </div>
  );
}

export default Componentes;
