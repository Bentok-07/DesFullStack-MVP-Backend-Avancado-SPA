import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCustomerById,
  updateCustomer,
  cepLookup,
  saveCurrentCustomer,
} from "../../services/customersApi";
import { getCurrentUser } from "../../auth/auth";
import { CustomButton } from "../../components/CustomButton/CustomButton";
import styles from "./ContaDados.module.css";

// campos exibidos/alteráveis
const FIELDS = [
  "name",
  "email",
  "phone",
  "cep",
  "street",
  "neighborhood",
  "city",
  "state",
];

export default function ContaDados() {
  const navigate = useNavigate();

  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cepErr, setCepErr] = useState("");

  const current = useMemo(() => getCurrentUser(), []);
  const customerId = current?.id;

  useEffect(() => {
    async function load() {
      try {
        setErr("");
        setOk("");
        if (!customerId) {
          navigate("/login", { replace: true });
          return;
        }
        // 1) snapshot rápido do storage
        const local = getCurrentUser();
        if (local) {
          const snap = pickFields(local, FIELDS);
          setOriginal(snap);
          setForm({ ...snap });
        }
        // 2) refresh do backend
        const fresh = await getCustomerById(customerId);
        const snapFresh = pickFields(fresh, FIELDS);
        setOriginal(snapFresh);
        setForm({ ...snapFresh });
        saveCurrentCustomer(fresh);
      } catch (e) {
        console.error(e);
        setErr("Não foi possível carregar seus dados agora.");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Meus dados</h1>
        <p>Carregando…</p>
      </div>
    );
  }

  if (!form || !original) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Meus dados</h1>
        <p>Não foi possível carregar os dados do cliente.</p>
      </div>
    );
  }

  function onChange(field, value) {
    setErr("");
    setOk("");
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onCepBlur() {
    const onlyDigits = String(form.cep || "").replace(/\D/g, "");
    setCepErr("");
    if (!onlyDigits) return;
    if (onlyDigits.length !== 8) {
      setCepErr("CEP deve ter 8 dígitos.");
      return;
    }
    try {
      const addr = await cepLookup(onlyDigits);
      setForm((f) => ({
        ...f,
        cep: onlyDigits,
        street: addr.street || f.street || "",
        neighborhood: addr.neighborhood || f.neighborhood || "",
        city: addr.city || f.city || "",
        state: addr.state || f.state || "",
      }));
    } catch (e) {
      console.error(e);
      setCepErr("CEP inválido ou não encontrado.");
    }
  }

  function validateBeforeSave(changes) {
    if (!form.name || !String(form.name).trim()) {
      return "Nome não pode ficar em branco.";
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Informe um e-mail válido.";
    }
    const cep = String(form.cep || "").replace(/\D/g, "");
    if (cep && cep.length !== 8) {
      return "CEP deve ter 8 dígitos.";
    }
    if (showPassword || newPassword || confirmPassword) {
      if (!newPassword) return "Informe a nova senha.";
      if (newPassword.length < 6) return "A senha deve ter ao menos 6 caracteres.";
      if (newPassword !== confirmPassword) return "A confirmação de senha não confere.";
    }
    if (!changes || Object.keys(changes).length === 0) {
      return "Nenhuma alteração para salvar.";
    }
    return null;
  }

  function getChanges() {
    const diff = {};
    for (const key of FIELDS) {
      const cur = normalizeField(key, form[key]);
      const orig = normalizeField(key, original[key]);
      if (!isEqual(cur, orig)) {
        diff[key] = cur ?? null;
      }
    }
    if (showPassword && newPassword) {
      diff.password = newPassword;
    }
    return diff;
  }

  async function onSave() {
    try {
      setSaving(true);
      setErr("");
      setOk("");

      const changes = getChanges();
      const vErr = validateBeforeSave(changes);
      if (vErr) {
        setErr(vErr);
        return;
      }

      const updated = await updateCustomer(customerId, changes);

      const snap = pickFields(updated, FIELDS);
      setOriginal(snap);
      setForm({ ...snap });
      saveCurrentCustomer(updated);

      setShowPassword(false);
      setNewPassword("");
      setConfirmPassword("");

      setOk("Dados atualizados com sucesso.");
    } catch (e) {
      console.error(e);
      const msg = (e && e.message) || "";
      if (msg.includes("No fields to update")) {
        setErr("Nenhuma alteração para salvar.");
      } else if (msg.includes("CEP")) {
        setErr("CEP inválido.");
      } else {
        setErr("Não foi possível salvar agora. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    setErr("");
    setOk("");
    setForm({ ...original });
    setShowPassword(false);
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Meus dados</h1>

      {ok && <div className={styles.feedbackOk}>{ok}</div>}
      {err && <div className={styles.feedbackErr}>{err}</div>}

      <div className={styles.formGrid}>
        <Field
          label="Nome"
          value={form.name || ""}
          onChange={(v) => onChange("name", v)}
        />

        <Field
          label="E-mail"
          type="email"
          value={form.email || ""}
          onChange={(v) => onChange("email", v)}
        />

        <Field
          label="Telefone"
          value={form.phone || ""}
          onChange={(v) => onChange("phone", v)}
        />

        <Field
          label="CEP"
          value={form.cep || ""}
          onChange={(v) => onChange("cep", v)}
          onBlur={onCepBlur}
          hint={cepErr}
          invalid={!!cepErr}
        />

        <Field
          label="Rua"
          value={form.street || ""}
          onChange={(v) => onChange("street", v)}
        />

        <Field
          label="Bairro"
          value={form.neighborhood || ""}
          onChange={(v) => onChange("neighborhood", v)}
        />

        <div className={styles.row2}>
          <Field
            label="Cidade"
            value={form.city || ""}
            onChange={(v) => onChange("city", v)}
          />
          <Field
            label="UF"
            value={form.state || ""}
            onChange={(v) => onChange("state", v)}
            maxLength={2}
          />
        </div>
      </div>

      <div className={styles.passwordBlock}>
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => {
            setShowPassword((s) => !s);
            setNewPassword("");
            setConfirmPassword("");
          }}
        >
          {showPassword ? "Cancelar alteração de senha" : "Alterar senha"}
        </button>

        {showPassword && (
          <div className={styles.formGrid} style={{ marginTop: 8 }}>
            <Field
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <Field
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <CustomButton onClick={onSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </CustomButton>
        <CustomButton variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </CustomButton>
      </div>
    </div>
  );
}

/* -------- componentes e helpers locais -------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
  onBlur,
  hint,
  invalid,
  maxLength,
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        maxLength={maxLength}
        className={`${styles.input} ${invalid ? styles.invalid : ""}`}
      />
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  );
}

function pickFields(obj, keys) {
  const out = {};
  for (const k of keys) out[k] = obj?.[k] ?? null;
  return out;
}
function normalizeField(field, value) {
  if (value == null) return null;
  if (field === "cep") {
    const digits = String(value).replace(/\D/g, "");
    return digits || null;
  }
  if (field === "state") {
    return String(value).toUpperCase();
  }
  return value;
}
function isEqual(a, b) {
  return a === b;
}
