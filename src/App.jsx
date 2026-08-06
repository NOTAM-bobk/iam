import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Sparkles, Compass, Settings2 } from "lucide-react";
import Onboarding from "./Onboarding.jsx";
import Other from "./Other.jsx";
import Settings from "./Settings.jsx";
import { AFFIRMATIONS, CATEGORIES } from "./affirmations.js";

const LS_KEYS = {
  onboarded: "bloom_onboarded",
  categories: "bloom_categories",
  favorites: "bloom_favorites",
  theme: "bloom_theme",
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [onboarded, setOnboarded] = useState(() =>
    loadJSON(LS_KEYS.onboarded, false)
  );
  const [categories, setCategories] = useState(() =>
    loadJSON(LS_KEYS.categories, CATEGORIES.map((c) => c.id))
  );
  const [favorites, setFavorites] = useState(() =>
    loadJSON(LS_KEYS.favorites, [])
  );
  const [theme, setTheme] = useState(() => loadJSON(LS_KEYS.theme, "light"));
  const [view, setView] = useState("home");
  const [deck, setDeck] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.onboarded, JSON.stringify(onboarded));
  }, [onboarded]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.categories, JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.theme, JSON.stringify(theme));
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Build (and reshuffle) the deck whenever selected categories change
  useEffect(() => {
    const pool = AFFIRMATIONS.filter((a) => categories.includes(a.category));
    setDeck(shuffle(pool.length ? pool : AFFIRMATIONS));
  }, [categories]);

  const catById = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((c) => (map[c.id] = c));
    return map;
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 1800);
  };

  const isFavorited = (item) =>
    favorites.some((f) => f.id === item.id && f.text === item.text);

  const toggleFavorite = (item) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id && f.text === item.text);
      if (exists) {
        return prev.filter((f) => !(f.id === item.id && f.text === item.text));
      }
      return [{ ...item, savedAt: Date.now() }, ...prev];
    });
  };

  const shareAffirmation = async (text) => {
    const shareData = { title: "Bloom", text: `"${text}" 🌸` };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        showToast("Copied to clipboard");
      }
    } catch {
      // user cancelled share — do nothing
    }
  };

  const advanceDeck = () => {
    setDeck((d) => (d.length > 1 ? [...d.slice(1), d[0]] : d));
  };

  if (!onboarded) {
    return (
      <div className="app-shell">
        <div className="ambient-blob b1" />
        <div className="ambient-blob b2" />
        <Onboarding
          onComplete={(cats) => {
            setCategories(cats);
            setOnboarded(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient-blob b1" />
      <div className="ambient-blob b2" />

      {view === "home" && (
        <HomeView
          deck={deck}
          catById={catById}
          isFavorited={isFavorited}
          toggleFavorite={(item) => {
            toggleFavorite(item);
            showToast(isFavorited(item) ? "Removed from favorites" : "Saved to favorites");
          }}
          shareAffirmation={shareAffirmation}
          advanceDeck={advanceDeck}
        />
      )}
      {view === "other" && (
        <Other
          isFavorited={isFavorited}
          toggleFavorite={(item) => {
            toggleFavorite(item);
            showToast(isFavorited(item) ? "Removed from favorites" : "Saved to favorites");
          }}
          shareAffirmation={shareAffirmation}
        />
      )}
      {view === "settings" && (
        <Settings
          categories={categories}
          setCategories={setCategories}
          favorites={favorites}
          setFavorites={setFavorites}
          theme={theme}
          setTheme={setTheme}
          onResetOnboarding={() => {
            setOnboarded(false);
            setView("home");
          }}
        />
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bottom-nav">
        <NavItem
          active={view === "home"}
          label="Today"
          icon={<Sparkles size={20} />}
          onClick={() => setView("home")}
        />
        <NavItem
          active={view === "other"}
          label="Explore"
          icon={<Compass size={20} />}
          onClick={() => setView("other")}
        />
        <NavItem
          active={view === "settings"}
          label="Settings"
          icon={<Settings2 size={20} />}
          onClick={() => setView("settings")}
        />
      </nav>
    </div>
  );
}

function NavItem({ active, label, icon, onClick }) {
  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      type="button"
      onClick={onClick}
    >
      {active && <motion.span className="nav-pill" layoutId="nav-pill" />}
      {icon}
      {label}
    </button>
  );
}

function HomeView({ deck, catById, isFavorited, toggleFavorite, shareAffirmation, advanceDeck }) {
  const visible = deck.slice(0, 3);

  return (
    <div className="screen">
      <div className="topbar">
        <div className="brand">
          <span className="dot" />
          Bloom
        </div>
      </div>

      <div className="stack-wrap">
        {visible.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">🌱</span>
            Pick a category in Settings to see affirmations here.
          </div>
        ) : (
          <div className="card-stack">
            <AnimatePresence initial={false}>
              {visible.map((item, i) => (
                <Card
                  key={item.id + item.text}
                  item={item}
                  index={i}
                  cat={catById[item.category]}
                  isTop={i === 0}
                  favorited={isFavorited(item)}
                  onSwiped={advanceDeck}
                  onLike={() => toggleFavorite(item)}
                  onShare={() => shareAffirmation(item.text)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      {visible.length > 0 && (
        <p className="swipe-hint">Swipe the card for your next affirmation</p>
      )}
    </div>
  );
}

function Card({ item, index, cat, isTop, favorited, onSwiped, onLike, onShare }) {
  const bg = cat ? cat.color : "#6C4DFF";
  const [exitDir, setExitDir] = useState(1);

  return (
    <motion.div
      className="aff-card"
      style={{
        background: `linear-gradient(155deg, ${bg}E6, ${bg})`,
        color: "#fff",
        zIndex: 10 - index,
      }}
      initial={{ scale: 1 - index * 0.05, y: index * 12, opacity: index === 0 ? 1 : 0.9 }}
      animate={{ scale: 1 - index * 0.05, y: index * 12, opacity: index < 3 ? 1 : 0 }}
      exit={{ x: 420 * exitDir, opacity: 0, rotate: 18 * exitDir, transition: { duration: 0.35 } }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      whileDrag={{ scale: 1.02 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 110) {
          setExitDir(info.offset.x > 0 ? 1 : -1);
          onSwiped();
        }
      }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <span className="chip" style={{ color: "#1c1b1f" }}>
        {cat ? `${cat.emoji} ${cat.label}` : "Affirmation"}
      </span>
      <p className="aff-text">{item.text}</p>
      <div className="card-footer">
        <div className="card-actions">
          <button
            className={`pill-btn ${favorited ? "liked" : ""}`}
            type="button"
            onClick={onLike}
            aria-label="Save affirmation"
          >
            <Heart size={20} fill={favorited ? "#ff2d55" : "none"} />
          </button>
          <button
            className="pill-btn"
            type="button"
            onClick={onShare}
            aria-label="Share affirmation"
          >
            <Share2 size={19} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
