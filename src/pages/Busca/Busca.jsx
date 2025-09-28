// src/pages/Busca/Busca.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CardComponente } from '../../components/CardComponente/CardComponente';
import Loader from '../../components/Loader/Loader';

import styles from './Busca.module.css';

export default function Busca() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  // Faz requisição para a API com base no termo digitado
  async function buscarProduto(e) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    setResultados([]);

    try {
      const resposta = await fetch(`https://dummyjson.com/products/search?q=${termo}`);
      if (!resposta.ok) throw new Error('Erro ao buscar');
      const json = await resposta.json();
      setResultados(json.products);
    } catch (err) {
      setErro('Erro ao buscar produtos. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.buscaContainer}>
      <h2>Buscar Produto</h2>

      <form className={styles.form} onSubmit={buscarProduto}>
        <input
          type="text"
          placeholder="Digite o nome do produto"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      {carregando && <Loader />}
      {erro && <p className={styles.msg}>{erro}</p>}
      {!carregando && !erro && resultados.length === 0 && termo === '' && (
        <p className={styles.msg}>Digite algo para iniciar a busca.</p>
      )}
      {!carregando && !erro && resultados.length === 0 && termo !== '' && (
        <p className={styles.msg}>Nenhum resultado encontrado.</p>
      )}

      <div className={styles.resultados}>
        {resultados.map((produto) => (
          <CardComponente
            key={produto.id}
            title={produto.title}
            image={produto.thumbnail}
            brand={produto.brand}
            price={produto.price}
            onVerDetalhes={() => navigate(`/detalhes/${produto.id}`)}
            onAdicionar={() => {
              const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];
              const existente = carrinhoAtual.find((item) => item.id === produto.id);

              if (existente) {
                existente.quantidade += 1;
              } else {
                carrinhoAtual.push({ ...produto, quantidade: 1 });
              }

              localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));
              alert('Produto adicionado ao carrinho!');
            }}
          />
        ))}
      </div>
    </div>
  );
}
