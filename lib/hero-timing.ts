// Shared timing for the homepage hero's intro sequence, so the header can
// sync its own reveal to the same moment the hero's left content appears.
export const DIALOGUE_FADE_IN = 800
export const DIALOGUE_HOLD = 1300
export const DIALOGUE_FADE_OUT = 700
export const DIALOGUE_VISIBLE_UNTIL = DIALOGUE_FADE_IN + DIALOGUE_HOLD
export const LEFT_TEXT_START = DIALOGUE_VISIBLE_UNTIL + DIALOGUE_FADE_OUT

// Set once the intro has played in this browser session, so navigating back
// to "/" doesn't replay the center dialogue every time.
export const HERO_INTRO_SEEN_KEY = "bv-hero-intro-seen"
