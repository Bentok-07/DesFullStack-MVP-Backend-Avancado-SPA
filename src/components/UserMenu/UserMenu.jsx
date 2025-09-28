import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../auth/auth";
import { logoutCustomer } from "../../services/customersApi";
import styles from "./UserMenu.module.css";

export function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const user = getCurrentUser();
  const firstName = (user?.name || "").trim().split(" ")[0] || "Minha conta";

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function go(path) {
    setOpen(false);
    navigate(path);
  }

  function onLogout() {
    setOpen(false);
    try { localStorage.removeItem("carrinho"); } catch {}
    logoutCustomer();
    navigate("/", { replace: true });
  }

  function onKeyDownButton(e) {    
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen((v) => !v);
    }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDownButton}
        title={user?.email || ""}
      >
        {firstName} <span aria-hidden="true" className={styles.caret}>▾</span>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <button
            className={styles.item}
            role="menuitem"
            onClick={() => go("/conta/dados")}
          >
            Meus dados
          </button>
          <button
            className={styles.item}
            role="menuitem"
            onClick={() => go("/conta/pedidos")}
          >
            Meus pedidos
          </button>
          <div className={styles.divider} aria-hidden="true" />
          <button
            className={`${styles.item} ${styles.danger}`}
            role="menuitem"
            onClick={onLogout}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
