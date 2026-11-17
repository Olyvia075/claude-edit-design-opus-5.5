import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, SANS, SERIF, MONO, tw, sp, lerp, typed, INOUT, EASE} from './theme';

/* ================= LAYOUT (UI space = 1920x1080) ================= */
const CHAT = {x: 24, y: 24, w: 560, h: 1032};
const MON = {x: 608, y: 24, w: 1288, h: 616};
const TL = {x: 608, y: 664, w: 1288, h: 392};
const X0 = 696; // track content start
const TRACK_W = 1180;
const TRACK_Y = {V2: 712, V1: 798, C1: 884, A1: 970};
const TRACK_H = 74;
const PV = {x: MON.x + (MON.w - 960) / 2, y: 68, w: 960, h: 540}; // preview area

const rand = (i: number, seed = 1) => {
  const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/* ================= CAMERA (3D + depth of field) ================= */
type Focus = {chat: number; mon: number; tl: number};
type Cam = {f: number; x: number; y: number; s: number; rx: number; ry: number; fo: Focus; d: number};
type P = {x: number; y: number; s: number; rx: number; ry: number; fo: Focus};
const FA: Focus = {chat: 1, mon: 1, tl: 1};
const FC: Focus = {chat: 1, mon: 0, tl: 0};
const FM: Focus = {chat: 0, mon: 1, tl: 0};
const FT: Focus = {chat: 0, mon: 0, tl: 1};
const WIDE: P = {x: 960, y: 560, s: 0.86, rx: 16, ry: -12, fo: FA};
const CHATF: P = {x: 330, y: 330, s: 1.55, rx: 4, ry: 9, fo: FC};
const TLF: P = {x: 1250, y: 860, s: 1.3, rx: 8, ry: -5, fo: FT};
const MONF: P = {x: 1252, y: 338, s: 1.22, rx: -5, ry: -6, fo: FM};
const k = (f: number, p: P, d = 18): Cam => ({f, ...p, d});
const CAMS: Cam[] = [
  k(0, {x: X0 + 40, y: 880, s: 2.6, rx: 0, ry: 0, fo: FT}, 1),
  k(80, WIDE, 30),
  k(106, CHATF, 20),
  k(134, TLF, 20),
  k(206, CHATF, 1),
  k(234, {x: 1250, y: 930, s: 1.5, rx: 10, ry: -4, fo: FT}, 18),
  k(274, TLF, 18),
  k(300, CHATF, 18),
  k(320, MONF, 20),
  k(344, {x: 1200, y: 600, s: 1.0, rx: 12, ry: -5, fo: FA}, 22),
  k(401, CHATF, 1),
  k(430, TLF, 18),
  k(458, MONF, 18),
  k(495, CHATF, 18),
  k(543, {x: 900, y: 560, s: 0.98, rx: 10, ry: 7, fo: FA}, 14),
  k(558, MONF, 14),
  k(611, CHATF, 1),
  k(654, {x: 760, y: 400, s: 1.12, rx: 5, ry: 8, fo: {chat: 1, mon: 1, tl: 0}}, 18),
  k(679, TLF, 14),
  k(692, CHATF, 12),
  k(704, TLF, 14),
  k(731, CHATF, 12),
  k(746, WIDE, 22),
];
const camAt = (f: number) => {
  const c0 = CAMS[0];
  let c = {x: c0.x, y: c0.y, s: c0.s, rx: c0.rx, ry: c0.ry, fo: {...c0.fo}};
  for (let i = 1; i < CAMS.length; i++) {
    const kf = CAMS[i];
    if (f < kf.f) break;
    const t = tw(f, kf.f, kf.f + kf.d, 0, 1, EASE);
    c = {
      x: lerp(c.x, kf.x, t), y: lerp(c.y, kf.y, t), s: lerp(c.s, kf.s, t), rx: lerp(c.rx, kf.rx, t), ry: lerp(c.ry, kf.ry, t),
      fo: {chat: lerp(c.fo.chat, kf.fo.chat, t), mon: lerp(c.fo.mon, kf.fo.mon, t), tl: lerp(c.fo.tl, kf.fo.tl, t)},
    };
  }
  return c;
};

/* ================= CURSOR ================= */
const KEEP_AT = [150, 156, 161, 167];
const GAP_C = [140, 295, 485, 650, 800, 985];
type CK = [number, number, number];
const path = (f: number, pts: CK[]) => {
  if (f <= pts[0][0]) return {x: pts[0][1], y: pts[0][2]};
  for (let i = 1; i < pts.length; i++) {
    if (f <= pts[i][0]) {
      const t = tw(f, pts[i - 1][0], pts[i][0], 0, 1, EASE);
      return {x: lerp(pts[i - 1][1], pts[i][1], t), y: lerp(pts[i - 1][2], pts[i][2], t)};
    }
  }
  const l = pts[pts.length - 1];
  return {x: l[1], y: l[2]};
};
const cursorAt = (f: number): {x: number; y: number; op: number; clicks: number[]} | null => {
  const yV1 = TRACK_Y.V1 + 37;
  if (f >= 136 && f < 180) {
    const pts: CK[] = [[136, 1500, 1010], [148, X0 + 80, yV1], [151, X0 + 80, yV1], [154, X0 + 385, yV1], [157, X0 + 385, yV1], [159, X0 + 555, yV1], [162, X0 + 555, yV1], [165, X0 + 860, yV1], [168, X0 + 860, yV1], [178, X0 + 940, yV1 + 60]];
    return {...path(f, pts), op: tw(f, 136, 142) * (1 - tw(f, 172, 179)), clicks: KEEP_AT};
  }
  if (f >= 240 && f < 286) {
    const pts: CK[] = [[240, 1600, 1000], ...GAP_C.map((g, i) => [249 + i * 3, X0 + g, yV1] as CK), [284, X0 + 1000, yV1 + 70]];
    return {...path(f, pts), op: tw(f, 240, 245) * (1 - tw(f, 278, 285)), clicks: GAP_C.map((_, i) => 250 + i * 3)};
  }
  if (f >= 646 && f < 694) {
    const v = lerp(0.15, 0.92, sliderT(f));
    const kx = 180 + 358 * v;
    const pts: CK[] = [[646, 460, 640], [657, 234, 445]];
    let p = path(f, pts);
    if (f >= 657 && f < 675) p = {x: kx, y: 445};
    if (f >= 675) p = path(f, [[675, kx, 445], [678, 478, 546], [694, 478, 546]]);
    return {...p, op: tw(f, 646, 651) * (1 - tw(f, 686, 693)), clicks: [657, 678]};
  }
  if (f >= 702 && f < 740) {
    const moveT = sp(f, 712, 300, 28);
    const liftT = tw(f, 711, 730, 0, 1, INOUT);
    let p = path(f, [[702, 1150, 1000], [710, X0 + 265, yV1]]);
    if (f >= 711) p = {x: X0 + lerp(200, 0, f >= 712 ? moveT : 0) + 65, y: yV1 - 38 * Math.sin(Math.PI * liftT)};
    return {...p, op: tw(f, 702, 706) * (1 - tw(f, 732, 739)), clicks: [711]};
  }
  return null;
};

const Cursor: React.FC<{f: number}> = ({f}) => {
  const c = cursorAt(f);
  if (!c) return null;
  const last = c.clicks.filter((k) => f >= k).pop();
  const since = last === undefined ? 99 : f - last;
  const press = since < 4 ? 0.82 : 1;
  const ring = since < 14 ? since / 14 : 1;
  return (
    <div style={{position: 'absolute', left: c.x, top: c.y, opacity: c.op, pointerEvents: 'none'}}>
      {ring < 1 && <div style={{position: 'absolute', left: -30 * (0.4 + ring), top: -30 * (0.4 + ring), width: 60 * (0.4 + ring), height: 60 * (0.4 + ring), borderRadius: '50%', border: `2px solid ${C.accent}`, opacity: 1 - ring, boxShadow: `0 0 24px ${C.accent}`}} />}
      <svg width={38} height={38} viewBox="0 0 24 24" style={{transform: `scale(${press})`, transformOrigin: '4px 3px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.6)) drop-shadow(0 0 8px rgba(255,255,255,.35))'}}>
        <path d="M4 3 L19 11 L12.5 12.8 L9.5 19 Z" fill="#0B0B0B" stroke="#F2F0EB" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ================= PLAYHEAD ================= */
const PH: [number, number][] = [
  [0, 40], [90, 40], [178, 640], [210, 40], [298, 520], [404, 60], [494, 640], [555, 140], [585, 270], [615, 270], [700, 520], [765, 620],
];
const playheadX = (f: number) => interpolate(f, PH.map((p) => p[0]), PH.map((p) => p[1]), {extrapolateRight: 'clamp'});

/* ================= CHAT ================= */
type Block = {start: number; prompt: string; typeEnd: number; reply: string; replyAt: number; h: number; extra?: 'code' | 'panel'};
const BLOCKS: Block[] = [
  {start: 104, prompt: 'find the strongest moments', typeEnd: 128, reply: 'Found 4 keepers. Highlighting them.', replyAt: 134, h: 170},
  {start: 210, prompt: 'remove pauses and repeats', typeEnd: 230, reply: 'Cut 6 dead spots. 01:42 → 00:58', replyAt: 234, h: 170},
  {start: 300, prompt: 'storyboard this idea', typeEnd: 316, reply: '4 shots: wide, close, push in, whip.', replyAt: 320, h: 170},
  {start: 405, prompt: 'captions, highlight key words', typeEnd: 426, reply: 'Captions ready. Exported .srt', replyAt: 430, h: 170},
  {start: 495, prompt: 'build a glitch transition', typeEnd: 515, reply: 'Here’s the effect:', replyAt: 518, h: 320, extra: 'code'},
  {start: 615, prompt: 'make me a title tool', typeEnd: 631, reply: 'Built you one:', replyAt: 634, h: 370, extra: 'panel'},
  {start: 690, prompt: 'does the opening hook?', typeEnd: 706, reply: 'Not yet. Move clip 03 to the start.', replyAt: 709, h: 170},
  {start: 729, prompt: 'save as template', typeEnd: 741, reply: 'Template saved ✓', replyAt: 744, h: 170},
];
const ANCHOR = 220; // local y of the active block inside chat panel
const blockY = (j: number, f: number) => {
  let y = ANCHOR;
  for (let i = 0; i < j; i++) y += BLOCKS[i].h;
  for (let i = 1; i < BLOCKS.length; i++) y -= BLOCKS[i - 1].h * sp(f, BLOCKS[i].start - 3);
  return y;
};
const CODE = ['const glitch = (t) => ({', '  rgbSplit: 12 * t,', '  slices: 6,', '  jitter: 0.4 * t,', '});'];
const CODE_OFF = 124; // y offset of code/panel inside block
const FX = {x: X0 + 176, y: TRACK_Y.V1 + 6, w: 48, h: TRACK_H - 12};

const sliderT = (f: number) => tw(f, 658, 674, 0, 1, INOUT);

const ChatBlock: React.FC<{b: Block; f: number; y: number}> = ({b, f, y}) => {
  const enter = tw(f, b.start, b.start + 8);
  const txt = typed(b.prompt, f, b.start + 2, b.typeEnd);
  const typing = f < b.typeEnd + 4;
  const rep = typed(b.reply, f, b.replyAt, b.replyAt + 12);
  const op = interpolate(y, [-160, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 24, top: y, width: 512, opacity: op * enter, transform: `translateY(${lerp(10, 0, enter)}px)`}}>
      <div style={{background: '#1B1B1B', border: `1px solid ${C.line}`, borderRadius: 14, padding: '15px 18px', fontFamily: MONO, fontSize: 21, color: C.ink, height: 58, boxSizing: 'border-box', whiteSpace: 'nowrap'}}>
        <span style={{color: C.dim}}>› </span>
        {txt}
        {typing && <span style={{color: C.accent, opacity: Math.floor(f / 6) % 2 ? 0.2 : 1}}>▍</span>}
      </div>
      {f >= b.replyAt && (
        <div style={{position: 'absolute', top: 80, left: 2, display: 'flex', gap: 12, alignItems: 'baseline', fontFamily: SANS, fontSize: 23, fontWeight: 500, color: C.ink, letterSpacing: '-0.01em'}}>
          <span style={{color: C.accent, fontSize: 18, transform: `rotate(${(f - b.replyAt) * 6}deg)`, display: 'inline-block'}}>◆</span>
          <span>{rep}</span>
        </div>
      )}
      {b.extra === 'code' && f >= b.replyAt + 4 && <CodeCard f={f} />}
      {b.extra === 'panel' && f >= 638 && <PanelCard f={f} />}
    </div>
  );
};

const CodeCard: React.FC<{f: number}> = ({f}) => {
  const fade = 1 - tw(f, 545, 552);
  return (
    <div style={{position: 'absolute', top: CODE_OFF, left: 0, width: 512, height: 168, boxSizing: 'border-box', background: '#141414', border: `1px solid ${C.line}`, borderRadius: 14, padding: '16px 20px', fontFamily: MONO, fontSize: 18, lineHeight: '27px', color: C.dim, opacity: fade}}>
      {CODE.map((l, i) => {
        const shown = typed(l, f, 523 + i * 4, 527 + i * 4);
        return (
          <div key={i} style={{whiteSpace: 'pre'}}>
            {shown.split(/(const|=>|\d+(?:\.\d+)?)/).map((p, j) =>
              /^(const|=>)$/.test(p) ? <span key={j} style={{color: C.accent}}>{p}</span> : /^\d/.test(p) ? <span key={j} style={{color: C.ink}}>{p}</span> : <span key={j}>{p}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const PanelCard: React.FC<{f: number}> = ({f}) => {
  const t = tw(f, 638, 652);
  const s = sliderT(f);
  const press = f >= 676 && f < 681;
  const done = f >= 676;
  const row = (label: string, v: number, top: number) => (
    <div style={{position: 'absolute', top, left: 22, right: 22, height: 30}}>
      <span style={{fontFamily: MONO, fontSize: 13, letterSpacing: '0.1em', color: C.dim, position: 'absolute', top: 6}}>{label}</span>
      <div style={{position: 'absolute', left: 110, right: 0, top: 14, height: 2, background: C.line}} />
      <div style={{position: 'absolute', left: 110, width: `calc((100% - 110px) * ${v})`, top: 14, height: 2, background: C.accent}} />
      <div style={{position: 'absolute', left: `calc(110px + (100% - 110px) * ${v} - 9px)`, top: 6, width: 18, height: 18, borderRadius: 9, background: C.ink}} />
    </div>
  );
  return (
    <div style={{position: 'absolute', top: CODE_OFF, left: 0, width: 512, height: 218, background: '#141414', border: `1px solid ${C.line}`, borderRadius: 14, opacity: t, transform: `translateY(${lerp(-14, 0, t)}px) scale(${lerp(0.97, 1, t)})`, transformOrigin: 'top left'}}>
      <div style={{position: 'absolute', top: 18, left: 22, fontFamily: MONO, fontSize: 13, letterSpacing: '0.14em', color: C.ink}}>TITLE TOOL</div>
      <div style={{position: 'absolute', top: 18, right: 22, fontFamily: MONO, fontSize: 12, color: C.faint}}>v0.1</div>
      {row('WEIGHT', lerp(0.15, 0.92, s), 62)}
      {row('TRACKING', lerp(0.8, 0.22, s), 106)}
      <div
        style={{
          position: 'absolute', right: 22, bottom: 20, padding: '10px 22px', borderRadius: 999, fontFamily: MONO, fontSize: 14, letterSpacing: '0.12em',
          border: `1.5px solid ${C.accent}`, background: done ? C.accent : 'transparent', color: done ? C.bg : C.accent, transform: `scale(${press ? 0.97 : 1})`,
        }}
      >
        {done ? 'RENDERED ✓' : 'RENDER'}
      </div>
    </div>
  );
};

/* ================= TIMELINE ================= */
const RAW_W = [160, 130, 190, 150, 170, 120, 200];
const KEEP = [0, 2, 3, 5];
const CLIP_W = [110, 90, 130, 100, 80, 120, 100];
const GAP_W = [60, 70, 50, 80, 60, 70];
const SB = ['WIDE', 'CLOSE', 'PUSH IN', 'WHIP'];
const SB_X = (i: number) => 730 + i * 105;

const Clip: React.FC<{x: number; y: number; w: number; label: string; bg: string; fg: string; op?: number; lift?: number; border?: string}> = ({x, y, w, label, bg, fg, op = 1, lift = 0, border}) => (
  <div style={{position: 'absolute', left: X0 + x, top: y + 6 + lift, width: Math.max(0, w - 4), height: TRACK_H - 12, background: bg, borderRadius: 7, opacity: op, overflow: 'hidden', border, boxSizing: 'border-box', boxShadow: lift ? '0 18px 30px rgba(0,0,0,0.5)' : undefined}}>
    <div style={{position: 'absolute', left: 9, top: 8, fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: fg, whiteSpace: 'nowrap'}}>{label}</div>
  </div>
);

const Wave: React.FC<{x: number; w: number; seed: number; color: string; flat?: boolean}> = ({x, w, seed, color, flat}) => {
  const n = Math.floor(w / 5);
  return (
    <div style={{position: 'absolute', left: X0 + x, top: TRACK_Y.A1 + 6, width: Math.max(0, w - 4), height: TRACK_H - 12, background: flat ? 'transparent' : '#171717', borderRadius: 7, overflow: 'hidden'}}>
      {flat ? (
        <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: C.faint}} />
      ) : (
        Array.from({length: n}).map((_, i) => {
          const a = 0.15 + 0.85 * Math.abs(Math.sin(i * 0.37 + seed) * rand(i, seed));
          return <div key={i} style={{position: 'absolute', left: i * 5 + 3, width: 2, top: `${50 - a * 40}%`, height: `${a * 80}%`, background: color, borderRadius: 1}} />;
        })
      )}
    </div>
  );
};

const Timeline: React.FC<{f: number}> = ({f}) => {
  const els: React.ReactNode[] = [];
  // ---- Phase A: raw
  if (f < 195) {
    let x = 0;
    RAW_W.forEach((w, i) => {
      const keep = KEEP.indexOf(i);
      const hi = keep >= 0 ? tw(f, KEEP_AT[keep], KEEP_AT[keep] + 4) : 0;
      const dimT = keep < 0 ? tw(f, 166, 176) : 0;
      els.push(<Clip key={`r${i}`} x={x} y={TRACK_Y.V1} w={w} label={`RAW_00${i + 1}`} bg={hi > 0.5 ? C.accent : C.raw} fg={hi > 0.5 ? C.bg : C.dim} op={1 - dimT * 0.7} />);
      els.push(<Wave key={`rw${i}`} x={x} w={w} seed={i + 1} color={keep >= 0 && hi > 0.5 ? C.accent : '#555'} />);
      x += w;
    });
  } else if (f < 300) {
    // ---- Phase B: dead air gaps -> scissors -> ripple delete
    let x = 0;
    CLIP_W.forEach((w, i) => {
      els.push(<Clip key={`b${i}`} x={x} y={TRACK_Y.V1} w={w} label={`0${i + 1}`} bg={C.ink} fg={C.bg} />);
      els.push(<Wave key={`bw${i}`} x={x} w={w} seed={i + 3} color={C.ink} />);
      x += w;
      if (i < GAP_W.length) {
        const shrink = sp(f, 276 + i * 2);
        const gw = GAP_W[i] * (1 - shrink);
        const drop = sp(f, 250 + i * 3, 500, 26);
        els.push(
          <div key={`g${i}`} style={{position: 'absolute', left: X0 + x, top: TRACK_Y.V1 + 6, width: Math.max(0, gw - 4), height: TRACK_H - 12, borderRadius: 7, background: 'repeating-linear-gradient(45deg, #1d1d1d 0 6px, #141414 6px 12px)', border: `1px dashed ${f >= 250 + i * 3 ? C.accent : '#2a2a2a'}`, boxSizing: 'border-box', opacity: 1 - shrink}} />
        );
        els.push(<Wave key={`gw${i}`} x={x} w={gw} seed={0} color={C.ink} flat />);
        if (f >= 250 + i * 3) {
          els.push(
            <div key={`s${i}`} style={{position: 'absolute', left: X0 + x + gw / 2 - 14, top: TRACK_Y.V1 - 46 + drop * 26, fontSize: 26, color: C.accent, opacity: drop * (1 - shrink), fontFamily: SANS}}>✂</div>
          );
        }
        x += gw;
      }
    });
  } else {
    // ---- Phase C: compact edit + storyboard + reorder
    const moveT = sp(f, 712, 300, 28);
    const liftT = tw(f, 711, 730, 0, 1, INOUT);
    const order = [2, 0, 1, 3, 4, 5, 6];
    const oldX: number[] = [];
    const newX: number[] = [];
    let acc = 0;
    CLIP_W.forEach((w, i) => { oldX[i] = acc; acc += w; });
    acc = 0;
    order.forEach((i) => { newX[i] = acc; acc += CLIP_W[i]; });
    const allWhite = f >= 750;
    CLIP_W.forEach((w, i) => {
      const moving = i === 2 && f >= 711;
      const x = lerp(oldX[i], newX[i], f >= 712 ? moveT : 0);
      const lift = moving ? -38 * Math.sin(Math.PI * liftT) : 0;
      const orange = moving && f < 745 && !allWhite;
      els.push(<Clip key={`c${i}`} x={x} y={TRACK_Y.V1} w={w} label={`0${i + 1}`} bg={orange ? C.accent : C.ink} fg={C.bg} lift={lift} />);
      els.push(<Wave key={`cw${i}`} x={x} w={w} seed={i + 3} color={orange ? C.accent : C.ink} />);
    });
    SB.forEach((name, i) => {
      const land = 345 + i * 5 + 16;
      if (f >= land) {
        const orange = f < 400 && !allWhite;
        els.push(<Clip key={`sb${i}`} x={SB_X(i)} y={TRACK_Y.V1} w={100} label={name} bg={orange ? C.accent : C.ink} fg={C.bg} />);
        els.push(<Wave key={`sbw${i}`} x={SB_X(i)} w={100} seed={i + 11} color={orange ? C.accent : C.ink} />);
      }
    });
    // captions on C1
    if (f >= 430) {
      const caps = ['you can', 'edit', 'videos', 'with', 'claude', 'yes', 'actually', 'try it'];
      let cx = 8;
      caps.forEach((c, i) => {
        const w = 60 + (c.length * 9);
        const t = tw(f, 432 + i * 2, 440 + i * 2);
        els.push(
          <div key={`cap${i}`} style={{position: 'absolute', left: X0 + cx, top: TRACK_Y.C1 + 6, width: w - 6, height: TRACK_H - 12, borderRadius: 7, background: '#1E1E1E', border: `1px solid ${f < 470 ? C.accent : '#333'}`, boxSizing: 'border-box', opacity: t, transform: `scale(${lerp(0.96, 1, t)})`, fontFamily: MONO, fontSize: 11, color: C.ink, padding: '8px 9px', whiteSpace: 'nowrap', overflow: 'hidden'}}>
            {c}
          </div>
        );
        cx += w + 16;
      });
    }
    // FX block
    if (f >= 560) {
      els.push(
        <div key="fx" style={{position: 'absolute', left: FX.x, top: FX.y, width: FX.w, height: FX.h, borderRadius: 7, background: C.accent, fontFamily: MONO, fontSize: 11, color: C.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', letterSpacing: '0.08em', boxShadow: '0 0 0 2px #0B0B0B'}}>FX</div>
      );
    }
    // V2 title clip
    if (f >= 677) {
      const d = sp(f, 677, 500, 24);
      els.push(<Clip key="v2" x={0} y={TRACK_Y.V2} w={240} label="TITLE_01" bg={f < 700 ? C.accent : C.ink} fg={C.bg} lift={(1 - d) * -40} op={d} />);
    }
  }

  // ruler + duration
  const dur = f < 275 ? 102 : f < 300 ? Math.round(interpolate(f, [275, 298], [102, 58], {extrapolateRight: 'clamp'})) : 58;
  const mmss = `${String(Math.floor(dur / 60)).padStart(2, '0')}:${String(dur % 60).padStart(2, '0')}`;
  const ph = playheadX(f);
  return (
    <>
      <div style={{position: 'absolute', left: TL.x, top: TL.y, width: TL.w, height: TL.h, background: C.panel, borderRadius: 18, border: `1px solid ${C.line}`, boxSizing: 'border-box'}} />
      {Array.from({length: 24}).map((_, i) => (
        <div key={`t${i}`} style={{position: 'absolute', left: X0 + i * 50, top: TL.y + 14, fontFamily: MONO, fontSize: 10, color: C.faint}}>
          {i % 2 === 0 ? `|${String(i * 5).padStart(2, '0')}` : '·'}
        </div>
      ))}
      <div style={{position: 'absolute', right: 1920 - (TL.x + TL.w) + 22, top: TL.y + 12, fontFamily: MONO, fontSize: 13, color: f >= 275 && f < 330 ? C.accent : C.dim, letterSpacing: '0.08em'}}>DUR {mmss}</div>
      {(['V2', 'V1', 'C1', 'A1'] as const).map((t) => (
        <React.Fragment key={t}>
          <div style={{position: 'absolute', left: TL.x + 22, top: TRACK_Y[t] + 28, fontFamily: MONO, fontSize: 12, color: C.dim, letterSpacing: '0.1em'}}>{t}</div>
          <div style={{position: 'absolute', left: X0, width: TRACK_W, top: TRACK_Y[t] + TRACK_H + 2, height: 1, background: '#1a1a1a'}} />
        </React.Fragment>
      ))}
      {els}
      {/* playhead */}
      <div style={{position: 'absolute', left: X0 + ph - 1.5, top: TL.y + 6, width: 3, height: TL.h - 12, background: C.accent}} />
      <div style={{position: 'absolute', left: X0 + ph - 8, top: TL.y + 6, width: 16, height: 12, background: C.accent, clipPath: 'polygon(0 0,100% 0,50% 100%)'}} />
    </>
  );
};

/* ================= MONITOR ================= */
const Footage: React.FC<{f: number; variant: number}> = ({f, variant}) => {
  const hue = [C.accent, '#E9C46A', '#7FB8A4', '#C9B8FF'][variant % 4];
  const bx = 30 + 12 * Math.sin(f / 22 + variant);
  const by = 58 + 6 * Math.cos(f / 30);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#17120f 0%,#0d0d0d 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: `${bx}%`, top: `${by}%`, width: 620, height: 620, marginLeft: -310, marginTop: -310, borderRadius: '50%', background: `radial-gradient(circle, ${hue}AA 0%, ${hue}00 65%)`}} />
      <div style={{position: 'absolute', right: '18%', top: '22%', width: 170, height: 170, borderRadius: '50%', border: `2px solid ${C.ink}55`, transform: `translateY(${6 * Math.sin(f / 18)}px)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: '70%', height: 1, background: `${C.ink}33`}} />
      <div style={{position: 'absolute', left: '22%', bottom: 0, width: 240, height: 300, borderRadius: '120px 120px 0 0', background: '#0a0a0a', border: `1px solid ${C.ink}22`, transform: `translateX(${f % 90 < 45 ? 0 : 0}px)`}} />
      <div style={{position: 'absolute', left: 'calc(22% + 70px)', bottom: 260, width: 100, height: 100, borderRadius: '50%', background: '#0a0a0a', border: `1px solid ${C.ink}22`}} />
    </AbsoluteFill>
  );
};

const Monitor: React.FC<{f: number}> = ({f}) => {
  const variant = f < 300 ? 0 : f < 405 ? 1 : f < 615 ? 2 : 3;
  const glitch = f >= 562 && f <= 582;
  const g = f - 562;
  const off = glitch ? 16 * Math.sin(g * 1.7) : 0;
  const capsWords = ['you', 'can', 'edit', 'videos', 'with', 'claude'];
  const capIdx = Math.floor((f - 462) / 5);
  const s = sliderT(f);
  return (
    <>
      <div style={{position: 'absolute', left: MON.x, top: MON.y, width: MON.w, height: MON.h, background: C.panel, borderRadius: 18, border: `1px solid ${C.line}`, boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: MON.x + 22, top: MON.y + 12, fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: C.dim}}>PREVIEW</div>
      <div style={{position: 'absolute', right: 1920 - (MON.x + MON.w) + 22, top: MON.y + 12, fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: C.dim}}>
        <span style={{color: C.accent}}>●</span> {f < 300 ? 'RAW_SEQUENCE' : 'EDIT_V2'}
      </div>
      <div style={{position: 'absolute', left: PV.x, top: PV.y, width: PV.w, height: PV.h, borderRadius: 8, overflow: 'hidden'}}>
        {!glitch && <Footage f={f} variant={variant} />}
        {glitch && (
          <>
            {[0, 1, 2, 3, 4, 5].map((b) => (
              <AbsoluteFill key={b} style={{clipPath: `inset(${b * 16.66}% 0 ${100 - (b + 1) * 16.66}% 0)`, transform: `translateX(${(rand(b + g * 7, 3) - 0.5) * 120}px)`}}>
                <Footage f={f} variant={g < 10 ? 2 : 3} />
              </AbsoluteFill>
            ))}
            <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55, transform: `translateX(${off}px)`, background: 'rgba(255,40,40,0.25)'}} />
            <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.55, transform: `translateX(${-off}px)`, background: 'rgba(40,200,255,0.18)'}} />
          </>
        )}
        {/* storyboard cards */}
        {f >= 320 && f < 345 + 3 * 5 + 2 &&
          SB.map((name, i) => {
            const t = tw(f, 322 + i * 3, 332 + i * 3);
            const gone = f >= 345 + i * 5;
            const cx = (i % 2) * 490 + 0;
            const cy = Math.floor(i / 2) * 280;
            const inner = [0.85, 0.35, 0.55, 0.7][i];
            return (
              <div key={name} style={{position: 'absolute', left: cx, top: cy, width: 470, height: 260, background: '#151515', border: `1px solid ${C.line}`, borderRadius: 10, opacity: gone ? 0 : t, transform: `scale(${lerp(0.96, 1, t)})`}}>
                <div style={{position: 'absolute', left: '50%', top: '50%', width: 300 * inner, height: 170 * inner, transform: 'translate(-50%,-50%)', border: `1.5px solid ${C.accent}`, borderRadius: 4}} />
                <div style={{position: 'absolute', left: 16, top: 12, fontFamily: MONO, fontSize: 13, color: C.ink, letterSpacing: '0.1em'}}>0{i + 1} {name}</div>
              </div>
            );
          })}
        {/* captions */}
        {f >= 458 && f < 500 && (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 56, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 52, letterSpacing: '-0.03em', color: C.ink, opacity: tw(f, 458, 464)}}>
            {capsWords.map((w, i) => (
              <span key={w} style={{display: 'inline-block', margin: '0 7px', padding: '0 10px', borderRadius: 8, background: i === capIdx ? C.accent : 'transparent', color: i === capIdx ? C.bg : C.ink, transform: `scale(${i === capIdx ? 1.04 : 1})`}}>
                {w}
              </span>
            ))}
          </div>
        )}
        {f >= 470 && f < 500 && (
          <div style={{position: 'absolute', right: 16, top: 14, fontFamily: MONO, fontSize: 13, color: C.ink, background: '#000a', border: `1px solid ${C.accent}`, borderRadius: 999, padding: '6px 14px', opacity: tw(f, 486, 492)}}>export .srt ✓</div>
        )}
        {/* title tool output */}
        {f >= 640 && (
          <div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: SANS, fontSize: 130, fontWeight: Math.round(lerp(200, 900, s) / 100) * 100, letterSpacing: `${lerp(0.25, -0.05, s)}em`, color: C.ink, opacity: tw(f, 640, 650)}}>
            NIGHT <span style={{fontFamily: SERIF, fontWeight: 400, color: C.accent, letterSpacing: '-0.01em', marginLeft: 24}}>ride</span>
          </div>
        )}
      </div>
      {/* transport */}
      <div style={{position: 'absolute', left: PV.x, top: PV.y + PV.h + 10, fontFamily: MONO, fontSize: 12, color: C.dim, letterSpacing: '0.1em'}}>▶ 00:00:{String(Math.floor(playheadX(f) / 20)).padStart(2, '0')}</div>
    </>
  );
};

/* ================= FLYING ELEMENTS (UI space) ================= */
const Flyers: React.FC<{f: number}> = ({f}) => {
  const out: React.ReactNode[] = [];
  // storyboard cards -> V1
  SB.forEach((name, i) => {
    const a = 345 + i * 5;
    if (f >= a && f < a + 16) {
      const t = tw(f, a, a + 16, 0, 1, EASE);
      const from = {x: PV.x + (i % 2) * 490, y: PV.y + Math.floor(i / 2) * 280, w: 470, h: 260};
      const to = {x: X0 + SB_X(i), y: TRACK_Y.V1 + 6, w: 96, h: TRACK_H - 12};
      out.push(
        <div key={`fly${i}`} style={{position: 'absolute', left: lerp(from.x, to.x, t), top: lerp(from.y, to.y, t), width: lerp(from.w, to.w, t), height: lerp(from.h, to.h, t), background: t > 0.6 ? C.accent : '#151515', border: `1.5px solid ${C.accent}`, borderRadius: lerp(10, 7, t), boxSizing: 'border-box', fontFamily: MONO, fontSize: 12, color: t > 0.6 ? C.bg : C.ink, padding: 8}}>
          {name}
        </div>
      );
    }
  });
  // code block -> FX
  if (f >= 545 && f < 561) {
    const t = tw(f, 545, 560, 0, 1, EASE);
    const y0 = CHAT.y + blockY(4, f) + CODE_OFF;
    const from = {x: CHAT.x + 24, y: y0, w: 512, h: 168};
    out.push(
      <div key="flycode" style={{position: 'absolute', left: lerp(from.x, FX.x, t), top: lerp(from.y, FX.y, t), width: lerp(from.w, FX.w, t), height: lerp(from.h, FX.h, t), borderRadius: lerp(14, 7, t), background: t > 0.5 ? C.accent : '#141414', border: `1.5px solid ${C.accent}`, boxSizing: 'border-box'}} />
    );
  }
  return <>{out}</>;
};

/* ================= ROOT UI ================= */
const glass = (w: number): React.CSSProperties => ({
  boxShadow: `0 0 0 1px rgba(255,91,31,${0.32 * w}), 0 0 70px rgba(255,91,31,${0.13 * w}), 0 30px 80px rgba(0,0,0,0.55)`,
});
const dof = (w: number): React.CSSProperties => ({position: 'absolute', inset: 0, filter: w > 0.98 ? undefined : `blur(${(1 - w) * 7}px)`, opacity: lerp(0.42, 1, w)});

export const EditorUI: React.FC<{f: number; blur?: number}> = ({f, blur = 0}) => {
  const cam = camAt(f);
  const fadeIn = tw(f, 75, 88);
  const introBlur = (1 - tw(f, 75, 96)) * 18;
  const collapse = tw(f, 762, 784, 0, 1, INOUT);
  const fo = cam.fo;
  const totalBlur = introBlur + blur + collapse * 14;
  return (
    <AbsoluteFill style={{overflow: 'hidden', perspective: 1700, filter: totalBlur > 0.3 ? `blur(${totalBlur}px)` : undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(960px, 540px) rotateX(${cam.rx + collapse * 14}deg) rotateY(${cam.ry}deg) scale(${cam.s * lerp(1, 0.82, collapse)}) translate(${-cam.x}px, ${-cam.y}px)`, opacity: fadeIn * (1 - collapse), transformStyle: 'preserve-3d'}}>
        <div style={dof(fo.chat)}>
          <div style={{position: 'absolute', left: CHAT.x, top: CHAT.y, width: CHAT.w, height: CHAT.h, background: 'linear-gradient(180deg, rgba(24,22,21,0.96), rgba(14,14,14,0.96))', borderRadius: 18, border: `1px solid ${C.line}`, overflow: 'hidden', boxSizing: 'border-box', ...glass(fo.chat * (1 - fo.mon * fo.tl))}}>
            <div style={{position: 'absolute', left: 24, top: 18, fontFamily: MONO, fontSize: 13, letterSpacing: '0.14em', color: C.ink}}>
              <span style={{color: C.accent}}>◆</span> CLAUDE
            </div>
            <div style={{position: 'absolute', right: 24, top: 18, fontFamily: MONO, fontSize: 12, color: C.faint, letterSpacing: '0.1em'}}>EDIT SESSION</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 54, height: 1, background: C.line}} />
            <div style={{position: 'absolute', left: 0, right: 0, top: 56, bottom: 96, overflow: 'hidden'}}>
              {BLOCKS.map((b, j) => (f >= b.start ? <ChatBlock key={j} b={b} f={f} y={blockY(j, f) - 56} /> : null))}
            </div>
            <div style={{position: 'absolute', left: 20, right: 20, bottom: 22, height: 56, borderRadius: 14, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 16, color: C.faint, padding: '18px 18px', boxSizing: 'border-box'}}>Ask Claude to edit…</div>
          </div>
        </div>
        <div style={dof(fo.mon)}>
          <div style={{position: 'absolute', left: MON.x, top: MON.y, width: MON.w, height: MON.h, borderRadius: 18, ...glass(fo.mon * (1 - fo.chat * fo.tl))}} />
          <Monitor f={f} />
        </div>
        <div style={dof(fo.tl)}>
          <div style={{position: 'absolute', left: TL.x, top: TL.y, width: TL.w, height: TL.h, borderRadius: 18, ...glass(fo.tl * (1 - fo.chat * fo.mon))}} />
          <Timeline f={f} />
        </div>
        <Flyers f={f} />
        <Cursor f={f} />
      </div>
      {f >= 768 && <div style={{position: 'absolute', left: lerp(960, 96, tw(f, 772, 790, 0, 1, INOUT)), top: 0, width: 3, height: 1080, background: C.accent, boxShadow: `0 0 30px ${C.accent}`, transform: `scaleY(${tw(f, 768, 780)})`}} />}
    </AbsoluteFill>
  );
};

export const tagAt = (f: number) =>
  f < 75 ? 'INTRO' : f < 180 ? 'SELECT' : f < 210 ? 'CUT' : f < 300 ? 'TRIM' : f < 375 ? 'STORYBOARD' : f < 495 ? 'CAPTIONS' : f < 585 ? 'FX' : f < 615 ? 'NO PRESETS' : f < 690 ? 'TOOLS' : f < 729 ? 'STORY' : f < 765 ? 'TEMPLATE' : 'EDIT WITH CLAUDE';
