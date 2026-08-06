import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ArrowUpDown,
  Heart,
  Compass,
  CircleCheck,
} from "lucide-react";
import { CATEGORIES } from "./affirmations.js";

const STEPS = [
  "welcome",
  "feature-swipe",
  "feature-save",
  "feature-explore",
  "benefits",
  "name",
  "categories",
  "ready",
];

const variants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const slideTransition = { duration: 0.28, ease: "easeOut" };

function Slide({ children, dir }) {
  return (
    <motion.div
      custom={dir}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      style={{ display: "flex", flexDirection: "column", flex: 1 }}
    >
      {children}
    </motion.div>
  );
}

function FeatureSlide({ icon, iconBg, title, sub, art }) {
  return (
    <>
      <div className="feature-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <h1 className="onboard-title" style={{ fontSize: 26 }}>
        {title}
      </h1>
      <p className="onboard-sub">{sub}</p>
      {art}
    </>
  );
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [userName, setUserName] = useState("");
  const [direction, setDirection] = useState(1);

  const go = (delta) => {
    setDirection(delta);
    setStep((s) => Math.min(Math.max(s + delta, 0), STEPS.length - 1));
  };

  const toggleCategory = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const finish = () => {
    onComplete({
      cats: selected.length ? selected : CATEGORIES.map((c) => c.id),
      userName: userName.trim(),
    });
  };

  const key = STEPS[step];
  const canContinue = key !== "categories" || selected.length > 0;

  return (
    <div className="screen">
      <div className="onboard-wrap">
        <div className="progress-dots">
          {STEPS.map((s, i) => (
            <div className="dot" key={s}>
              <motion.div
                className="fill"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {key === "welcome" && (
            <Slide key="welcome" dir={direction}>
              <div className="onboard-hero">🌸</div>
              <h1 className="onboard-title">Hey. Let's start your day right.</h1>
              <p className="onboard-sub">
                Bloom sends you small, honest affirmations you can actually
                use. Give us a minute to show you around.
              </p>
            </Slide>
          )}

          {key === "feature-swipe" && (
            <Slide key="feature-swipe" dir={direction}>
              <FeatureSlide
                icon={<ArrowUpDown size={30} color="#fff" />}
                iconBg="#6C4DFF"
                title="Flick through, TikTok-style"
                sub="Swipe up for your next affirmation, down to revisit the last one. It's built for one-handed, no-thinking use."
              />
            </Slide>
          )}

          {key === "feature-save" && (
            <Slide key="feature-save" dir={direction}>
              <FeatureSlide
                icon={<Heart size={28} color="#fff" fill="#fff" />}
                iconBg="#FF6F91"
                title="Heart the ones that hit"
                sub="Tap the heart on any card to save it. Everything you love lives in Settings, ready whenever you need it again."
              />
            </Slide>
          )}

          {key === "feature-explore" && (
            <Slide key="feature-explore" dir={direction}>
              <FeatureSlide
                icon={<Compass size={28} color="#fff" />}
                iconBg="#448AFF"
                title="Explore, whenever you want more"
                sub="The Explore tab pulls in fresh affirmations and quotes so there's always something new when your deck runs dry."
              />
            </Slide>
          )}

          {key === "benefits" && (
            <Slide key="benefits" dir={direction}>
              <div className="onboard-hero">🌤️</div>
              <h1 className="onboard-title" style={{ fontSize: 26 }}>
                What you'll get out of it
              </h1>
              <ul className="benefit-list">
                <li>
                  <CircleCheck size={20} />
                  <span>A calmer, more grounded start to every day</span>
                </li>
                <li>
                  <CircleCheck size={20} />
                  <span>A quick habit that actually sticks — 10 seconds, no pressure</span>
                </li>
                <li>
                  <CircleCheck size={20} />
                  <span>A personal collection of words that are actually yours</span>
                </li>
              </ul>
            </Slide>
          )}

          {key === "name" && (
            <Slide key="name" dir={direction}>
              <div className="onboard-hero">👋</div>
              <h1 className="onboard-title" style={{ fontSize: 26 }}>
                What should we call you?
              </h1>
              <p className="onboard-sub">
                We'll use it to greet you each time you open Bloom. Totally
                optional.
              </p>
              <input
                className="name-input"
                type="text"
                placeholder="Your first name"
                value={userName}
                maxLength={24}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
            </Slide>
          )}

          {key === "categories" && (
            <Slide key="categories" dir={direction}>
              <h1 className="onboard-title" style={{ fontSize: 24 }}>
                What do you want more of?
              </h1>
              <p className="onboard-sub">
                Pick as many as you like. You can always change these later
                in Settings.
              </p>
              <div className="chip-grid">
                {CATEGORIES.map((cat) => {
                  const isSelected = selected.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      className={`cat-chip ${isSelected ? "selected" : ""}`}
                      style={isSelected ? { background: cat.color } : {}}
                      onClick={() => toggleCategory(cat.id)}
                      type="button"
                    >
                      <span className="emoji">{cat.emoji}</span>
                      <span className="label">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </Slide>
          )}

          {key === "ready" && (
            <Slide key="ready" dir={direction}>
              <div className="onboard-hero">✨</div>
              <h1 className="onboard-title">
                {userName.trim() ? `You're all set, ${userName.trim()}.` : "You're all set."}
              </h1>
              <p className="onboard-sub">
                {selected.length
                  ? `We'll surface affirmations from ${selected.length} categor${
                      selected.length === 1 ? "y" : "ies"
                    } you picked, every time you open Bloom.`
                  : "We'll show you a mix from every category to start — you can narrow it down anytime."}
              </p>
            </Slide>
          )}
        </AnimatePresence>

        <div className="onboard-nav">
          {step > 0 && (
            <motion.button
              className="btn tonal"
              type="button"
              onClick={() => go(-1)}
              whileTap={{ scale: 0.92 }}
            >
              <ArrowLeft size={18} />
            </motion.button>
          )}
          {step < STEPS.length - 1 ? (
            <motion.button
              className="btn primary block"
              type="button"
              onClick={() => go(1)}
              disabled={!canContinue}
              whileTap={canContinue ? { scale: 0.97 } : {}}
            >
              Continue <ArrowRight size={18} />
            </motion.button>
          ) : (
            <motion.button
              className="btn primary block"
              type="button"
              onClick={finish}
              whileTap={{ scale: 0.97 }}
            >
              Start my day <Check size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
