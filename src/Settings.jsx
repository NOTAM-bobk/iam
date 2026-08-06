import { Trash2, Sun, Moon, RotateCcw, Download, Share } from "lucide-react";
import { CATEGORIES } from "./affirmations.js";

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone =
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true);

export default function Settings({
  categories,
  setCategories,
  favorites,
  setFavorites,
  theme,
  setTheme,
  name,
  setName,
  canInstall,
  onInstall,
  onResetOnboarding,
}) {
  const toggleCategory = (id) => {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const removeFavorite = (fav) => {
    setFavorites((prev) =>
      prev.filter((f) => !(f.id === fav.id && f.text === fav.text))
    );
  };

  return (
    <div className="screen">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Make Bloom yours.</p>
      </div>

      <div className="scroll-area">
        <div className="settings-section">
          <div className="section-title">Profile</div>
          <div className="settings-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
            <div className="row-label">Your name</div>
            <input
              className="name-input compact"
              type="text"
              placeholder="Add your first name"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="section-title">Get the app</div>
          {canInstall && (
            <button className="btn primary block" type="button" onClick={onInstall}>
              <Download size={17} /> Install Bloom
            </button>
          )}
          {!canInstall && isIOS && !isStandalone && (
            <div className="settings-row">
              <div>
                <div className="row-label">Add to Home Screen</div>
                <div className="row-sub">
                  Tap <Share size={12} style={{ verticalAlign: "-2px" }} /> Share, then
                  "Add to Home Screen"
                </div>
              </div>
            </div>
          )}
          {!canInstall && !isIOS && isStandalone && (
            <div className="settings-row">
              <div className="row-label">✓ Installed</div>
            </div>
          )}
          {!canInstall && !isIOS && !isStandalone && (
            <div className="settings-row">
              <div className="row-sub">
                Look for the install icon in your browser's address bar to add Bloom to your device.
              </div>
            </div>
          )}

          <div className="section-title">Appearance</div>
          <div className="settings-row">
            <div>
              <div className="row-label">Theme</div>
              <div className="row-sub">Light or dark card colors</div>
            </div>
            <div className="segmented">
              <button
                type="button"
                className={theme === "light" ? "active" : ""}
                onClick={() => setTheme("light")}
              >
                <Sun size={14} />
              </button>
              <button
                type="button"
                className={theme === "dark" ? "active" : ""}
                onClick={() => setTheme("dark")}
              >
                <Moon size={14} />
              </button>
            </div>
          </div>

          <div className="section-title">Categories</div>
          <p className="row-sub" style={{ marginBottom: 12 }}>
            Choose what shows up on your Today feed.
          </p>
          <div className="chip-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`chip-toggle ${categories.includes(cat.id) ? "active" : ""}`}
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <div className="section-title">
            Favorites {favorites.length > 0 && `(${favorites.length})`}
          </div>
          {favorites.length === 0 ? (
            <p className="row-sub">
              Tap the heart on any card to save it here.
            </p>
          ) : (
            favorites.map((fav) => (
              <div className="fav-item" key={fav.id + fav.text}>
                <p>{fav.text}</p>
                <button
                  type="button"
                  onClick={() => removeFavorite(fav)}
                  aria-label="Remove favorite"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}

          <div className="section-title">About</div>
          <button className="btn ghost" type="button" onClick={onResetOnboarding}>
            <RotateCcw size={16} /> Redo onboarding
          </button>
        </div>
      </div>
    </div>
  );
}
