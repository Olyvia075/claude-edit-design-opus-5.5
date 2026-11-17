import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS, SERIF, MONO, tw, sp, lerp, typed, INOUT} from './theme';

// Entrance: scale .96 -> 1, opacity, blur 8 -> 0 (never from zero)
export const In: React.FC<{f: number; at: number; dur?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, dur = 10, style, children}) => {
  const t = tw(f, at, at + dur);
  return (
    <span style={{display: 'inline-block', opacity: t, transform: `scale(${lerp(0.96, 1, t)})`, filter: `blur(${lerp(8, 0, t)}px)`, ...style}}>
      {children}
    </span>
  );
};

const center: React.CSSProperties = {justifyContent: 'center', alignItems: 'center'};

/* ---------------- OPEN f0-90 ---------------- */
// soft blur-in word (reference style): blur 14 -> 0, rise 14px
const Soft: React.FC<{f: number; at: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, style, children}) => {
  const t = tw(f, at, at + 12);
  return <span style={{display: 'inline-block', opacity: t, filter: `blur(${lerp(14, 0, t)}px)`, transform: `translateY(${lerp(14, 0, t)}px)`, ...style}}>{children}</span>;
};
// exit with ghost trail: copies scale outward and blur away
export const Echo: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => {
  if (t <= 0) return <>{children}</>;
  return (
    <div style={{position: 'relative'}}>
      {[1.18, 1.38].map((sc, i) => (
        <div key={i} style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', transform: `scale(${lerp(1, sc, t)})`, opacity: (1 - t) * (0.35 - i * 0.15), filter: `blur(${4 + t * 10 * (i + 1)}px)`}}>{children}</div>
      ))}
      <div style={{opacity: 1 - t, filter: `blur(${t * 12}px)`}}>{children}</div>
    </div>
  );
};
const GLOW = '0 0 30px rgba(255,255,255,0.18)';
export const Open: React.FC<{f: number}> = ({f}) => {
  const big: React.CSSProperties = {fontFamily: SANS, fontWeight: 700, fontSize: 120, letterSpacing: '-0.045em', color: C.ink, lineHeight: 1, textShadow: GLOW, display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap'};
  if (f < 34) {
    const w = ['you', 'can', 'use', 'claude'];
    return (
      <AbsoluteFill style={center}>
        <Echo t={tw(f, 26, 34)}>
          <div style={big}>{w.map((x, i) => <Soft key={x} f={f} at={i * 4} style={{marginRight: '0.22em'}}>{x}</Soft>)}</div>
        </Echo>
      </AbsoluteFill>
    );
  }
  // word cycling: to [edit / cut / caption / animate / edit] videos.
  const l = f - 32;
  const words = [['edit', 0], ['cut', 14], ['caption', 20], ['animate', 26], ['edit', 32]] as const;
  let idx = 0;
  words.forEach((w, i) => { if (l >= w[1]) idx = i; });
  const since = l - words[idx][1];
  const wt = tw(since, 0, 5);
  const prev = idx > 0 ? words[idx - 1][0] : null;
  const exitT = tw(f, 70, 82);
  return (
    <AbsoluteFill style={center}>
      <Echo t={exitT}>
        <div style={big}>
          <Soft f={l} at={0} style={{marginRight: '0.22em'}}>to</Soft>
          <span style={{position: 'relative', display: 'inline-block', marginRight: '0.2em', textAlign: 'center'}}>
            {prev && wt < 1 && (
              <span style={{position: 'absolute', left: 0, right: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 150, color: C.accent, opacity: 1 - wt, filter: `blur(${wt * 10}px)`, transform: `translateY(${-wt * 40}px)`}}>{prev}</span>
            )}
            <span style={{display: 'inline-block', fontFamily: SERIF, fontWeight: 400, fontSize: 150, color: C.accent, letterSpacing: '-0.01em', textShadow: '0 0 40px rgba(255,91,31,0.45)', opacity: idx === 0 ? tw(l, 3, 15) : wt, filter: `blur(${(1 - (idx === 0 ? tw(l, 3, 15) : wt)) * 10}px)`, transform: `translateY(${(1 - (idx === 0 ? tw(l, 3, 15) : wt)) * 40}px)`}}>
              {words[idx][0]}
            </span>
          </span>
          <Soft f={l} at={6}>videos.</Soft>
        </div>
      </Echo>
    </AbsoluteFill>
  );
};

/* ---------------- BACKGROUND + LIGHT ---------------- */
export const Background: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 45%, #1a120d 0%, #0c0a09 55%, #050505 100%)'}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(242,240,235,0.07) 1.2px, transparent 1.4px)', backgroundSize: '26px 26px', backgroundPosition: `${(f * 0.3) % 26}px 0`, maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 85%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 85%)'}} />
    <div style={{position: 'absolute', left: '50%', top: '62%', width: 1400, height: 500, marginLeft: -700, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,91,31,0.10), transparent 70%)', filter: 'blur(20px)'}} />
  </AbsoluteFill>
);
export const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none'}} />;
export const LightSweep: React.FC<{f: number; a: number; b: number}> = ({f, a, b}) => {
  if (f < a || f > b) return null;
  const t = tw(f, a, b, 0, 1, INOUT);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: -300, left: lerp(-900, 2100, t), width: 520, height: 1700, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,170,120,0.22), rgba(255,240,230,0.35), rgba(255,170,120,0.22), transparent)', filter: 'blur(30px)', opacity: Math.sin(Math.PI * t)}} />
    </AbsoluteFill>
  );
};

