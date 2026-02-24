import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdminUsername } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Principal } from '@dfinity/principal';

interface AdminAccessControlProps {
  children: React.ReactNode;
}

/**
 * Fetches the username for the currently authenticated principal using the
 * public (no-auth-required) `getUsernameByPrincipal` query.
 * This avoids any role-permission traps that can occur with `getCallerUserProfile`.
 */
function useAdminUsername(principalStr: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  const isEnabled = !!actor && !actorFetching && !!principalStr;

  const query = useQuery<string | null>({
    queryKey: ['usernameByPrincipal', principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return null;
      try {
        const principal = Principal.fromText(principalStr);
        return actor.getUsernameByPrincipal(principal);
      } catch {
        return null;
      }
    },
    enabled: isEnabled,
    staleTime: 60_000,
    retry: 1,
  });

  return {
    username: query.data ?? null,
    isLoading: actorFetching || (isEnabled && query.isLoading),
    isFetched: isEnabled ? query.isFetched : false,
    isError: query.isError,
  };
}

export default function AdminAccessControl({ children }: AdminAccessControlProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Get the principal string for the current user
  const principalStr = identity?.getPrincipal().toString();

  // Step 1: Fetch username via the public getUsernameByPrincipal query
  // This query has NO auth requirement so it can never trap due to missing roles
  const {
    username,
    isLoading: usernameLoading,
    isFetched: usernameFetched,
    isError: usernameError,
  } = useAdminUsername(principalStr);

  // Step 2: Only check admin status once we have a non-empty username string
  const safeUsername = username ?? '';
  const {
    data: isAdmin,
    isLoading: adminLoading,
    isFetched: adminFetched,
  } = useIsAdminUsername(safeUsername);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-sm w-full mx-4 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="font-orbitron text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground font-rajdhani text-sm">
              Please log in to access the admin panel.
            </p>
          </div>
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full font-rajdhani tracking-wider"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'LOGIN'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading username ───────────────────────────────────────────────────────
  // Wait until the username query has completed before making any access decision
  if (usernameLoading || !usernameFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-rajdhani">Verifying access...</p>
        </div>
      </div>
    );
  }

  // ── Username fetch error ───────────────────────────────────────────────────
  if (usernameError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-sm w-full mx-4 text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20 w-fit mx-auto">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="font-orbitron text-xl font-bold">Connection Error</h2>
          <p className="text-muted-foreground font-rajdhani text-sm">
            Could not verify your identity. Please try again.
          </p>
          <Button variant="outline" onClick={handleLogout} className="font-rajdhani">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // ── No username set ────────────────────────────────────────────────────────
  // Username fetch succeeded but returned null — user hasn't set a username yet
  if (!safeUsername) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-sm w-full mx-4 text-center space-y-4">
          <Shield className="w-10 h-10 text-muted-foreground mx-auto" />
          <h2 className="font-orbitron text-xl font-bold">Username Required</h2>
          <p className="text-muted-foreground font-rajdhani text-sm">
            You need to set up a username before accessing the admin panel.
            Please return to the store and complete your profile setup.
          </p>
          <Button variant="outline" onClick={handleLogout} className="font-rajdhani">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // ── Checking admin status ──────────────────────────────────────────────────
  // Username is non-empty, so useIsAdminUsername query is now enabled.
  // Show spinner only while the admin check is actively in-flight.
  if (adminLoading || !adminFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-rajdhani">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // ── Not an admin ───────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-sm w-full mx-4 text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20 w-fit mx-auto">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="font-orbitron text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground font-rajdhani text-sm">
            Your username <strong className="text-foreground">"{safeUsername}"</strong> is not on the
            admin whitelist.
          </p>
          <Button variant="outline" onClick={handleLogout} className="font-rajdhani">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // ── Authorised ─────────────────────────────────────────────────────────────
  return <>{children}</>;
}
