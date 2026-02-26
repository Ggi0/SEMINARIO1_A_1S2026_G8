import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const MOVIES = [
  { id: 1, title: "Dune: Part Two", genre: "Sci-Fi", year: 2024, rating: 8.9, color: "#c8a96e", badge: "NUEVO" },
  { id: 2, title: "Oppenheimer", genre: "Drama", year: 2023, rating: 8.4, color: "#e07b39", badge: "TOP" },
  { id: 3, title: "Poor Things", genre: "Fantasy", year: 2023, rating: 8.0, color: "#7eb8c9", badge: null },
  { id: 4, title: "The Brutalist", genre: "Drama", year: 2024, rating: 7.9, color: "#a89b8c", badge: null },
  { id: 5, title: "Alien: Romulus", genre: "Terror", year: 2024, rating: 7.2, color: "#8cb87e", badge: "NUEVO" },
  { id: 6, title: "Furiosa", genre: "Acción", year: 2024, rating: 7.8, color: "#c87e7e", badge: null },
  { id: 7, title: "Inside Out 2", genre: "Animación", year: 2024, rating: 7.9, color: "#b87ec8", badge: "TOP" },
  { id: 8, title: "Civil War", genre: "Thriller", year: 2024, rating: 7.5, color: "#7e9bc8", badge: null },
  { id: 9, title: "Challengers", genre: "Romance", year: 2024, rating: 7.6, color: "#c8ae7e", badge: null },
  { id: 10, title: "Nosferatu", genre: "Terror", year: 2024, rating: 7.1, color: "#8c7ec8", badge: "NUEVO" },
  { id: 11, title: "Flow", genre: "Animación", year: 2024, rating: 8.3, color: "#7ec8b8", badge: "TOP" },
  { id: 12, title: "Conclave", genre: "Thriller", year: 2024, rating: 7.4, color: "#c8907e", badge: null },
];

const GENRES = ["Todos", "Acción", "Terror", "Drama", "Animación", "Sci-Fi", "Thriller", "Romance", "Fantasy"];

