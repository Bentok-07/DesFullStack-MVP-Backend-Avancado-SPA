// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginCustomer } from '../../services/customersApi';
import { CustomButton } from '../../components/CustomButton/CustomButton';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 1) tenta usar o redirect salvo pelo guard (RequireAuth)
  // 2) senão, usa o que veio no state (se alguém tiver passado)
  // 3) senão, usa um fallback padrão
  const savedRedirect = sessionStorage.getItem('redirectTo');
  const from =
    savedRedirect ||
    (location.state && location.state.from) ||
    '/conta/dados'; // (ajuste seu fallback preferido)

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const customer = await loginCustomer({ email, password });
      console.log('Logado:', customer);
      navigate(from, { replace: true });
      // limpa o redirect salvo para não "vazar" pro próximo login
      if (savedRedirect) sessionStorage.removeItem('redirectTo');
    } catch (e) {
      console.error(e);
      setErr('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: '80px auto' }}>
      <h2>Entrar</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          E-mail:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Senha:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        {err && <p style={{ color: 'red', margin: 0 }}>{err}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <CustomButton variant="primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </CustomButton>

          <CustomButton
            variant="secondary"
            type="button"
            onClick={() => navigate('/cadastro', { state: { from } })}
          >
            Criar conta
          </CustomButton>
        </div>
      </form>
    </div>
  );
}

export default Login;
