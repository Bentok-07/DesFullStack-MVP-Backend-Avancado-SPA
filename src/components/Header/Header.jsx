import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import LoginButton from "../LoginButton/LoginButton";
import { isLoggedIn } from "../../auth/auth";
import { UserMenu } from "../UserMenu/UserMenu";

import {
  FaHome,
  FaShoppingCart,
  FaMoneyBillWave,
  FaSmile,
  FaInfoCircle,
  FaBoxOpen,
  FaSearch,
  FaQuestionCircle,
} from 'react-icons/fa';

function obterRotuloPagina(path) {
  if (path === '/') return <><FaHome /></>;
  if (path.startsWith('/carrinho')) return <><FaShoppingCart /></>;
  if (path.startsWith('/finalizar')) return <><FaMoneyBillWave /></>;
  if (path.startsWith('/confirmacao')) return <><FaSmile /></>;
  if (path.startsWith('/detalhes')) return <><FaInfoCircle /></>;
  if (path.startsWith('/componentes')) return <><FaBoxOpen /></>;
  if (path.startsWith('/busca')) return <><FaSearch /></>;
  if (path.startsWith('/conta')) return <>Minha conta</>; // opcional: rótulo genérico
  return <><FaQuestionCircle /> Página</>;
}

export default function Header() {
  const location = useLocation();
  const logged = isLoggedIn();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>Bellari</div>

      <nav>
        <ul className={styles.navList}>
          <div className={styles.indicadorRota}>
            {obterRotuloPagina(location.pathname)}
          </div>

          <li className={styles.navItem}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.ativo}` : styles.navLink
              }
            >
              Início
            </NavLink>
          </li>

          <li className={styles.navItem}>
            <NavLink
              to="/carrinho"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.ativo}` : styles.navLink
              }
            >
              Carrinho
            </NavLink>
          </li>

          <li className={styles.navItem}>
            <NavLink
              to="/busca"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.ativo}` : styles.navLink
              }
            >
              Busca
            </NavLink>
          </li>

          {/* empurra o bloco da direita */}
          <li className={styles.navItem} style={{ marginLeft: 'auto' }}>
            {logged ? (
              <UserMenu />
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <LoginButton className={styles.btnLogout} />

              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
