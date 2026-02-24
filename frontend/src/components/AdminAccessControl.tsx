import React, { useState, useEffect, useRef } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, Shield, XCircle, LogIn } from 'lucide-react';
import ProfileSetupModal from './ProfileSetupModal';

interface AdminAccessControlProps {
  children: React.ReactNode;
}

type Status = 'loading' | 'granted' | 'denied' | 'unauthenticated' | 'no-username';

export default function AdminAccessControl({ children }: AdminAccessControlProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, login, loginStatus } = useInternetIdentity();

  const [status, setStatus] = useState<Status>('loading');

  // Track which principal we last ran the check for — prevents duplicate runs
  const checkedPrincipalRef = useRef<string | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const currentPrincipal = identity?.getPrincipal().toString() ?? null;

  useEffect(() => {
    // Case 1: Not authenticated and actor is not still initialising
    if (!actorFetching && !isAuthenticated) {
      checkedPrincipalRef.current = null;
      setStatus('unauthenticated');
      return;
    }

    // Case 2: Still waiting for actor to be ready
    if (actorFetching || !actor || !isAuthenticated || !currentPrincipal) {
      return;
    }

    // Case 3: Already ran the check for this exact principal — do nothing
    if (checkedPrincipalRef.current === currentPrincipal) {
      return;
    }

    // Mark this principal as being checked (prevents re-entry)
    checkedPrincipalRef.current = currentPrincipal;
    setStatus('loading');

    const checkAdmin = async () => {
      try {
        const principal = identity!.getPrincipal();

        // Step 1: Get the username for this principal
        const usernameResult = await actor.getUsernameByPrincipal(principal);

        if (!usernameResult) {
          // Authenticated but no username set yet
          setStatus('no-username');
          return;
        }

        // Step 2: Check if that username is in the admin whitelist
        const isAdmin = await actor.isAdminUsername(usernameResult);
        setStatus(isAdmin ? 'granted' : 'denied');
      } catch {
        setStatus('denied');
      }
    };

    checkAdmin();
  }, [actor, actorFetching, isAuthenticated, currentPrincipal, identity]);

  // When the user completes profile setup, re-run the admin check
  const handleProfileSetupComplete = () => {
    checkedPrincipalRef.current = null;
    setStatus('loading');
  };

  // ── Render: access granted ──────────────────────────────────────────────────
  if (status === 'granted') {
    return <>{children}</>;
  }

  // ── Render: profile setup needed ────────────────────────────────────────────
  if (status === 'no-username') {
    return <ProfileSetupModal onSuccess={handleProfileSetupComplete} />;
  }

  // ── Render: gate UI ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dusk-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dusk-bg via-dusk-mid to-dusk-bg opacity-80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
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

          {/* Loading state */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="w-8 h-8 text-sunset-orange animate-spin" />
              <p className="font-rajdhani text-foreground/70 text-center">
                Verifying access…
              </p>
            </div>
          )}

          {/* Unauthenticated — prompt to log in */}
          {status === 'unauthenticated' && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="text-center">
                <p className="font-rajdhani text-foreground/80 text-base leading-relaxed">
                  Please log in to access the Admin Panel.
                </p>
                <p className="font-rajdhani text-foreground/50 text-sm mt-1">
                  Your access will be verified automatically.
                </p>
              </div>
              <button
                onClick={login}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-sunset-orange to-sunset-gold text-dusk-bg font-orbitron font-bold tracking-wider text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
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

          {/* Denied state */}
          {status === 'denied' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <XCircle className="w-10 h-10 text-destructive" />
              <div className="text-center">
                <p className="font-orbitron text-lg font-bold text-destructive mb-1">
                  ACCESS DENIED
                </p>
                <p className="font-rajdhani text-foreground/60 text-sm">
                  Your account is not authorised to access the Admin Panel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
