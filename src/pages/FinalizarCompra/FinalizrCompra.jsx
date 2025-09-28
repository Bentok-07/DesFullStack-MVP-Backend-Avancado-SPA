// src/pages/FinalizarCompra/FinalizarCompra.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CustomButton } from '../../components/CustomButton/CustomButton';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { createOrder } from '../../services/ordersApi';
import { cepLookup } from '../../services/customersApi';
import { getCurrentCustomer } from '../../services/customersApi';
import { getUsdBrlRate } from '../../services/ordersApi';




import styles from './FinalizarCompra.module.css';

function FinalizarCompra() {
  const [itens, setItens] = useState([]);
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [cep, setCep] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [erroCep, setErroCep] = useState('');

  const [currentCustomer, setCurrentCustomer] = useState(null);

  const [rate, setRate] = useState(null);
  const [rateFallback,setRateFallback] = useState(false);
  const [rateError, setRateError] = useState('');




  // Carrega os itens do carrinho e redireciona se estiver vazio
  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (dados.length === 0) {
      alert("Seu carrinho está vazio.");
      navigate('/');
    } else {
      setItens(dados);
    }
  }, [navigate]);

  const total = itens.reduce((soma, item) => soma + item.price * item.quantidade, 0);



  //***************************************************************************************
   
  useEffect(() => {
    const c = getCurrentCustomer();
    setCurrentCustomer(c || null);

    // se houver cliente logado, pré-preenche os campos
    if (c) {
      if (!nome) setNome(c.name || '');
      // monta endereço a partir dos campos do cliente
      const parts = [
        c.street,
        c.neighborhood,
        c.city && c.state ? `${c.city}-${c.state}` : (c.city || c.state)
      ].filter(Boolean);
      if (!endereco && parts.length) setEndereco(parts.join(', '));
      if (c.cep) setCep(String(c.cep).replace(/\D/g, '').slice(0, 8));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
//*****************************************************************************************



//************************************************************************************** */
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
//******************************************************************************************* */





//*********************************************

async function confirmarPedido() {
  
  if (!currentCustomer?.id) {
    alert("Faça login para concluir a compra.");
    navigate('/login', { state: { from: '/finalizar' } });
    return;
  }

  
  // validações simples
  if (!nome || !endereco) {
    alert("Por favor, preencha seu nome e endereço.");
    return;
  }

  // CEP: 8 dígitos
  const cepDigits = String(cep || '').replace(/\D/g, '');
  if (cepDigits.length !== 8) {
    alert("Informe um CEP válido (8 dígitos).");
    return;
  }

  // customer_id: prioriza cliente logado (id real); senão, usa nome/GUEST
  const customerId = (currentCustomer?.id != null)
    ? String(currentCustomer.id)
    : ((nome || '').trim() || 'GUEST');

  // payload para orders-api
  const payload = {
    customer_id: customerId,
    items: itens.map(i => ({
      sku: String(i.id),
      description: i.title,
      qty: i.quantidade,
      unit_price_usd: Number(i.price)
    }))
  };

  setSaving(true);
  setError('');
  let backendOrder = null;

  try {
    const orderResponse = await createOrder(payload); // POST /orders
    console.log('Order criada no backend:', orderResponse);

    // guarda dados essenciais retornados pelo backend
    backendOrder = {
      id: orderResponse.id,
      total_usd: orderResponse.total_usd,
      total_brl: orderResponse.total_brl,
      created_at: orderResponse.created_at,
    };
  } catch (e) {
    console.error(e);
    setError('Não foi possível criar o pedido no servidor. Seu pedido local será salvo mesmo assim.');
    alert('Falha ao criar pedido no backend. Vamos concluir localmente por enquanto.');
  } finally {
    setSaving(false);
  }

  // total local (USD) como fallback/compatibilidade
  const total = itens.reduce((soma, item) => soma + item.price * item.quantidade, 0);

  // snapshot salvo para a página de confirmação
  const pedidoConfirmado = {
    nome,
    endereco,
    cep: cepDigits,
    itens,
    total,
    backend: backendOrder, // {id,total_usd,total_brl,created_at} ou null
  };

  localStorage.setItem('pedidoFinalizado', JSON.stringify(pedidoConfirmado));
  localStorage.removeItem('carrinho');
  setItens([]);
  navigate('/confirmacao');
}

//*********************************************************************************** */



//********************************************************************************** */
async function buscarCEP() {
  const digits = (cep || '').replace(/\D/g, '');
  if (digits.length !== 8) {
    setErroCep('CEP inválido. Use 8 dígitos, ex.: 01001000');
    return;
  }
  setErroCep('');
  setLoadingCep(true);
  try {
    const data = await cepLookup(digits);

    // Tenta vários formatos comuns (ViaCEP e variações)
    const street =
      data.street || data.logradouro || data.endereco || '';
    const neighborhood =
      data.neighborhood || data.bairro || '';
    const city =
      data.city || data.localidade || data.municipio || '';
    const uf =
      data.state || data.uf || data.estado || '';

    const montado = [street, neighborhood, city && uf ? `${city}-${uf}` : (city || uf)].filter(Boolean).join(', ');
    if (!montado) {
      setErroCep('Não foi possível montar o endereço a partir do CEP.');
      return;
    }
    setEndereco(montado);
  } catch (e) {
    console.error(e);
    setErroCep('Falha ao consultar o CEP. Tente novamente.');
  } finally {
    setLoadingCep(false);
  }
}
//********************************************************************************************************************** */



  return (
    <div className={styles.finalizarContainer}>
      <Breadcrumb
        trilha={[
          { label: 'Início', link: '/' },
          { label: 'Carrinho', link: '/carrinho' },
          { label: 'Finalizar Pedido' },
        ]}
      />

      <h2>Finalização da Compra</h2>

      <div className={styles.subContainerFinalizar}>
        {/* Coluna com os itens listados */}
        <div className={styles.colunaItens}>
          <h4>Itens do Pedido:</h4>
          <ul>
            {itens.map(item => (
              <li key={item.id}>
                {item.title} — {item.quantidade}x $ {item.price.toFixed(2)} = <strong>$ {(item.price * item.quantidade).toFixed(2)}</strong>
              </li>
            ))}
          </ul>
        </div>

      {!currentCustomer ? (
      <div style={{ marginBottom: 12 }}>
        <CustomButton
          variant="secondary"
          onClick={() => navigate('/login', { state: { from: '/finalizar' } })}
        >
          Fazer login
        </CustomButton>
      </div>
    ) : (
      <div style={{ marginBottom: 12, fontSize: 14 }}>
        <strong>Cliente:</strong> {currentCustomer.name} ({currentCustomer.email})
      </div>
    )}
      



        {/* Coluna com o formulário e resumo do pedido */}
        <div className={styles.colunaFormulario}>
          <label>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
          />

          <label>CEP:</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={cep}
              onChange={e => setCep(e.target.value)}
              placeholder="Apenas números (ex.: 01001000)"
              maxLength={9}
            />
            <CustomButton variant="secondary" onClick={buscarCEP} disabled={loadingCep}>
              {loadingCep ? 'Buscando…' : 'Buscar CEP'}
            </CustomButton>
          </div>
          {erroCep && <p style={{ color: 'red', marginTop: 4 }}>{erroCep}</p>}
  


          <label>Endereço:</label>
          <textarea
            value={endereco}
            onChange={e => setEndereco(e.target.value)}
            rows={3}
          />

         <div className={styles.resumoCompra}>
            <p><strong>Total de itens:</strong> {itens.reduce((t, i) => t + i.quantidade, 0)}</p>
            <p><strong>Valor total (USD) :</strong> $ {total.toFixed(2)}</p>

            {rate == null ? (
              <p>{rateError || 'Carregando cotação USD→BRL...'}</p>
            ) : rateFallback ? (
              <p>
                <strong>Total (BRL):</strong> R$ {(total * rate).toFixed(2)}{' '}
                <small>(cotação indisponível; usando 1:1 temporariamente)</small>
              </p>
            ) : (
              <p>
                <strong>Total (BRL):</strong> R$ {(total * rate).toFixed(2)}{' '}
                <small>(cotação {rate.toFixed(4)})</small>
              </p>
            )}
          

            {error && <p style={{color:'red'}}>{error}</p>}
            <CustomButton variant="success" onClick={confirmarPedido} disabled={saving}>
              {saving ? 'Enviando...' : 'Confirmar Pedido'}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalizarCompra;
