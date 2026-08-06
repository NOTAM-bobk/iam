import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { CATEGORIES } from "./affirmations.js";

const STEPS = ["welcome", "categories", "ready"];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
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
    onComplete(selected.length ? selected : CATEGORIES.map((c) => c.id));
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

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
          {step === 0 && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
              <div className="onboard-hero">🌸</div>
              <h1 className="onboard-title">Hey. Let's start your day right.</h1>
              <p className="onboard-sub">
                Bloom sends you small, honest affirmations you can actually
                use — swipe through them, save your favorites, and make the
                habit yours.
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="categories"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
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
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="ready"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
              <div className="onboard-hero">✨</div>
              <h1 className="onboard-title">You're all set.</h1>
              <p className="onboard-sub">
                {selected.length
                  ? `We'll surface affirmations from ${selected.length} categor${
                      selected.length === 1 ? "y" : "ies"
                    } you picked, every time you open Bloom.`
                  : "We'll show you a mix from every category to start — you can narrow it down anytime."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="onboard-nav">
          {step > 0 && (
            <button className="btn tonal" type="button" onClick={() => go(-1)}>
              <ArrowLeft size={18} />
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              className="btn primary block"
              type="button"
              onClick={() => go(1)}
              disabled={step === 1 && selected.length === 0}
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn primary block" type="button" onClick={finish}>
              Start my day <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
