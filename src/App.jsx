import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Sparkles, Compass, Settings2, ChevronUp } from "lucide-react";
import Onboarding from "./Onboarding.jsx";
import Other from "./Other.jsx";
import Settings from "./Settings.jsx";
import { AFFIRMATIONS, CATEGORIES } from "./affirmations.js";

const LS_KEYS = {
  onboarded: "bloom_onboarded",
  categories: "bloom_categories",
  favorites: "bloom_favorites",
  theme: "bloom_theme",
  name: "bloom_name",
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

function vibrate(ms) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // unsupported — ignore
  }
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
  const [name, setName] = useState(() => loadJSON(LS_KEYS.name, ""));
  const [view, setView] = useState("home");
  const [deck, setDeck] = useState([]);
  const [toast, setToast] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

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
  useEffect(() => {
    localStorage.setItem(LS_KEYS.name, JSON.stringify(name));
  }, [name]);

  // Capture the browser's install prompt so Settings can trigger it on demand.
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

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
    showToast._t = window.setTimeout(() => setToast(null), 1600);
  };

  const isFavorited = (item) =>
    favorites.some((f) => f.id === item.id && f.text === item.text);

  const toggleFavorite = (item) => {
    const wasFavorited = isFavorited(item);
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id && f.text === item.text);
      if (exists) {
        return prev.filter((f) => !(f.id === item.id && f.text === item.text));
      }
      return [{ ...item, savedAt: Date.now() }, ...prev];
    });
    vibrate(wasFavorited ? 10 : [12, 30, 12]);
    showToast(wasFavorited ? "Removed from favorites" : "Saved to favorites");
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

  const goBackDeck = () => {
    setDeck((d) => {
      if (d.length < 2) return d;
      const last = d[d.length - 1];
      return [last, ...d.slice(0, -1)];
    });
  };

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (!onboarded) {
    return (
      <div className="app-shell">
        <div className="ambient-blob b1" />
        <div className="ambient-blob b2" />
        <Onboarding
          onComplete={({ cats, userName }) => {
            setCategories(cats);
            setName(userName);
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
          name={name}
          isFavorited={isFavorited}
          toggleFavorite={toggleFavorite}
          shareAffirmation={shareAffirmation}
          advanceDeck={advanceDeck}
          goBackDeck={goBackDeck}
        />
      )}
      {view === "other" && (
        <Other
          isFavorited={isFavorited}
          toggleFavorite={toggleFavorite}
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
          name={name}
          setName={setName}
          canInstall={Boolean(deferredPrompt)}
          onInstall={triggerInstall}
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
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
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
    <motion.button
      className={`nav-item ${active ? "active" : ""}`}
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
    >
      {active && (
        <motion.span
          className="nav-pill"
          layoutId="nav-pill"
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        />
      )}
      <motion.span
        animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ display: "flex" }}
      >
        {icon}
      </motion.span>
      {label}
    </motion.button>
  );
}

function HomeView({
  deck,
  catById,
  name,
  isFavorited,
  toggleFavorite,
  shareAffirmation,
  advanceDeck,
  goBackDeck,
}) {
  const visible = deck.slice(0, 3);
  const firstName = name ? name.split(" ")[0] : "";

  return (
    <div className="screen">
      <div className="topbar">
        <div className="brand">
          <span className="dot" />
          Bloom
        </div>
      </div>
      {firstName && (
        <p className="greeting">
          Good to see you, <strong>{firstName}</strong> 🌸
        </p>
      )}

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
                  onSwipeUp={advanceDeck}
                  onSwipeDown={goBackDeck}
                  onLike={() => toggleFavorite(item)}
                  onShare={() => shareAffirmation(item.text)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      {visible.length > 0 && <SwipeHint />}
    </div>
  );
}

function SwipeHint() {
  return (
    <div className="swipe-hint">
      <motion.span
        className="hint-chevrons"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronUp size={14} />
      </motion.span>
      Flick up for the next one, down to go back
    </div>
  );
}

function Card({ item, index, cat, isTop, favorited, onSwipeUp, onSwipeDown, onLike, onShare }) {
  const bg = cat ? cat.color : "#6C4DFF";
  const [exitDir, setExitDir] = useState(-1);
  const [burst, setBurst] = useState(0);

  const handleLike = () => {
    if (!favorited) setBurst((b) => b + 1);
    onLike();
  };

  return (
    <motion.div
      className="aff-card"
      style={{
        background: `linear-gradient(155deg, ${bg}E6, ${bg})`,
        color: "#fff",
        zIndex: 10 - index,
        pointerEvents: isTop ? "auto" : "none",
      }}
      initial={{ scale: 1 - index * 0.05, y: index * 14, opacity: index === 0 ? 1 : 0.9 }}
      animate={{ scale: 1 - index * 0.05, y: index * 14, opacity: index < 3 ? 1 : 0 }}
      exit={{
        y: 460 * exitDir,
        opacity: 0,
        scale: 0.92,
        transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
      }}
      drag={isTop ? "y" : false}
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.55}
      dragTransition={{ bounceStiffness: 420, bounceDamping: 26 }}
      whileDrag={{ scale: 1.03, boxShadow: "0 26px 60px rgba(0,0,0,0.35)" }}
      onDragEnd={(_, info) => {
        const swipedUp = info.offset.y < -90 || info.velocity.y < -600;
        const swipedDown = info.offset.y > 90 || info.velocity.y > 600;
        if (swipedUp) {
          setExitDir(-1);
          vibrate(10);
          onSwipeUp();
        } else if (swipedDown) {
          setExitDir(1);
          vibrate(10);
          onSwipeDown();
        }
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="card-content">
        <span className="chip" style={{ color: "#1c1b1f" }}>
          {cat ? `${cat.emoji} ${cat.label}` : "Affirmation"}
        </span>
        <p className="aff-text">{item.text}</p>
      </div>

      <div className="action-rail">
        <motion.button
          className={`rail-btn ${favorited ? "liked" : ""}`}
          type="button"
          onClick={handleLike}
          aria-label="Save affirmation"
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.06 }}
        >
          <Heart size={22} fill={favorited ? "#ff2d55" : "none"} />
        </motion.button>
        <motion.button
          className="rail-btn"
          type="button"
          onClick={onShare}
          aria-label="Share affirmation"
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.06 }}
        >
          <Share2 size={20} />
        </motion.button>

        <AnimatePresence>
          {burst > 0 && (
            <motion.span
              key={burst}
              className="heart-burst"
              initial={{ opacity: 1, scale: 0.4, y: 0 }}
              animate={{ opacity: 0, scale: 1.6, y: -46 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              💗
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
