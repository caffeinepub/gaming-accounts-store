import React, { useEffect, useState } from 'react';

interface LoadingScreen3DProps {
  onComplete: () => void;
}

const MINIMUM_WAIT_MS = 40000; // 40 seconds

export default function LoadingScreen3D({ onComplete }: LoadingScreen3DProps) {
  const [progress, setProgress] = useState(0); // 0–100 over 40 seconds
  const [timerDone, setTimerDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // ── 40-second progress timer ────────────────────────────────────────────────
  useEffect(() => {
    const startTime = Date.now();
    const tickInterval = 100; // update every 100ms for smooth animation

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / MINIMUM_WAIT_MS) * 100, 100);
      setProgress(pct);

      if (elapsed >= MINIMUM_WAIT_MS) {
        clearInterval(interval);
        setTimerDone(true);
      }
    }, tickInterval);

    return () => clearInterval(interval);
  }, []);

  // ── Enter store handler ─────────────────────────────────────────────────────
  const handleEnter = () => {
    if (!timerDone) return;
    setFadeOut(true);
    setTimeout(onComplete, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#050510',
        transition: 'opacity 0.6s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      {/* Full-screen NYC sunset video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover' }}
      >
        <source src="/assets/NFF_t2v2St50913cx22j7rff1rma0cs8kwar6kmjw-fq8-a02.mp4" type="video/mp4" />
        <source src="/assets/NFF_t2v2St50913cx22j7rff1rma0cs8kwar6kmjw-fq8-a02-1.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay to ensure text readability */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(5,5,16,0.45) 0%, rgba(5,5,16,0.55) 100%)' }}
      />

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 select-none">

        {/* "GAME VAULT" text with clip-path reveal progress indicator */}
        <div className="relative flex flex-col items-center">
          {/* Ghost / base text — always visible, dimmed */}
          <h1
            className="font-orbitron text-6xl md:text-8xl font-black"
            style={{
              letterSpacing: '0.05em',
              background: 'linear-gradient(90deg, oklch(0.35 0.18 15), oklch(0.30 0.15 300), oklch(0.40 0.15 45))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              userSelect: 'none',
            }}
            aria-hidden="true"
          >
            GAME VAULT
          </h1>

          {/* Filled / revealed text — clips from left to right based on progress */}
          <h1
            className="font-orbitron text-6xl md:text-8xl font-black absolute inset-0"
            style={{
              letterSpacing: '0.05em',
              background: 'linear-gradient(90deg, oklch(0.60 0.25 15), oklch(0.55 0.22 300), oklch(0.70 0.22 45))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              // Clip-path reveals from left (0%) to right (100%) as progress increases
              clipPath: `inset(0 ${100 - progress}% 0 0)`,
              transition: 'clip-path 0.1s linear',
              userSelect: 'none',
            }}
            aria-label={`Game Vault — loading ${Math.round(progress)}%`}
          >
            GAME VAULT
          </h1>
        </div>

        <p
          className="font-rajdhani text-lg tracking-widest uppercase"
          style={{ color: 'oklch(0.85 0.02 260)' }}
        >
          Premium Gaming Accounts
        </p>

        {/* Enter Store button — only appears after 40 seconds */}
        <div className="mt-2 h-10 flex items-center justify-center">
          {timerDone ? (
            <button
              onClick={handleEnter}
              className="font-rajdhani tracking-widest uppercase text-sm px-8 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(90deg, oklch(0.60 0.25 15), oklch(0.55 0.22 300), oklch(0.70 0.22 45))',
                color: 'oklch(0.98 0.01 260)',
                boxShadow: '0 0 24px oklch(0.55 0.22 300 / 0.5)',
              }}
            >
              Enter Store
            </button>
          ) : (
            <span
              className="font-rajdhani text-xs tracking-widest uppercase animate-pulse"
              style={{ color: 'oklch(0.75 0.05 260)' }}
            >
              Loading&hellip;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