export default function Gallery() {
  const navigate = useNavigate();
  const [activeGenre, setActiveGenre] = useState("Todos");
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const filtered = MOVIES.filter((m) => {
    const matchGenre = activeGenre === "Todos" || m.genre === activeGenre;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  return (
    <div style={styles.root}>
      <style>{globalStyles}</style>
      <div style={styles.ambientBg} />
      <div style={styles.grain} />

      {/* NAV */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.logoWrap} className="logo-link">
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>CLOUD<em>CINEMA</em></span>
        </Link>

        {/* Search */}
        <div style={styles.searchWrap} className="search-wrap">
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar película..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            className="search-input"
          />
          {search && (
            <button onClick={() => setSearch("")} style={styles.clearBtn}>✕</button>
          )}
        </div>

        {/* Profile */}
        <div style={styles.profileArea}>
          <button
            style={styles.profileBtn}
            className="profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div style={styles.profileAvatar}>
              <span style={styles.profileInitial}>U</span>
            </div>
            <span style={styles.profileName}>Mi cuenta</span>
            <span style={{ fontSize: "0.7rem", color: "#5a5650", transition: "transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div style={styles.dropdown} className="dropdown">
              <div style={styles.dropdownHeader}>
                <div style={styles.dropdownAvatar}>
                  <span style={{ fontSize: "1.5rem" }}>👤</span>
                </div>
                <div>
                  <p style={styles.dropdownName}>Usuario</p>
                  <p style={styles.dropdownEmail}>usuario@email.com</p>
                </div>
              </div>
              <div style={styles.dropdownDivider} />
              <button style={styles.dropdownItem} className="dropdown-item" onClick={() => navigate("/edit-profile")}>Editar perfil</button>
              <div style={styles.dropdownDivider} />
              <button
                style={{ ...styles.dropdownItem, color: "#e07070" }}
                className="dropdown-item"
                onClick={() => navigate("/")}
              >
                → Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO BANNER */}
      <section style={styles.banner}>
        <div style={styles.bannerGlow} />
        <p style={styles.bannerLabel}>⭐ Destacado de la semana</p>
        <h1 style={styles.bannerTitle}>Dune: Part Two</h1>
        <p style={styles.bannerDesc}>El viaje épico de Paul Atreides continúa en Arrakis. Una historia de poder, amor y destino.</p>
        <div style={styles.bannerActions}>
          <button style={styles.bannerPlay} className="banner-play">▶ Ver ahora</button>
          <button style={styles.bannerInfo} className="banner-info">+ Mi lista</button>
        </div>
      </section>

      {/* GENRE FILTER */}
      <div style={styles.filterBar}>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            style={{
              ...styles.genreBtn,
              background: activeGenre === g ? "#c8a96e" : "rgba(255,255,255,0.04)",
              color: activeGenre === g ? "#080810" : "#9e9a93",
              border: activeGenre === g ? "1px solid #c8a96e" : "1px solid rgba(255,255,255,0.08)",
              fontWeight: activeGenre === g ? 600 : 400,
            }}
            className="genre-btn"
          >
            {g}
          </button>
        ))}
      </div>

      {/* GRID */}
      <section style={styles.gridSection}>
        <h2 style={styles.gridTitle}>
          {activeGenre === "Todos" ? "Todas las películas" : activeGenre}
          <span style={styles.gridCount}>{filtered.length} títulos</span>
        </h2>

        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "2rem" }}>🎬</p>
            <p style={{ color: "#5a5650" }}>No se encontraron resultados para "{search}"</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((movie, i) => (
              <div
                key={movie.id}
                style={{ ...styles.card, animationDelay: `${i * 0.05}s`, "--accent": movie.color }}
                className="movie-card"
              >
                {/* Poster */}
                <div style={{ ...styles.poster, background: `linear-gradient(145deg, ${movie.color}30 0%, #0a0a14 100%)` }}>
                  <div style={{ ...styles.posterGlow, background: movie.color }} />
                  {movie.badge && (
                    <span style={{
                      ...styles.badge,
                      background: movie.badge === "TOP" ? "#c8a96e" : "#6ec88a",
                      color: "#080810",
                    }}>{movie.badge}</span>
                  )}
                  <div style={styles.posterOverlay} className="poster-overlay">
                    <button style={styles.playBtn} className="play-btn">▶</button>
                    <button style={styles.listBtn} className="list-btn">+</button>
                  </div>
                </div>
                {/* Info */}
                <div style={styles.cardInfo}>
                  <p style={styles.cardTitle}>{movie.title}</p>
                  <div style={styles.cardMeta}>
                    <span style={styles.cardGenre}>{movie.genre}</span>
                    <span style={styles.cardYear}>{movie.year}</span>
                    <span style={styles.cardRating}>★ {movie.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.logoText}>CLOUD<em>CINEMA</em></span>
        <p style={{ fontSize: "0.75rem", color: "#2e2b28" }}>© 2026 · Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .logo-link:hover span { color: #c8a96e !important; }
  .logo-link { transition: opacity 0.2s; text-decoration: none !important; }

  .search-wrap:focus-within {
    border-color: rgba(200,169,110,0.5) !important;
    box-shadow: 0 0 0 3px rgba(200,169,110,0.07) !important;
  }
  .search-input:focus { outline: none; }
  .search-input::placeholder { color: #3a3630; }

  .profile-btn:hover { background: rgba(255,255,255,0.06) !important; }
  .profile-btn { transition: background 0.2s !important; }

  .dropdown { animation: fadeDown 0.18s ease forwards; }
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .dropdown-item:hover { background: rgba(255,255,255,0.05) !important; color: #e8e4dc !important; }
  .dropdown-item { transition: background 0.15s !important; }

  .genre-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .genre-btn { transition: all 0.15s ease !important; }

  .movie-card {
    animation: fadeUp 0.4s ease forwards;
    opacity: 0;
    transform: translateY(16px);
  }
  .movie-card:hover { transform: translateY(-6px) scale(1.02) !important; }
  .movie-card { transition: transform 0.25s ease, box-shadow 0.25s ease !important; }
  .movie-card:hover { box-shadow: 0 20px 50px var(--accent, #fff)25 !important; }

  .poster-overlay { opacity: 0 !important; transition: opacity 0.2s !important; }
  .movie-card:hover .poster-overlay { opacity: 1 !important; }

  .play-btn:hover { background: #c8a96e !important; color: #080810 !important; transform: scale(1.1); }
  .play-btn { transition: all 0.15s !important; }
  .list-btn:hover { background: rgba(255,255,255,0.2) !important; transform: scale(1.1); }
  .list-btn { transition: all 0.15s !important; }

  .banner-play:hover { background: #d4b87a !important; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(200,169,110,0.35) !important; }
  .banner-play { transition: all 0.2s !important; }
  .banner-info:hover { background: rgba(255,255,255,0.12) !important; }
  .banner-info { transition: background 0.2s !important; }

  @keyframes fadeUp {
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
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
    background: "radial-gradient(ellipse 60% 50% at 30% 20%, #c8a96e0d 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 70%, #7b4b9e10 0%, transparent 50%)",
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

  // NAV
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
    gap: "1.5rem",
  },
  logoWrap: { display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", flexShrink: 0 },
  logoIcon: { color: "#c8a96e", fontSize: "1.2rem" },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.1rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#e8e4dc",
  },
  searchWrap: {
    flex: 1,
    maxWidth: "400px",
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "50px",
    padding: "0 1rem",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  searchIcon: { fontSize: "0.85rem", marginRight: "0.5rem", opacity: 0.5 },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#e8e4dc",
    fontSize: "0.875rem",
    padding: "0.6rem 0",
    fontFamily: "'DM Sans', sans-serif",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#5a5650",
    cursor: "pointer",
    fontSize: "0.8rem",
    padding: "0.2rem",
  },
  profileArea: { position: "relative", flexShrink: 0 },
  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "50px",
    padding: "0.4rem 1rem 0.4rem 0.4rem",
    cursor: "pointer",
    color: "#e8e4dc",
  },
  profileAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c8a96e, #8c6e3a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: { fontSize: "0.85rem", fontWeight: 600, color: "#080810" },
  profileName: { fontSize: "0.85rem", color: "#9e9a93" },

  dropdown: {
    position: "absolute",
    top: "calc(100% + 0.5rem)",
    right: 0,
    width: "220px",
    background: "#0f0f1a",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "14px",
    padding: "0.5rem",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    zIndex: 200,
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
  },
  dropdownAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(200,169,110,0.1)",
    border: "1px solid rgba(200,169,110,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dropdownName: { fontSize: "0.875rem", fontWeight: 500 },
  dropdownEmail: { fontSize: "0.72rem", color: "#5a5650" },
  dropdownDivider: { height: "1px", background: "rgba(255,255,255,0.06)", margin: "0.25rem 0" },
  dropdownItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    color: "#9e9a93",
    padding: "0.65rem 0.75rem",
    fontSize: "0.85rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.02em",
  },

  // BANNER
  banner: {
    position: "relative",
    zIndex: 2,
    padding: "4rem 3rem 3rem",
    background: "linear-gradient(to bottom, rgba(200,169,110,0.06) 0%, transparent 100%)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  bannerGlow: {
    position: "absolute",
    top: "-50%",
    right: "10%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, #c8a96e12 0%, transparent 60%)",
    pointerEvents: "none",
  },
  bannerLabel: { fontSize: "0.78rem", color: "#c8a96e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" },
  bannerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(2rem, 4vw, 3.5rem)",
    fontWeight: 700,
    marginBottom: "0.75rem",
    maxWidth: "600px",
  },
  bannerDesc: { color: "#9e9a93", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: "500px", marginBottom: "2rem" },
  bannerActions: { display: "flex", gap: "1rem" },
  bannerPlay: {
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
  bannerInfo: {
    background: "rgba(255,255,255,0.08)",
    color: "#e8e4dc",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    fontSize: "0.9rem",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },

  // FILTER
  filterBar: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    gap: "0.5rem",
    padding: "1.5rem 3rem",
    overflowX: "auto",
    flexWrap: "wrap",
  },
  genreBtn: {
    borderRadius: "50px",
    padding: "0.45rem 1.1rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "'DM Sans', sans-serif",
  },

  // GRID
  gridSection: { position: "relative", zIndex: 2, padding: "0 3rem 4rem" },
  gridTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.4rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  gridCount: { fontSize: "0.78rem", color: "#3a3630", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "1.25rem",
  },
  empty: { textAlign: "center", padding: "4rem", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" },

  card: {
    borderRadius: "12px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer",
  },
  poster: {
    height: "230px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  posterGlow: {
    position: "absolute",
    top: "20%",
    left: "20%",
    width: "60%",
    height: "60%",
    borderRadius: "50%",
    filter: "blur(30px)",
    opacity: 0.3,
  },
  badge: {
    position: "absolute",
    top: "0.6rem",
    left: "0.6rem",
    fontSize: "0.62rem",
    fontWeight: 700,
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    letterSpacing: "0.08em",
    zIndex: 2,
  },
  posterOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    zIndex: 3,
  },
  playBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "2px solid rgba(255,255,255,0.4)",
    color: "#fff",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  listBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { padding: "0.75rem" },
  cardTitle: { fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.4rem", lineHeight: 1.3 },
  cardMeta: { display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" },
  cardGenre: { fontSize: "0.68rem", color: "#5a5650", background: "rgba(255,255,255,0.05)", padding: "0.15rem 0.4rem", borderRadius: "3px" },
  cardYear: { fontSize: "0.68rem", color: "#5a5650" },
  cardRating: { fontSize: "0.72rem", color: "#c8a96e", marginLeft: "auto" },

  footer: {
    position: "relative",
    zIndex: 2,
    padding: "2rem 3rem",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};