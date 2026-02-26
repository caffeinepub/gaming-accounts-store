import React, { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { AdminSessionProvider, useAdminSession } from '../contexts/AdminSessionContext';
import { Loader2, Shield, LogIn, AlertTriangle, ShieldX } from 'lucide-react';

interface AdminAccessControlProps {
  children: React.ReactNode;
}

type Status = 'unauthenticated' | 'checking' | 'granted' | 'denied';

function AdminAccessControlInner({ children }: AdminAccessControlProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { adminVerified, setAdminVerified } = useAdminSession();

  const [status, setStatus] = useState<Status>('unauthenticated');
  const [errorMessage, setErrorMessage] = useState('');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // When authentication or actor state changes, check admin status
  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('unauthenticated');
      setErrorMessage('');
      setAdminVerified(false);
      return;
    }

    if (actorFetching || !actor) {
      setStatus('checking');
      return;
    }

    // Actor is ready and user is authenticated — check admin role
    setStatus('checking');
    setErrorMessage('');

    actor.isCallerAdmin()
      .then((isAdmin) => {
        if (isAdmin) {
          setAdminVerified(true);
          setStatus('granted');
        } else {
          setAdminVerified(false);
          setStatus('denied');
          setErrorMessage('Your account does not have admin privileges.');
        }
      })
      .catch((err: unknown) => {
        setAdminVerified(false);
        setStatus('denied');
        const msg = err instanceof Error ? err.message : 'Failed to verify admin status.';
        setErrorMessage(msg);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, actor, actorFetching]);

  // Keep adminVerified in sync if status changes back
  useEffect(() => {
    if (!isAuthenticated) {
      setAdminVerified(false);
    }
  }, [isAuthenticated, setAdminVerified]);

  // ── Render: access granted ──────────────────────────────────────────────────
  if (status === 'granted' && adminVerified) {
    return <>{children}</>;
  }

  // ── Checking (transitional state — show spinner) ────────────────────────────
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-dusk-bg flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-sunset-orange" />
          <p className="font-rajdhani text-foreground/70 text-sm tracking-wide">
            Verifying admin access…
          </p>
        </div>
      </div>
    );
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
              {status === 'denied' ? (
                <ShieldX className="w-8 h-8 text-destructive" />
              ) : (
                <Shield className="w-8 h-8 text-sunset-orange" />
              )}
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
                  Please log in to access the admin panel.
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

          {/* ── Access Denied ── */}
          {status === 'denied' && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 w-full">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="font-rajdhani text-destructive text-sm">
                  {errorMessage || 'Access denied. Admin privileges required.'}
                </p>
              </div>
              <p className="font-rajdhani text-foreground/60 text-sm text-center">
                Your account is not authorized to access the admin panel. Please contact an existing admin to grant you access.
              </p>
              <button
                onClick={() => {
                  setStatus('checking');
                  if (actor) {
                    actor.isCallerAdmin()
                      .then((isAdmin) => {
                        if (isAdmin) {
                          setAdminVerified(true);
                          setStatus('granted');
                        } else {
                          setAdminVerified(false);
                          setStatus('denied');
                          setErrorMessage('Your account does not have admin privileges.');
                        }
                      })
                      .catch(() => {
                        setStatus('denied');
                        setErrorMessage('Failed to verify admin status. Please try again.');
                      });
                  }
                }}
                disabled={!actor || actorFetching}
                className="flex items-center gap-2 px-6 py-2 rounded-lg border border-sunset-orange/30 text-sunset-orange font-rajdhani font-semibold text-sm hover:bg-sunset-orange/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminAccessControl({ children }: AdminAccessControlProps) {
  return (
    <AdminSessionProvider>
      <AdminAccessControlInner>{children}</AdminAccessControlInner>
    </AdminSessionProvider>
  );
}
