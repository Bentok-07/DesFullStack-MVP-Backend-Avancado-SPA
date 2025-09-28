// src/pages/Cadastro/Cadastro.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { registerCustomer, loginCustomer, cepLookup } from '../../services/customersApi';
import { CustomButton } from '../../components/CustomButton/CustomButton';

function Cadastro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [err, setErr] = useState('');
  const [cepErr, setCepErr] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from) || '/finalizar';

  async function buscarCEP() {
    const digits = String(cep || '').replace(/\D/g, '');
    if (digits.length !== 8) {
      setCepErr('CEP inválido. Use 8 dígitos (ex.: 01001000).');
      return;
    }
    setCepErr('');
    setLoadingCep(true);
    try {
      const data = await cepLookup(digits);
      const st = data.street || data.logradouro || '';
      const nb = data.neighborhood || data.bairro || '';
      const ct = data.city || data.localidade || '';
      const uf = data.state || data.uf || '';

      setStreet(st);
      setNeighborhood(nb);
      setCity(ct);
      setState(uf);
    } catch (e) {
      console.error(e);
      setCepErr('Falha ao consultar o CEP. Tente novamente.');
    } finally {
      setLoadingCep(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');

    // validações simples
    const cepDigits = String(cep || '').replace(/\D/g, '');
    if (!name || !email || !password) {
      setErr('Preencha nome, e-mail e senha.');
      return;
    }
    if (cep && cepDigits.length > 0 && cepDigits.length !== 8) {
      setErr('CEP deve ter 8 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await registerCustomer({
        name,
        email,
        phone,
        password,
        cep: cepDigits || null,
        street,
        neighborhood,
        city,
        state,
      });

      // login automático após cadastro
      await loginCustomer({ email, password });

      // volta para a página de finalizar (ou origem)
      navigate(from, { replace: true });
    } catch (e) {
      console.error(e);
      setErr('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 520, margin: '80px auto' }}>
      <h2>Criar conta</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Nome completo:
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>
          E-mail:
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>
          Telefone:
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(xx) xxxxx-xxxx" style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>
          Senha:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <div style={{ display: 'grid', gap: 8 }}>
          <label>CEP:</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={cep} onChange={e => setCep(e.target.value)} placeholder="Apenas números (ex.: 01001000)" style={{ flex: 1, padding: 8 }} />
            <CustomButton variant="secondary" type="button" onClick={buscarCEP} disabled={loadingCep}>
              {loadingCep ? 'Buscando…' : 'Buscar CEP'}
            </CustomButton>
          </div>
          {cepErr && <p style={{ color: 'red', margin: 0 }}>{cepErr}</p>}
        </div>

        <label>
          Rua:
          <input type="text" value={street} onChange={e => setStreet(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <label>
          Bairro:
          <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ flex: 1 }}>
            Cidade:
            <input type="text" value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
          </label>
          <label style={{ width: 120 }}>
            UF:
            <input type="text" value={state} onChange={e => setState(e.target.value)} maxLength={2} style={{ width: '100%', padding: 8, marginTop: 4, textTransform: 'uppercase' }} />
          </label>
        </div>

        {err && <p style={{ color: 'red', margin: 0 }}>{err}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <CustomButton variant="primary" type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </CustomButton>
          <CustomButton variant="secondary" type="button" onClick={() => navigate('/login', { state: { from } })}>
            Já tenho conta
          </CustomButton>
        </div>
      </form>
    </div>
  );
}

export default Cadastro;
