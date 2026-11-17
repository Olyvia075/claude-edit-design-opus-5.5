import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, tw} from './theme';
import {Open, PunchCut, PunchCaptions, PunchPresets, Lockup, Overlays, Background, Vignette, LightSweep} from './Type';
import {EditorUI, tagAt} from './EditorUI';

// punch windows: content runs local 0..30; blur crossfade 5 frames either side
const PUNCHES = [
  {at: 180, C: PunchCut},
  {at: 375, C: PunchCaptions},
  {at: 585, C: PunchPresets},
];
const env = (f: number, at: number) => tw(f, at - 5, at + 1) * (1 - tw(f, at + 27, at + 33));

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  const pe = Math.max(...PUNCHES.map((p) => env(f, p.at)));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Background f={f} />
      {f >= 75 && f < 790 && <EditorUI f={f} blur={pe * 22} />}
      {pe > 0 && <AbsoluteFill style={{background: 'rgba(6,6,6,0.82)', opacity: pe}} />}
      {f < 84 && <Open f={f} />}
      {PUNCHES.map(({at, C: P}) => {
        const e = env(f, at);
        if (e <= 0) return null;
        return (
          <AbsoluteFill key={at} style={{opacity: e, filter: e < 1 ? `blur(${(1 - e) * 16}px)` : undefined, transform: `scale(${1 + (1 - e) * 0.06})`}}>
            <P f={f - at} />
          </AbsoluteFill>
        );
      })}
      {f >= 784 && f < 894 && (
        <AbsoluteFill style={{opacity: tw(f, 784, 792)}}>
          <Lockup f={f - 790} />
        </AbsoluteFill>
      )}
      <LightSweep f={f} a={70} b={100} />
      <LightSweep f={f} a={756} b={790} />
      <Vignette />
      {f >= 894 && <AbsoluteFill style={{background: '#050505'}} />}
      <Overlays f={f} tag={tagAt(f)} />
    </AbsoluteFill>
  );
};
