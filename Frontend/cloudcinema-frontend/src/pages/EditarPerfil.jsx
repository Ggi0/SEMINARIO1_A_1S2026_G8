import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function EditarPerfil() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "Usuario",
    email: "usuario@email.com",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // "info" | "password"

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    setError("");

    if (activeTab === "password") {
      if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
        setError("Completa todos los campos de contraseña.");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setError("Las contraseñas nuevas no coinciden.");
        return;
      }
      if (form.newPassword.length < 6) {
        setError("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }
    }

    if (activeTab === "info" && !form.name.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  };

  const passwordStrength = () => {
    const p = form.newPassword;
    if (!p) return null;
    if (p.length < 6) return { label: "Débil", color: "#e07070", width: "30%" };
    if (p.length < 10) return { label: "Regular", color: "#c8a96e", width: "60%" };
    return { label: "Fuerte", color: "#6ec88a", width: "100%" };
  };
  const strength = passwordStrength();

  return (
    <div style={styles.root}>
      <style>{globalStyles}</style>
      <div style={styles.ambientBg} />
      <div style={styles.grain} />

      {/* NAV */}
      <nav style={styles.nav}>
        <Link to="/gallery" style={styles.logoWrap}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>CLOUD<em>CINEMA</em></span>
        </Link>
        <Link to="/gallery" style={styles.backBtn} className="back-btn">
          ← Volver a la galería
        </Link>
      </nav>

      {/* PAGE */}
      <div style={styles.page}>

        {/* LEFT — Avatar card */}
        <div style={styles.sidebar}>
          <div style={styles.avatarCard}>
            <label htmlFor="photo-input" style={styles.avatarWrap} className="avatar-wrap">
              {photoPreview ? (
                <img src={photoPreview} alt="avatar" style={styles.avatarImg} />
              ) : (
                <div style={styles.avatarFallback}>
                  <span style={styles.avatarInitial}>U</span>
                </div>
              )}
              <div style={styles.avatarOverlay} className="avatar-overlay">
                <span style={styles.avatarOverlayIcon}>📷</span>
                <span style={styles.avatarOverlayText}>Cambiar</span>
              </div>
            </label>
            <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            <p style={styles.avatarName}>{form.name || "Usuario"}</p>
            <p style={styles.avatarEmail}>{form.email}</p>
            <div style={styles.avatarBadge}>✓ Cuenta activa</div>
          </div>

          {/* Nav links */}
          <div style={styles.sideNav}>
            <button
              style={{ ...styles.sideNavItem, ...(activeTab === "info" ? styles.sideNavActive : {}) }}
              onClick={() => { setActiveTab("info"); setError(""); }}
              className="side-nav-item"
            >
              <span>👤</span> Información personal
            </button>
            <button
              style={{ ...styles.sideNavItem, ...(activeTab === "password" ? styles.sideNavActive : {}) }}
              onClick={() => { setActiveTab("password"); setError(""); }}
              className="side-nav-item"
            >
              <span>🔒</span> Cambiar contraseña
            </button>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div style={styles.formCard}>

          {/* Header */}
          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>
              {activeTab === "info" ? "Información personal" : "Cambiar contraseña"}
            </h1>
            <p style={styles.formSubtitle}>
              {activeTab === "info"
                ? "Actualiza tu nombre, correo y biografía"
                : "Elige una contraseña segura"}
            </p>
          </div>

          {/* Error */}
          {error && <div style={styles.errorBox}>⚠ {error}</div>}

          {/* Success */}
          {saved && (
            <div style={styles.successBox}>✓ Cambios guardados correctamente</div>
          )}

          {/* INFO TAB */}
          {activeTab === "info" && (
            <div style={styles.fields}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Nombre completo</label>
                <div style={styles.inputWrap} className="input-wrap">
                  <span style={styles.inputIcon}>👤</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={styles.input}
                    className="field-input"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Correo electrónico</label>
                <div style={styles.inputWrap} className="input-wrap">
                  <span style={styles.inputIcon}>✉</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={styles.input}
                    className="field-input"
                    placeholder="ejemplo@email.com"
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Biografía <span style={styles.optional}>· Opcional</span></label>
                <div style={{ ...styles.inputWrap, alignItems: "flex-start" }} className="input-wrap">
                  <span style={{ ...styles.inputIcon, marginTop: "0.85rem" }}>✏️</span>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    style={styles.textarea}
                    className="field-input"
                    placeholder="Cuéntanos algo sobre ti..."
                    rows={3}
                    maxLength={160}
                  />
                </div>
                <span style={styles.charCount}>{form.bio.length}/160</span>
              </div>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === "password" && (
            <div style={styles.fields}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Contraseña actual</label>
                <div style={styles.inputWrap} className="input-wrap">
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    style={styles.input}
                    className="field-input"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                    {showCurrent ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Nueva contraseña</label>
                <div style={styles.inputWrap} className="input-wrap">
                  <span style={styles.inputIcon}>🔑</span>
                  <input
                    type={showNew ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    style={styles.input}
                    className="field-input"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                    {showNew ? "🙈" : "👁"}
                  </button>
                </div>
                {strength && (
                  <div style={styles.strengthWrap}>
                    <div style={styles.strengthBg}>
                      <div style={{ ...styles.strengthBar, width: strength.width, background: strength.color }} />
                    </div>
                    <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Confirmar nueva contraseña</label>
                <div style={styles.inputWrap} className="input-wrap">
                  <span style={styles.inputIcon}>🔐</span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    style={styles.input}
                    className="field-input"
                    placeholder="Repite la nueva contraseña"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
                {form.confirmPassword && (
                  <span style={{ fontSize: "0.75rem", color: form.newPassword === form.confirmPassword ? "#6ec88a" : "#e07070", marginTop: "0.3rem" }}>
                    {form.newPassword === form.confirmPassword ? "✓ Las contraseñas coinciden" : "✗ No coinciden"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <Link to="/gallery" style={styles.cancelBtn} className="cancel-btn">
              Cancelar
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...styles.saveBtn, opacity: saving ? 0.8 : 1 }}
              className="save-btn"
            >
              {saving ? (
                <span style={styles.loadingRow}>
                  <span className="spinner" style={styles.spinner} />
                  Guardando...
                </span>
              ) : "Guardar cambios →"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .back-btn:hover {
    background: rgba(200,169,110,0.1) !important;
    border-color: rgba(200,169,110,0.3) !important;
    color: #c8a96e !important;
    transform: translateX(-3px);
  }
  .back-btn { transition: all 0.2s ease !important; }

  .avatar-wrap:hover .avatar-overlay { opacity: 1 !important; }
  .avatar-overlay { transition: opacity 0.2s !important; }
  .avatar-wrap { cursor: pointer; }

  .side-nav-item:hover { background: rgba(255,255,255,0.05) !important; color: #e8e4dc !important; }
  .side-nav-item { transition: all 0.15s !important; }

  .input-wrap:focus-within {
    border-color: rgba(200,169,110,0.6) !important;
    box-shadow: 0 0 0 3px rgba(200,169,110,0.08) !important;
  }
  .field-input:focus { outline: none; }
  .field-input::placeholder { color: #3a3630; }

  .save-btn:hover:not(:disabled) {
    background: #d4b87a !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(200,169,110,0.3) !important;
  }
  .save-btn { transition: all 0.2s !important; }

  .cancel-btn:hover {
    background: rgba(255,255,255,0.06) !important;
    color: #e8e4dc !important;
  }
  .cancel-btn { transition: all 0.2s !important; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.8s linear infinite; }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#080810",
    color: "#e8e4dc",
    minHeight: "100vh",
    position: "relative",
  },
  ambientBg: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse 50% 50% at 30% 30%, #c8a96e0d 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 70%, #7b4b9e10 0%, transparent 50%)",
    pointerEvents: "none",
    animation: "pulse 8s ease infinite",
    zIndex: 0,
  },
  grain: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    opacity: 0.4,
    pointerEvents: "none",
    zIndex: 1,
  },

  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 3rem",
    background: "rgba(8,8,16,0.9)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(200,169,110,0.08)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    textDecoration: "none",
  },
  logoIcon: { color: "#c8a96e", fontSize: "1.2rem" },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.1rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#e8e4dc",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#9e9a93",
    textDecoration: "none",
    fontSize: "0.85rem",
    padding: "0.5rem 1rem",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "50px",
    background: "rgba(255,255,255,0.03)",
  },

  page: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    gap: "2rem",
    padding: "3rem",
    maxWidth: "1000px",
    margin: "0 auto",
    alignItems: "flex-start",
  },

  // SIDEBAR
  sidebar: { width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "1rem" },
  avatarCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "2rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.6rem",
    animation: "fadeIn 0.4s ease forwards",
  },
  avatarWrap: {
    position: "relative",
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    overflow: "hidden",
    marginBottom: "0.4rem",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarFallback: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #c8a96e, #8c6e3a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: "2rem", fontWeight: 700, color: "#080810" },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.2rem",
    opacity: 0,
  },
  avatarOverlayIcon: { fontSize: "1.2rem" },
  avatarOverlayText: { fontSize: "0.65rem", color: "#fff", letterSpacing: "0.06em" },
  avatarName: { fontWeight: 600, fontSize: "1rem" },
  avatarEmail: { fontSize: "0.78rem", color: "#5a5650" },
  avatarBadge: {
    marginTop: "0.2rem",
    fontSize: "0.7rem",
    color: "#6ec88a",
    background: "rgba(110,200,138,0.1)",
    border: "1px solid rgba(110,200,138,0.2)",
    padding: "0.2rem 0.7rem",
    borderRadius: "50px",
  },

  sideNav: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "0.4rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  sideNavItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    color: "#9e9a93",
    padding: "0.7rem 0.9rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  sideNavActive: {
    background: "rgba(200,169,110,0.1)",
    color: "#c8a96e",
    border: "1px solid rgba(200,169,110,0.15)",
  },

  // FORM CARD
  formCard: {
    flex: 1,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "2.5rem",
    animation: "fadeIn 0.4s ease 0.1s both",
  },
  formHeader: { marginBottom: "2rem" },
  formTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.6rem",
    marginBottom: "0.4rem",
  },
  formSubtitle: { color: "#5a5650", fontSize: "0.875rem" },

  errorBox: {
    background: "rgba(220,80,80,0.1)",
    border: "1px solid rgba(220,80,80,0.25)",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    fontSize: "0.85rem",
    color: "#e07070",
    marginBottom: "1.5rem",
  },
  successBox: {
    background: "rgba(110,200,138,0.1)",
    border: "1px solid rgba(110,200,138,0.25)",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    fontSize: "0.85rem",
    color: "#6ec88a",
    marginBottom: "1.5rem",
  },

  fields: { display: "flex", flexDirection: "column", gap: "1.3rem" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.45rem" },
  label: { fontSize: "0.78rem", color: "#9e9a93", letterSpacing: "0.06em", textTransform: "uppercase" },
  optional: { textTransform: "none", color: "#3a3630", letterSpacing: 0 },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "0 1rem",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputIcon: { fontSize: "0.9rem", marginRight: "0.6rem", opacity: 0.5, flexShrink: 0 },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#e8e4dc",
    fontSize: "0.95rem",
    padding: "0.8rem 0",
    fontFamily: "'DM Sans', sans-serif",
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#e8e4dc",
    fontSize: "0.9rem",
    padding: "0.8rem 0",
    fontFamily: "'DM Sans', sans-serif",
    resize: "none",
    lineHeight: 1.6,
  },
  charCount: { fontSize: "0.72rem", color: "#3a3630", textAlign: "right" },
  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: "0.4rem",
    opacity: 0.6,
  },

  strengthWrap: { display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.3rem" },
  strengthBg: { flex: 1, height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" },
  strengthBar: { height: "100%", borderRadius: "2px", transition: "width 0.3s, background 0.3s" },
  strengthLabel: { fontSize: "0.72rem", minWidth: "45px" },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "2.5rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  cancelBtn: {
    padding: "0.75rem 1.5rem",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#9e9a93",
    textDecoration: "none",
    fontSize: "0.9rem",
    background: "transparent",
    cursor: "pointer",
  },
  saveBtn: {
    background: "#c8a96e",
    color: "#080810",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.75rem",
    fontSize: "0.9rem",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  loadingRow: { display: "flex", alignItems: "center", gap: "0.5rem" },
  spinner: {
    display: "inline-block",
    width: "13px",
    height: "13px",
    border: "2px solid rgba(8,8,16,0.3)",
    borderTopColor: "#080810",
    borderRadius: "50%",
  },
};