/* ---------------- PUNCHES (30 frames each) ---------------- */
export const PunchCut: React.FC<{f: number}> = ({f}) => {
  const line = tw(f, 0, 8);
  const s = sp(f, 15);
  const exit = tw(f, 24, 30, 0, 1, INOUT);
  const word: React.CSSProperties = {position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 560, letterSpacing: '-0.06em', color: C.ink, lineHeight: 1};
  // diagonal from (0, 70%) to (100%, 30%)
  const top = 'polygon(0 0, 100% 0, 100% 30%, 0 70%)';
  const bot = 'polygon(0 70%, 100% 30%, 100% 100%, 0 100%)';
  const dx = s * 40 + exit * 1400;
  const dy = s * 26 + exit * 300;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{...word, clipPath: top, transform: `translate(${-dx}px, ${-dy}px)`}}>CUT.</div>
      <div style={{...word, clipPath: bot, transform: `translate(${dx}px, ${dy}px)`}}>CUT.</div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 1 - exit}}>
        <line x1={0} y1={756} x2={1920 * line} y2={756 - 432 * line} stroke={C.accent} strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};

export const PunchCaptions: React.FC<{f: number}> = ({f}) => {
  const move = sp(f, 15);
  const capW = 680;
  const tionsW = 1020;
  const boxX = lerp(0, capW, move);
  const boxW = lerp(capW, tionsW, move);
  const st: React.CSSProperties = {fontFamily: SANS, fontWeight: 900, fontSize: 300, letterSpacing: '-0.05em', lineHeight: 1, display: 'inline-block', textAlign: 'center'};
  const t = tw(f, 0, 8);
  return (
    <AbsoluteFill style={center}>
      <div style={{position: 'relative', display: 'flex', opacity: t, transform: `scale(${lerp(0.96, 1, t)})`}}>
        <div style={{position: 'absolute', left: boxX, width: boxW, top: 10, bottom: -10, background: C.accent, borderRadius: 18}} />
        <span style={{...st, width: capW, position: 'relative', color: move < 0.5 ? C.bg : C.ink}}>CAP</span>
        <span style={{...st, width: tionsW, position: 'relative', color: move >= 0.5 ? C.bg : C.ink}}>TIONS</span>
      </div>
    </AbsoluteFill>
  );
};

