// ─────────────────────────────────────────────────────────────────────────
// AFFIRMATIONS DATA
// This is the only file you need to touch to add, remove, or edit content.
//
// To add a category: add an entry to CATEGORIES with a unique `id`.
// To add an affirmation: add an entry to AFFIRMATIONS with a `category`
// that matches one of the CATEGORIES ids. That's it — it'll show up
// automatically in onboarding, home, and settings.
// ─────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: "confidence", label: "Confidence", emoji: "💪", color: "#6C4DFF" },
  { id: "calm", label: "Calm", emoji: "🌊", color: "#00BFA5" },
  { id: "gratitude", label: "Gratitude", emoji: "🌻", color: "#FFB300" },
  { id: "selflove", label: "Self-Love", emoji: "💗", color: "#FF6F91" },
  { id: "success", label: "Success", emoji: "🚀", color: "#448AFF" },
  { id: "resilience", label: "Resilience", emoji: "🔥", color: "#FF7043" },
];

export const AFFIRMATIONS = [
  // confidence
  { id: "c1", category: "confidence", text: "I trust myself to make the right decisions." },
  { id: "c2", category: "confidence", text: "I am worthy of every opportunity that comes my way." },
  { id: "c3", category: "confidence", text: "My voice matters, and I speak up with ease." },
  { id: "c4", category: "confidence", text: "I walk into every room exactly as I am, and that's enough." },
  { id: "c5", category: "confidence", text: "I back myself, even when the outcome is uncertain." },
  { id: "c6", category: "confidence", text: "I am capable of figuring things out as I go." },
  { id: "c7", category: "confidence", text: "Confidence is a practice, and I get better at it every day." },
  { id: "c8", category: "confidence", text: "I don't need permission to take up space." },

  // calm
  { id: "l1", category: "calm", text: "I am allowed to slow down." },
  { id: "l2", category: "calm", text: "This moment is enough. I don't need to rush it." },
  { id: "l3", category: "calm", text: "I release what I cannot control and breathe easy." },
  { id: "l4", category: "calm", text: "Peace is available to me right now, in this breath." },
  { id: "l5", category: "calm", text: "I move through today at a pace that feels good." },
  { id: "l6", category: "calm", text: "My nervous system is learning to trust safety again." },
  { id: "l7", category: "calm", text: "I can be calm and still get everything done." },
  { id: "l8", category: "calm", text: "Stillness is productive too." },

  // gratitude
  { id: "g1", category: "gratitude", text: "I notice the small good things — they add up." },
  { id: "g2", category: "gratitude", text: "There is always something today worth thanking." },
  { id: "g3", category: "gratitude", text: "I am grateful for how far I've already come." },
  { id: "g4", category: "gratitude", text: "Gratitude turns what I have into enough." },
  { id: "g5", category: "gratitude", text: "I appreciate the people who show up for me." },
  { id: "g6", category: "gratitude", text: "Even ordinary days hold something worth savoring." },
  { id: "g7", category: "gratitude", text: "I am thankful for my body and everything it lets me do." },
  { id: "g8", category: "gratitude", text: "I choose to see today as a gift, not a given." },

  // selflove
  { id: "s1", category: "selflove", text: "I am allowed to take care of myself without guilt." },
  { id: "s2", category: "selflove", text: "I speak to myself the way I'd speak to someone I love." },
  { id: "s3", category: "selflove", text: "I am not behind. I am exactly where I need to be." },
  { id: "s4", category: "selflove", text: "My worth was never up for debate." },
  { id: "s5", category: "selflove", text: "I forgive myself for what I didn't know back then." },
  { id: "s6", category: "selflove", text: "I am proud of who I'm becoming." },
  { id: "s7", category: "selflove", text: "Rest is something I deserve, not something I earn." },
  { id: "s8", category: "selflove", text: "I choose progress over perfection, always." },

  // success
  { id: "u1", category: "success", text: "Every small step today moves the bigger picture forward." },
  { id: "u2", category: "success", text: "I am building something real, one day at a time." },
  { id: "u3", category: "success", text: "Growth doesn't always look like winning, and that's okay." },
  { id: "u4", category: "success", text: "I am exactly the kind of person who follows through." },
  { id: "u5", category: "success", text: "My focus today is a gift to my future self." },
  { id: "u6", category: "success", text: "I define success on my own terms." },
  { id: "u7", category: "success", text: "I am capable of learning whatever this next step requires." },
  { id: "u8", category: "success", text: "Momentum starts with one small, doable action." },

  // resilience
  { id: "r1", category: "resilience", text: "I have survived every hard day so far — that's a track record." },
  { id: "r2", category: "resilience", text: "I can be soft and unbreakable at the same time." },
  { id: "r3", category: "resilience", text: "Setbacks are information, not verdicts." },
  { id: "r4", category: "resilience", text: "I keep going, even when it's slow." },
  { id: "r5", category: "resilience", text: "I am stronger than the thing that's testing me today." },
  { id: "r6", category: "resilience", text: "Hard seasons don't last forever, but I do." },
  { id: "r7", category: "resilience", text: "I've made it through 100% of my worst days." },
  { id: "r8", category: "resilience", text: "I get to decide what this moment means about me." },
];
