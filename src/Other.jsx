import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Share2 } from "lucide-react";

// Free, no-key APIs so "Explore" always has fresh, non-curated content
// on top of the hand-picked deck on the Today tab.
//
// NOTE on CORS / keys:
// - zenquotes.io only sends Access-Control-Allow-Origin on paid plans, so a
//   direct browser fetch can get blocked by CORS depending on your origin.
//   If that happens, route it through your own tiny proxy/serverless
//   function instead of calling it straight from the client.
// - quote-garden.onrender.com is hosted on Render's free tier, so the very
//   first request after it's been idle can take several seconds to "wake up."
// - APIRobots' Affirmations API (apirobots.pro) requires a paid subscription
//   key. It's wired up below but disabled until you add your own key.
const SOURCES = {
  affirmations: {
    label: "Affirmations",
    emoji: "🌤️",
    blurb: "Gentle daily affirmations",
    fetcher: async () => {
      const res = await fetch("https://www.affirmations.dev/");
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.affirmation, author: null };
    },
  },
  quotes: {
    label: "Quotes",
    emoji: "💬",
    blurb: "A broad mix of quotes",
    fetcher: async () => {
      const res = await fetch("https://dummyjson.com/quotes/random");
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.quote, author: data.author };
    },
  },
  zenquotes: {
    label: "Zen Quotes",
    emoji: "🧘",
    blurb: "Calm, curated wisdom",
    fetcher: async () => {
      const res = await fetch("https://zenquotes.io/api/random");
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      const first = Array.isArray(data) ? data[0] : data;
      return { text: first.q, author: first.a };
    },
  },
  quotegarden: {
    label: "Quote Garden",
    emoji: "📖",
    blurb: "75,000+ quotes to dig through",
    fetcher: async () => {
      const res = await fetch("https://quote-garden.onrender.com/api/v3/quotes/random");
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      const first = data?.data?.[0];
      if (!first) throw new Error("network");
      return { text: first.quoteText, author: first.quoteAuthor };
    },
  },
  advice: {
    label: "Advice",
    emoji: "🎯",
    blurb: "Random slips of advice",
    fetcher: async () => {
      const res = await fetch("https://api.adviceslip.com/advice");
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.slip.advice, author: null };
    },
  },
  kanye: {
    label: "Kanye",
    emoji: "🎤",
    blurb: "Unfiltered Kanye West quotes",
    fetcher: async () => {
      const res = await fetch("https://api.kanye.rest/");
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.quote, author: "Kanye West" };
    },
  },
  chucknorris: {
    label: "Chuck Norris",
    emoji: "🥋",
    blurb: "Chuck Norris facts & jokes",
    fetcher: async () => {
      const res = await fetch("https://api.chucknorris.io/jokes/random");
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.value, author: null };
    },
  },
  dadjokes: {
    label: "Dad Jokes",
    emoji: "😂",
    blurb: "Wholesome, groan-worthy jokes",
    fetcher: async () => {
      const res = await fetch("https://icanhazdadjoke.com/", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.joke, author: null };
    },
  },
  affirmationsPro: {
    label: "Affirmations+",
    emoji: "✨",
    blurb: "Category-tuned affirmations (needs a key)",
    fetcher: async () => {
      // Requires a paid APIRobots subscription key — see apirobots.pro/apis/new-affirmations-api/
      const API_KEY = ""; // <-- add your APIRobots key here
      if (!API_KEY) throw new Error("missing-key");
      const res = await fetch("https://apirobots.pro/v1/affirmations/random", {
        headers: { "X-Api-Key": API_KEY },
      });
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.text, author: null };
    },
  },
};

const INITIAL_BATCH = 3;
const LOAD_MORE_BATCH = 2;
const LOAD_MORE_THRESHOLD_PX = 600;

