import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsAdminUsername } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

interface AdminAccessControlProps {
  children: React.ReactNode;
}

export default function AdminAccessControl({ children }: AdminAccessControlProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const username = userProfile?.username ?? '';

  const {
    data: isAdmin,
    isLoading: adminLoading,
    isFetched: adminFetched,
  } = useIsAdminUsername(username);

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

  // ── Loading profile ────────────────────────────────────────────────────────
  // Wait until we have fetched the profile before making any access decision
  if (profileLoading || !profileFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-rajdhani">Verifying access...</p>
        </div>
      </div>
    );
  }

  // ── No username set ────────────────────────────────────────────────────────
  if (!username) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-sm w-full mx-4 text-center space-y-4">
          <Shield className="w-10 h-10 text-muted-foreground mx-auto" />
          <h2 className="font-orbitron text-xl font-bold">Username Required</h2>
          <p className="text-muted-foreground font-rajdhani text-sm">
            You need to set up a username before accessing the admin panel.
          </p>
          <Button variant="outline" onClick={handleLogout} className="font-rajdhani">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // ── Checking admin status ──────────────────────────────────────────────────
  // Show spinner while the isAdminUsername query is in-flight
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
            Your username <strong className="text-foreground">"{username}"</strong> is not on the
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
