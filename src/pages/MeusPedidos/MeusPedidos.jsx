// src/pages/MeusPedidos/MeusPedidos.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { listOrders, getOrder, deleteOrderById } from '../../services/ordersApi';
import { CustomButton } from '../../components/CustomButton/CustomButton';
import ModalConfirmacao from '../../components/ModalConfirmacao/ModalConfirmacao';
import { isLoggedIn, getCurrentUser } from '../../auth/auth';

import styles from './MeusPedidos.module.css';

function MeusPedidos() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [erroDetalhe, setErroDetalhe] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);

  // pega o usuário atual uma vez
  const currentUser = useMemo(() => getCurrentUser(), []);
  const customerId = String(currentUser?.id ?? '').trim();
  const customerName =
    (currentUser?.name || '').trim() || (customerId ? `ID ${customerId}` : '—');

  async function carregarPedidosDoLogado() {
    setLoading(true);
    setErro('');
    try {
      if (!customerId) {
        setPedidos([]);
        setErro('Erro: usuário sem ID válido.');
        return;
      }
      const params = { customer_id: customerId };
      const data = await listOrders(params);
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErro('Falha ao carregar pedidos.');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }

  async function verDetalhe(id) {
    setLoadingDetalhe(true);
    setErroDetalhe('');
    setDetalhe(null);
    try {
      const data = await getOrder(id);
      setDetalhe(data);
    } catch (e) {
      console.error(e);
      setErroDetalhe('Falha ao carregar detalhes do pedido.');
    } finally {
      setLoadingDetalhe(false);
    }
  }

  async function cancelarPedido(id) {
    try {
      await deleteOrderById(id);
      await carregarPedidosDoLogado();
    } catch (e) {
      alert(e.message);
    }
  }

  function solicitarRemocao(id) {
    setIdParaExcluir(id);
    setMostrarModal(true);
  }
  function confirmarRemocao() {
    cancelarPedido(idParaExcluir);
    setMostrarModal(false);
    setIdParaExcluir(null);
  }
  function cancelarRemocao() {
    setMostrarModal(false);
    setIdParaExcluir(null);
  }

  // Guard legado (pode remover se a rota já usa RequireAuth)
  useEffect(() => {
    if (!isLoggedIn()) {
      sessionStorage.setItem('redirectTo', '/conta/pedidos');
      navigate('/login', { replace: true });
      return;
    }
    carregarPedidosDoLogado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalUsd = (o) =>
    (o?.items || []).reduce((s, it) => s + Number(it?.line_total_usd || 0), 0) ||
    Number(o?.total_usd || 0) || 0;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Meus Pedidos</h2>

      <div className={styles.actions}>
        <CustomButton variant="primary" onClick={carregarPedidosDoLogado} disabled={loading}>
          {loading ? 'Carregando...' : 'Atualizar'}
        </CustomButton>
      </div>

      {erro && <p className={styles.error}>{erro}</p>}

      {pedidos.length === 0 ? (
        <p className={styles.empty}>Você ainda não tem pedidos.</p>
      ) : (
        <ul className={styles.list}>
          {pedidos.map((o) => (
            <li key={o.id} className={styles.item}>
              <div className={styles.meta}>
                <strong>#{o.id}</strong>
                {/* aqui trocamos o ID pelo nome do cliente logado */}
                <span>Cliente: {customerName}</span>
                <span>USD: ${totalUsd(o).toFixed(2)}</span>
                <span className={styles.status}>Status: {o.status ?? '—'}</span>
              </div>

              <div className={styles.btns}>
                <button className={styles.linkBtn} onClick={() => verDetalhe(o.id)}>
                  Ver detalhes
                </button>

                {o.status === 'PENDING' && (
                  <button
                    className={styles.dangerBtn}
                    onClick={() => solicitarRemocao(o.id)}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {erroDetalhe && <p className={styles.error}>{erroDetalhe}</p>}
      {loadingDetalhe && <p className={styles.loading}>Carregando detalhes…</p>}

      {detalhe && (
        <div className={styles.details}>
          <h4 className={styles.detailsTitle}>Detalhes do pedido #{detalhe.id}</h4>
          {/* aqui também mostramos o nome do cliente logado */}
          <p><strong>Cliente:</strong> {customerName}</p>
          <p><strong>Criado em:</strong> {new Date(detalhe.created_at).toLocaleString()}</p>
          <p><strong>Total (USD):</strong> ${Number(detalhe.total_usd || 0).toFixed(2)}</p>

          <h5>Itens</h5>
          <ul className={styles.detailsList}>
            {detalhe.items?.map((it) => (
              <li key={it.id}>
                {it.sku} — {it.description} — {it.qty}x $
                {Number(it.unit_price_usd).toFixed(2)} = $
                {Number(it.line_total_usd).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mostrarModal && (
        <ModalConfirmacao
          titulo="Cancelar pedido"
          mensagem="Tem certeza que deseja cancelar este pedido?"
          onConfirmar={confirmarRemocao}
          onCancelar={cancelarRemocao}
        />
      )}
    </div>
  );
}

export default MeusPedidos;