// Fetches `count` items from a source, tolerating individual failures.
async function fetchBatch(key, count) {
  const results = await Promise.allSettled(
    Array.from({ length: count }, () => SOURCES[key].fetcher())
  );
  return results
    .filter((r) => r.status === "fulfilled")
    .map((r, i) => ({
      id: `${key}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      category: key,
      text: r.value.text,
      author: r.value.author,
    }));
}

function CategoryGrid({ onSelect }) {
  return (
    <div className="explore-wrap">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {Object.entries(SOURCES).map(([key, s]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 6,
              textAlign: "left",
              background: "rgba(28,27,31,0.06)",
              border: "none",
              borderRadius: 20,
              padding: "18px 16px",
              cursor: "pointer",
              minHeight: 108,
            }}
          >
            <span style={{ fontSize: 28, lineHeight: 1 }}>{s.emoji}</span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{s.label}</span>
            <span style={{ fontSize: 12, opacity: 0.65 }}>{s.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FeedItem({ item, isFavorited, toggleFavorite, shareAffirmation }) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        scrollSnapAlign: "start",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <p className="aff-text" style={{ fontSize: 22 }}>
          {item.text}
        </p>
        {item.author && <p className="author">— {item.author}</p>}
      </div>

      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: "18%",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <button
          className={`pill-btn ${isFavorited(item) ? "liked" : ""}`}
          type="button"
          onClick={() => toggleFavorite(item)}
          aria-label="Save"
          style={{ background: "rgba(28,27,31,0.08)" }}
        >
          <Heart size={20} fill={isFavorited(item) ? "#ff2d55" : "none"} />
        </button>
        <button
          className="pill-btn"
          type="button"
          onClick={() => shareAffirmation(item.text)}
          aria-label="Share"
          style={{ background: "rgba(28,27,31,0.08)" }}
        >
          <Share2 size={19} />
        </button>
      </div>
    </div>
  );
}

function CategoryFeed({ categoryKey, onClose, isFavorited, toggleFavorite, shareAffirmation }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setItems([]);
    (async () => {
      const batch = await fetchBatch(categoryKey, INITIAL_BATCH);
      if (cancelled) return;
      if (batch.length === 0) {
        setErrorMsg(
          SOURCES[categoryKey].fetcher.toString().includes("missing-key")
            ? "This category needs an API key. Add yours in Other.jsx (SOURCES.affirmationsPro)."
            : "Couldn't reach that one. Check your connection and try again."
        );
        setStatus("error");
        return;
      }
      setItems(batch);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const batch = await fetchBatch(categoryKey, LOAD_MORE_BATCH);
    setItems((prev) => [...prev, ...batch]);
    setLoadingMore(false);
  }, [categoryKey, loadingMore]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < LOAD_MORE_THRESHOLD_PX) {
      loadMore();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg, #fff)",
        zIndex: 50,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Back"
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 51,
          background: "rgba(28,27,31,0.5)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={20} />
      </button>

      {status === "loading" && (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" />
        </div>
      )}

      {status === "error" && (
        <div
          className="error-box"
          style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
        >
          <p>{errorMsg}</p>
          <button
            className="btn tonal"
            type="button"
            style={{ marginTop: 12 }}
            onClick={() => {
              setStatus("loading");
              fetchBatch(categoryKey, INITIAL_BATCH).then((batch) => {
                if (batch.length === 0) {
                  setStatus("error");
                } else {
                  setItems(batch);
                  setStatus("ready");
                }
              });
            }}
          >
            Retry
          </button>
        </div>
      )}

      {status === "ready" && (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            height: "100%",
            overflowY: "auto",
            scrollSnapType: "y mandatory",
          }}
        >
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ height: "100%" }}
              >
                <FeedItem
                  item={item}
                  isFavorited={isFavorited}
                  toggleFavorite={toggleFavorite}
                  shareAffirmation={shareAffirmation}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {loadingMore && (
            <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="spinner" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Other({ isFavorited, toggleFavorite, shareAffirmation }) {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div className="screen">
      <div className="page-header">
        <h1>Explore</h1>
        <p>Fresh finds from around the web, beyond your daily picks.</p>
      </div>

      <CategoryGrid onSelect={setActiveCategory} />

      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CategoryFeed
              categoryKey={activeCategory}
              onClose={() => setActiveCategory(null)}
              isFavorited={isFavorited}
              toggleFavorite={toggleFavorite}
              shareAffirmation={shareAffirmation}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
