import React, { useState, useEffect, useRef } from 'react';
import { useActor } from '../hooks/useActor';
import { Loader2, Shield, AlertTriangle, XCircle } from 'lucide-react';

interface AdminAccessControlProps {
  children: React.ReactNode;
}

type Status = 'connecting' | 'timeout' | 'entry' | 'checking' | 'granted' | 'denied';

const CONNECT_TIMEOUT_MS = 10000;

export default function AdminAccessControl({ children }: AdminAccessControlProps) {
  const { actor, isFetching } = useActor();
  const [status, setStatus] = useState<Status>('connecting');
  const [username, setUsername] = useState('');
  const [checkError, setCheckError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerStartedRef = useRef(false);

  useEffect(() => {
    // Actor is ready — transition to entry form
    if (actor && !isFetching) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (status === 'connecting') {
        setStatus('entry');
      }
      return;
    }

    // Start the connection timeout once, while still connecting
    if (status === 'connecting' && !timerStartedRef.current) {
      timerStartedRef.current = true;
      timeoutRef.current = setTimeout(() => {
        setStatus((current) => {
          if (current === 'connecting') return 'timeout';
          return current;
        });
      }, CONNECT_TIMEOUT_MS);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [actor, isFetching, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !username.trim()) return;

    setCheckError(null);
    setStatus('checking');

    try {
      const isAdmin = await actor.isAdminUsername(username.trim());
      if (isAdmin) {
        setStatus('granted');
      } else {
        setStatus('denied');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setCheckError(message);
      setStatus('entry');
    }
  };

  const handleRetry = () => {
    setStatus('entry');
    setUsername('');
    setCheckError(null);
  };

  if (status === 'granted') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-dusk-bg flex items-center justify-center p-4">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dusk-bg via-dusk-mid to-dusk-bg opacity-80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-2xl border border-sunset-orange/30 bg-dusk-mid/80 backdrop-blur-sm p-8 shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(255, 107, 53, 0.15)' }}
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-sunset-orange/20 border border-sunset-orange/40 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-sunset-orange" />
            </div>
            <h1 className="font-orbitron text-2xl font-bold text-sunset-gold tracking-wider">
              ADMIN ACCESS
            </h1>
            <p className="font-rajdhani text-muted-foreground text-sm mt-1 tracking-wide">
              Game Vault Control Panel
            </p>
          </div>

          {/* Connecting state */}
          {status === 'connecting' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="w-8 h-8 text-sunset-orange animate-spin" />
              <p className="font-rajdhani text-foreground/70 text-center">
                Connecting to server…
              </p>
            </div>
          )}

          {/* Timeout / error state */}
          {status === 'timeout' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <p className="font-rajdhani text-foreground/80 text-center text-sm leading-relaxed">
                Unable to connect to the server. Please refresh the page and try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-6 py-2 rounded-lg bg-sunset-orange/20 border border-sunset-orange/40 text-sunset-orange font-rajdhani font-semibold hover:bg-sunset-orange/30 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          )}

          {/* Entry form */}
          {(status === 'entry' || status === 'checking') && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="admin-username"
                  className="font-rajdhani text-sm font-semibold text-foreground/80 tracking-wide uppercase"
                >
                  Enter your username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  disabled={status === 'checking'}
                  autoComplete="off"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-dusk-bg/60 border border-sunset-orange/30 text-foreground font-rajdhani placeholder:text-foreground/30 focus:outline-none focus:border-sunset-orange/70 focus:ring-1 focus:ring-sunset-orange/40 disabled:opacity-50 transition-colors"
                />
              </div>

              {checkError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <p className="font-rajdhani text-sm text-destructive">{checkError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'checking' || !username.trim()}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-sunset-orange to-sunset-gold text-dusk-bg font-orbitron font-bold tracking-wider text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {status === 'checking' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          )}

          {/* Denied state */}
          {status === 'denied' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <XCircle className="w-10 h-10 text-destructive" />
              <div className="text-center">
                <p className="font-orbitron text-lg font-bold text-destructive mb-1">
                  ACCESS DENIED
                </p>
                <p className="font-rajdhani text-foreground/60 text-sm">
                  Username <span className="text-foreground/80 font-semibold">"{username}"</span> is not authorised.
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="mt-2 px-6 py-2 rounded-lg bg-sunset-orange/20 border border-sunset-orange/40 text-sunset-orange font-rajdhani font-semibold hover:bg-sunset-orange/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
