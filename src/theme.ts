import {Easing, interpolate, spring} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/InterTight';
import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

export const SANS = loadInter('normal', {weights: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin']}).fontFamily;
export const SERIF = loadSerif('italic', {weights: ['400'], subsets: ['latin']}).fontFamily;
export const MONO = loadMono('normal', {weights: ['400', '500'], subsets: ['latin']}).fontFamily;

export const C = {
  bg: '#0B0B0B',
  panel: '#111111',
  panel2: '#161616',
  line: '#232323',
  ink: '#F2F0EB',
  dim: 'rgba(242,240,235,0.5)',
  faint: 'rgba(242,240,235,0.22)',
  accent: '#FF5B1F',
  raw: '#3A3A3A',
};

export const EASE = Easing.bezier(0.23, 1, 0.32, 1);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);

export const tw = (f: number, a: number, b: number, from = 0, to = 1, easing = EASE) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const sp = (f: number, start: number, stiffness = 400, damping = 30) =>
  spring({frame: f - start, fps: 30, config: {stiffness, damping, mass: 1}});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// characters typed between frames a..b
export const typed = (text: string, f: number, a: number, b: number) => {
  const n = Math.round(tw(f, a, b, 0, text.length, (x) => x));
  return text.slice(0, n);
};