export const PunchPresets: React.FC<{f: number}> = ({f}) => {
  const g = f >= 22 ? f - 22 : -1;
  const bands = [0, 1, 2, 3, 4, 5];
  const content = (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 40}}>
      <In f={f} at={0} style={{fontFamily: SANS, fontWeight: 900, fontSize: 480, letterSpacing: '-0.06em', color: C.ink, lineHeight: 1}}>NO</In>
      <In f={f} at={4} style={{fontFamily: SERIF, fontSize: 300, color: C.accent, lineHeight: 1}}>presets.</In>
    </div>
  );
  if (g < 0) return <AbsoluteFill style={center}>{content}</AbsoluteFill>;
  // glitch exit: horizontal bands shifted, fading
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {bands.map((b) => {
        const off = ((b * 73 + g * 131) % 200) - 100;
        return (
          <AbsoluteFill key={b} style={{...center, background: 'transparent', clipPath: `inset(${(b / 6) * 100}% 0 ${100 - ((b + 1) / 6) * 100}% 0)`, transform: `translateX(${off * (g / 4)}px)`, opacity: 1 - g / 8}}>
            {content}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- LOCKUP (local frame 0 = global 790) ---------------- */
const XLogo: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path fill={C.ink} d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
export const Lockup: React.FC<{f: number}> = ({f}) => {
  const sweep = tw(f, 0, 28, 0, 1, INOUT);
  const lineX = lerp(96, 1824, sweep);
  const lineFade = tw(f, 28, 40);
  const h = tw(f, 34, 48);
  const settle = tw(f, 0, 104, 0, 1, (x) => x);
  const big: React.CSSProperties = {fontFamily: SANS, fontWeight: 900, fontSize: 270, letterSpacing: '-0.055em', lineHeight: 0.86, color: C.ink, textShadow: '0 0 60px rgba(255,255,255,0.12)'};
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 96, top: 230, width: 1824, clipPath: `inset(0 ${1920 - lineX}px 0 0)`, transform: `scale(${lerp(1, 1.025, settle)})`, transformOrigin: '0% 50%'}}>
        <div style={big}>EDIT</div>
        <div style={big}>
          WITH <span style={{fontFamily: SERIF, fontWeight: 400, color: C.accent, letterSpacing: '-0.02em', fontSize: 300, textShadow: '0 0 60px rgba(255,91,31,0.45)'}}>Claude</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: lineX, top: 0, width: 3, height: 1080, background: C.accent, boxShadow: `0 0 30px ${C.accent}`, opacity: 1 - lineFade}} />
      <div style={{position: 'absolute', left: 104, top: 790, display: 'flex', alignItems: 'center', gap: 18, opacity: h, filter: `blur(${(1 - h) * 10}px)`, transform: `translateY(${lerp(12, 0, h)}px)`, fontFamily: SANS, fontWeight: 600, fontSize: 40, letterSpacing: '-0.02em', color: C.ink}}>
        <XLogo size={36} />
        <span>@Olyvia_Tweets</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- OVERLAYS ---------------- */
export const Overlays: React.FC<{f: number; tag: string}> = ({f, tag}) => {
  const s = Math.floor(f / 30);
  const fr = f % 30;
  const pad = (n: number) => String(n).padStart(2, '0');
  const cross = (x: number, y: number) => (
    <g key={`${x}-${y}`} stroke={C.faint} strokeWidth={1.5}>
      <line x1={x - 9} y1={y} x2={x + 9} y2={y} />
      <line x1={x} y1={y - 9} x2={x} y2={y + 9} />
    </g>
  );
  const seed = Math.floor(f / 2);
  const end = f >= 894;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'screen'}}>
        <filter id={`n${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#n${seed})`} />
      </svg>
      {!end && (
        <>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {[cross(40, 40), cross(1880, 40), cross(40, 1040), cross(1880, 1040)]}
          </svg>
          <div style={{position: 'absolute', top: 30, right: 70, fontFamily: MONO, fontSize: 13, letterSpacing: '0.1em', color: C.dim}}>
            {f >= 870 ? '00:00:30:00' : `00:00:${pad(s)}:${pad(fr)}`}
          </div>
          <div style={{position: 'absolute', bottom: 30, left: 70, fontFamily: MONO, fontSize: 13, letterSpacing: '0.12em', color: C.dim}}>{tag}</div>
        </>
      )}
    </AbsoluteFill>
  );
};
