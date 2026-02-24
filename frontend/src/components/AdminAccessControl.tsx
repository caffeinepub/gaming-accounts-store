import React, { useState, useRef, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, Shield, LogIn, Lock, AlertTriangle, Clock } from 'lucide-react';

interface AdminAccessControlProps {
  children: React.ReactNode;
}

type Status = 'unauthenticated' | 'pin-entry' | 'granted' | 'locked-out';

export default function AdminAccessControl({ children }: AdminAccessControlProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, login, loginStatus } = useInternetIdentity();

  const [status, setStatus] = useState<Status>('unauthenticated');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockoutMessage, setLockoutMessage] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Transition to pin-entry when authenticated
  useEffect(() => {
    if (isAuthenticated && status === 'unauthenticated') {
      setStatus('pin-entry');
      setPin('');
      setErrorMessage('');
    } else if (!isAuthenticated && status !== 'granted') {
      setStatus('unauthenticated');
      setPin('');
      setErrorMessage('');
      setLockoutMessage('');
    }
  }, [isAuthenticated, status]);

  // Focus input when pin-entry screen shows
  useEffect(() => {
    if (status === 'pin-entry') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [status]);

  // Countdown timer for lockout
  useEffect(() => {
    if (status === 'locked-out' && lockoutSeconds > 0) {
      countdownRef.current = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setStatus('pin-entry');
            setLockoutMessage('');
            setPin('');
            setErrorMessage('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [status, lockoutSeconds]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || pin.length !== 4 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await actor.verifyAdminPin(pin);

      if (result.__kind__ === 'ok') {
        if (result.ok === true) {
          setStatus('granted');
        } else {
          setErrorMessage('Incorrect PIN. Please try again.');
          setPin('');
          inputRef.current?.focus();
        }
      } else {
        // err variant — check if it's a lockout message
        const msg: string = result.err;
        if (msg.toLowerCase().includes('locked out')) {
          // Parse remaining minutes from message like "Locked out. Try again in 60 minutes."
          const minuteMatch = msg.match(/(\d+)\s*minutes?/i);
          const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 60;
          const seconds = minutes * 60;
          setLockoutSeconds(seconds);
          setLockoutMessage(msg);
          setStatus('locked-out');
          setPin('');
        } else {
          setErrorMessage(msg);
          setPin('');
          inputRef.current?.focus();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      if (message.toLowerCase().includes('locked out')) {
        const minuteMatch = message.match(/(\d+)\s*minutes?/i);
        const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 60;
        setLockoutSeconds(minutes * 60);
        setLockoutMessage(message);
        setStatus('locked-out');
        setPin('');
      } else {
        setErrorMessage(message);
        setPin('');
        inputRef.current?.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    if (errorMessage) setErrorMessage('');
  };

  // ── Render: access granted ──────────────────────────────────────────────────
  if (status === 'granted') {
    return <>{children}</>;
  }

  // ── Shared card wrapper ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dusk-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dusk-bg via-dusk-mid to-dusk-bg opacity-80 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 60%, oklch(0.45 0.18 35 / 0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="rounded-2xl border border-sunset-orange/30 bg-dusk-mid/80 backdrop-blur-sm p-8 shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(255, 107, 53, 0.12), 0 0 20px rgba(255, 107, 53, 0.08)' }}
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-full bg-sunset-orange/20 border border-sunset-orange/40 flex items-center justify-center mb-4"
              style={{ boxShadow: '0 0 20px rgba(255, 107, 53, 0.2)' }}
            >
              <Shield className="w-8 h-8 text-sunset-orange" />
            </div>
            <h1 className="font-orbitron text-2xl font-bold text-sunset-gold tracking-wider">
              ADMIN ACCESS
            </h1>
            <p className="font-rajdhani text-muted-foreground text-sm mt-1 tracking-wide">
              Game Vault Control Panel
            </p>
          </div>

          {/* ── Unauthenticated ── */}
          {status === 'unauthenticated' && (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="font-rajdhani text-foreground/80 text-base leading-relaxed">
                  Please log in via Internet Identity to access the admin panel.
                </p>
              </div>
              <button
                onClick={login}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-sunset-orange to-sunset-gold text-dusk-bg font-orbitron font-bold tracking-wider text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity w-full justify-center"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging in…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Log In
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── PIN Entry ── */}
          {status === 'pin-entry' && (
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="font-rajdhani text-foreground/70 text-sm tracking-wide">
                  Enter the 4-digit PIN to continue
                </p>
              </div>

              {/* PIN dots display */}
              <div className="flex gap-3 mb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center font-orbitron text-2xl font-bold transition-all duration-150 ${
                      i < pin.length
                        ? 'border-sunset-orange bg-sunset-orange/15 text-sunset-gold'
                        : 'border-sunset-orange/30 bg-dusk-bg/50 text-transparent'
                    }`}
                    style={
                      i < pin.length
                        ? { boxShadow: '0 0 12px rgba(255, 107, 53, 0.25)' }
                        : {}
                    }
                  >
                    {i < pin.length ? '●' : '○'}
                  </div>
                ))}
              </div>

              {/* Hidden actual input */}
              <input
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={handlePinChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && pin.length === 4) handleSubmit(e as unknown as React.FormEvent);
                }}
                className="sr-only"
                autoComplete="off"
                aria-label="4-digit PIN"
              />

              {/* Tap-to-focus hint */}
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-sunset-orange/20 bg-dusk-bg/40 text-foreground/50 font-rajdhani text-xs tracking-wide hover:border-sunset-orange/40 hover:text-foreground/70 transition-all"
              >
                <Lock className="w-3 h-3" />
                Tap to type PIN
              </button>

              {/* Error message */}
              {errorMessage && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30 w-full">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="font-rajdhani text-destructive text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={pin.length !== 4 || isSubmitting || actorFetching}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-sunset-orange to-sunset-gold text-dusk-bg font-orbitron font-bold tracking-wider text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity w-full justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  'SUBMIT PIN'
                )}
              </button>
            </form>
          )}

          {/* ── Locked Out ── */}
          {status === 'locked-out' && (
            <div className="flex flex-col items-center gap-6">
              <div
                className="w-14 h-14 rounded-full bg-destructive/15 border border-destructive/40 flex items-center justify-center"
                style={{ boxShadow: '0 0 20px rgba(220, 38, 38, 0.15)' }}
              >
                <Clock className="w-7 h-7 text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-orbitron text-base font-bold text-destructive mb-2 tracking-wide">
                  ACCESS LOCKED
                </p>
                <p className="font-rajdhani text-foreground/70 text-sm leading-relaxed mb-3">
                  Too many failed attempts. Please wait before trying again.
                </p>
                {lockoutSeconds > 0 && (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30"
                  >
                    <Clock className="w-4 h-4 text-destructive" />
                    <span className="font-orbitron text-destructive font-bold text-lg tracking-widest">
                      {formatTime(lockoutSeconds)}
                    </span>
                  </div>
                )}
              </div>
              <p className="font-rajdhani text-foreground/40 text-xs text-center">
                {lockoutMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
