import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CustomButton } from '../../components/CustomButton/CustomButton';
import styles from './Confirmacao.module.css';

function Confirmacao() {
  const [pedido, setPedido] = useState(null);
  const navigate = useNavigate();

  // Recupera os dados do pedido finalizado
  useEffect(() => {
    try {
      const dados = JSON.parse(localStorage.getItem('pedidoFinalizado'));
      setPedido(dados);
    } catch {
      setPedido(null);
    }
  }, []);

  return (
    <div className={styles.confirmacaoContainer}>
      <h2>✅ Pedido realizado com sucesso!</h2>

      {pedido ? (
        <>
          <p>
            Obrigado pela sua compra, <strong>{pedido.nome}</strong>!
          </p>
          <p>
            Seu pedido será entregue em: <strong>{pedido.endereco}</strong>
          </p>
          {pedido?.cep && (
            <p>
              CEP:{' '}
              <strong>
                {`${String(pedido.cep).slice(0, 5)}-${String(pedido.cep).slice(5)}`}
              </strong>
            </p>
          )}

          {pedido?.backend ? (
            <>
              {pedido.backend.id && (
                <p>
                  <strong>Pedido #</strong>
                  {pedido.backend.id}
                </p>
              )}
              <p>
                <strong>Total (USD):</strong>{' '}
                ${Number(pedido.backend.total_usd || 0).toFixed(2)}
              </p>
              <p>
                <strong>Total (BRL):</strong>{' '}
                R$ {Number(pedido.backend.total_brl || 0).toFixed(2)}
              </p>
            </>
          ) : (
            <p>
              Total do pedido:{' '}
              <strong>R$ {Number(pedido?.total || 0).toFixed(2)}</strong>
            </p>
          )}

          <div className={styles.listaItens}>
            <h5>Itens do Pedido:</h5>
            <ul>
              {(pedido.itens || []).map((item) => (
                <li key={item.id}>
                  {item.title} — {item.quantidade}x R$ {item.price.toFixed(2)} ={' '}
                  <strong>R$ {(item.price * item.quantidade).toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p>Carregando dados do pedido...</p>
      )}

      <h4>Escolha a forma de pagamento:</h4>

      <div className={styles.secaoPagamento}>
        {/* PIX */}
        <div className={styles.pagamento}>
          <p><strong>Pix</strong></p>
          <img
            src="/img/confirmacao-pagamento.png"
            alt="Simulação de pagamento via Pix"
            className={styles.imgPix}
          />
        </div>

        {/* Boleto */}
        <div className={styles.pagamento}>
          <p><strong>Boleto</strong></p>
          <div className={styles.boleto}>
            34191.79001 01043.510047 91020.150008 6 87510000010000
          </div>
        </div>
      </div>

      {/* AÇÕES FINAIS */}
      <div className={styles.acoesFinais}>
        <CustomButton
          variant="secondary"
          onClick={() => navigate('/conta/pedidos')}
        >
          Meus pedidos
        </CustomButton>
        <CustomButton variant="primary" onClick={() => navigate('/')}>
          Voltar à loja
        </CustomButton>
      </div>
    </div>
  );
}

export default Confirmacao;
