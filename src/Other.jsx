import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Shuffle } from "lucide-react";

// Two free, no-key APIs so "Explore" always has fresh, non-curated content
// on top of the hand-picked deck on the Today tab.
const SOURCES = {
  affirmations: {
    label: "Affirmations",
    emoji: "🌤️",
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
    fetcher: async () => {
      const res = await fetch("https://dummyjson.com/quotes/random");
      if (!res.ok) throw new Error("network");
      const data = await res.json();
      return { text: data.quote, author: data.author };
    },
  },
};

export default function Other({ isFavorited, toggleFavorite, shareAffirmation }) {
  const [source, setSource] = useState("affirmations");
  const [current, setCurrent] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  const fetchOne = useCallback(async (key) => {
    setStatus("loading");
    try {
      const result = await SOURCES[key].fetcher();
      setCurrent({
        id: `${key}-${Date.now()}`,
        category: key,
        text: result.text,
        author: result.author,
      });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchOne(source);
  }, [source, fetchOne]);

  return (
    <div className="screen">
      <div className="page-header">
        <h1>Explore</h1>
        <p>Fresh finds from around the web, beyond your daily picks.</p>
      </div>

      <div className="explore-wrap">
        <div className="source-toggle">
          {Object.entries(SOURCES).map(([key, s]) => (
            <button
              key={key}
              type="button"
              className={`chip-toggle ${source === key ? "active" : ""}`}
              onClick={() => setSource(key)}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        <div className="explore-card-holder">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <div className="spinner" />
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="error-box"
              >
                <p>Couldn't reach that one. Check your connection and try again.</p>
                <button
                  className="btn tonal"
                  type="button"
                  style={{ marginTop: 12 }}
                  onClick={() => fetchOne(source)}
                >
                  Retry
                </button>
              </motion.div>
            )}

            {status === "ready" && current && (
              <motion.div
                key={current.id}
                className="explore-card"
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div>
                  <p className="aff-text">{current.text}</p>
                  {current.author && <p className="author">— {current.author}</p>}
                </div>
                <div className="card-actions">
                  <button
                    className={`pill-btn ${isFavorited(current) ? "liked" : ""}`}
                    type="button"
                    onClick={() => toggleFavorite(current)}
                    aria-label="Save"
                    style={{ background: "rgba(28,27,31,0.08)" }}
                  >
                    <Heart size={20} fill={isFavorited(current) ? "#ff2d55" : "none"} />
                  </button>
                  <button
                    className="pill-btn"
                    type="button"
                    onClick={() => shareAffirmation(current.text)}
                    aria-label="Share"
                    style={{ background: "rgba(28,27,31,0.08)" }}
                  >
                    <Share2 size={19} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          className="btn primary block"
          type="button"
          onClick={() => fetchOne(source)}
          style={{ marginTop: 18 }}
          disabled={status === "loading"}
        >
          <Shuffle size={18} /> Show me another
        </button>
      </div>
    </div>
  );
}
