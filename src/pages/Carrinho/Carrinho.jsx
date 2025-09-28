// src/pages/Carrinho/Carrinho.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getUsdBrlRate } from '../../services/ordersApi';


import { CardComponente } from '../../components/CardComponente/CardComponente';
import { CustomButton } from '../../components/CustomButton/CustomButton';
import ModalConfirmacao from '../../components/ModalConfirmacao/ModalConfirmacao';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

import styles from './Carrinho.module.css';

function Carrinho() {
  const [itens, setItens] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);
  const navigate = useNavigate();

  const [rate, setRate] = useState(null);
  const [rateFallback,setRateFallback] = useState(false);
  const [rateError, setRateError] = useState('');



  // Carrega itens salvos no localStorage ao iniciar a página
  useEffect(() => {
    const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];
    setItens(carrinhoAtual);
  }, []);

useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      const res = await getUsdBrlRate();
      // compat: aceita número (versão antiga) ou objeto { rate, isFallback } (versão nova)
      const rateValue = typeof res === 'number' ? res : res?.rate;
      const isFallback = typeof res === 'object' ? !!res.isFallback : false;

      if (!mounted) return;
      if (rateValue == null || !Number.isFinite(rateValue)) {
        throw new Error('invalid rate');
      }
      setRate(rateValue);
      setRateFallback(isFallback);
      setRateError('');
    } catch (e) {
      console.error(e);
      if (mounted) {
        setRate(null);
        setRateFallback(false);
        setRateError('Falha ao carregar cotação USD→BRL.');
      }
    }
  })();
  return () => { mounted = false; };
}, []);




  // Ações de remoção com confirmação
  function solicitarRemocao(id) {
    setIdParaExcluir(id);
    setMostrarModal(true);
  }

  function confirmarRemocao() {
    const novaLista = itens.filter(item => item.id !== idParaExcluir);
    setItens(novaLista);
    localStorage.setItem('carrinho', JSON.stringify(novaLista));
    setMostrarModal(false);
    setIdParaExcluir(null);
  }

  function cancelarRemocao() {
    setMostrarModal(false);
    setIdParaExcluir(null);
  }

  // Ajusta quantidade de itens no carrinho
  function ajustarQuantidade(id, delta) {
    const atualizado = itens.map(item => {
      if (item.id === id) {
        const novaQtd = item.quantidade + delta;
        return { ...item, quantidade: novaQtd > 1 ? novaQtd : 1 };
      }
      return item;
    });

    setItens(atualizado);
    localStorage.setItem('carrinho', JSON.stringify(atualizado));
  }

  // Cálculo do subtotal

  const totalUsd = itens.reduce((s, i) => s + i.price * i.quantidade, 0);



  return (
    <div className={styles.containerCarrinho}>
      <div className={styles.topoFixo}>
        <Breadcrumb trilha={[{ label: 'Início', link: '/' }, { label: 'Carrinho' }]} />
        <h2>Carrinho de Compras</h2>
      </div>

      <div className={styles.listaItens}>
        {itens.map(item => (
          <div key={item.id} style={{ marginBottom: 12 }}>
            <CardComponente
              contexto="carrinho"
              title={item.title}
              image={item.thumbnail}
              brand={item.brand}
              price={item.price}
              quantidade={item.quantidade}
              onVerDetalhes={() => navigate(`/detalhes/${item.id}`)}
              onAdicionar={() => solicitarRemocao(item.id)}
              onDiminuir={() => ajustarQuantidade(item.id, -1)}
              onAumentar={() => ajustarQuantidade(item.id, 1)}
            />

           
          </div>
        ))}
      </div>


      {itens.length > 0 && (
        <div className={styles.finalizacaoFixa}>
          <div className={styles.resumoCarrinho}>
            <p><strong>Total (USD):</strong> ${totalUsd.toFixed(2)}</p>

            {rate == null ? (
              <p>{rateError || 'Carregando cotação USD→BRL...'}</p>
            ) : rateFallback ? (
              <p>
                <strong>Total (BRL):</strong> R$ {(totalUsd * rate).toFixed(2)}{' '}
                <small>(cotação indisponível; usando 1:1 temporariamente)</small>
              </p>
            ) : (
              <p>
                <strong>Total (BRL):</strong> R$ {(totalUsd * rate).toFixed(2)}{' '}
                <small>(cotação {rate.toFixed(4)})</small>
              </p>
            )}
          </div>


          <div className={styles.botaoFinalizar}>
            <CustomButton variant="primary" onClick={() => navigate('/finalizar')}>
              Finalizar Compra
            </CustomButton>
          </div>
        </div>
      )}

      {mostrarModal && (
        <ModalConfirmacao
          titulo="Remover do Carrinho"
          mensagem="Tem certeza que deseja remover este item do carrinho?"
          onConfirmar={confirmarRemocao}
          onCancelar={cancelarRemocao}
        />
      )}
    </div>
  );
}

export default Carrinho;
