import React, { useState } from 'react';
import { Shield, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActor } from '../hooks/useActor';

type AccessStatus = 'idle' | 'checking' | 'granted' | 'denied';

interface AdminAccessControlProps {
  children: React.ReactNode;
}

export default function AdminAccessControl({ children }: AdminAccessControlProps) {
  const { actor, isFetching: actorFetching } = useActor();

  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<AccessStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !actor || actorFetching) return;

    setStatus('checking');
    setErrorMessage('');

    try {
      const isAdmin = await actor.isAdminUsername(username.trim());
      if (isAdmin) {
        setStatus('granted');
      } else {
        setStatus('denied');
        setErrorMessage(`"${username.trim()}" is not on the admin whitelist.`);
      }
    } catch {
      setStatus('denied');
      setErrorMessage('Could not verify username. Please try again.');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setUsername('');
    setErrorMessage('');
  };

  // ── Granted ────────────────────────────────────────────────────────────────
  if (status === 'granted') {
    return <>{children}</>;
  }

  // ── Access Denied ──────────────────────────────────────────────────────────
  if (status === 'denied') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-destructive/10 border border-destructive/30 shadow-[0_0_24px_rgba(239,68,68,0.15)]">
              <Shield className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <div>
            <h2 className="font-orbitron text-xl font-bold mb-2 text-foreground">Access Denied</h2>
            <p className="text-muted-foreground font-rajdhani text-sm leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full font-rajdhani tracking-wider border-sunset-gold/40 text-sunset-gold hover:bg-sunset-gold/10 hover:border-sunset-gold"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ── Username Entry Form (idle + checking) ──────────────────────────────────
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-sm w-full space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-sunset-gold/10 border border-sunset-gold/30 shadow-[0_0_32px_rgba(251,191,36,0.12)]">
            <KeyRound className="w-10 h-10 text-sunset-gold" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h2 className="font-orbitron text-xl font-bold mb-2 text-foreground tracking-wide">
            Admin Panel
          </h2>
          <p className="text-muted-foreground font-rajdhani text-sm leading-relaxed">
            Enter your admin username to access the panel.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="admin-username"
              className="block font-rajdhani text-sm font-semibold text-sunset-gold tracking-wider uppercase"
            >
              Username
            </label>
            <Input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={status === 'checking'}
              autoComplete="off"
              autoFocus
              className="
                bg-dusk-mid border-sunset-gold/30 text-foreground
                placeholder:text-muted-foreground/50
                focus:border-sunset-gold focus:ring-sunset-gold/20
                font-rajdhani tracking-wide
                disabled:opacity-50
              "
            />
          </div>

          <Button
            type="submit"
            disabled={!username.trim() || status === 'checking' || actorFetching}
            className="
              w-full font-orbitron tracking-widest text-sm
              bg-sunset-gold hover:bg-sunset-orange
              text-dusk-bg font-bold
              border-0
              shadow-[0_0_16px_rgba(251,191,36,0.25)]
              hover:shadow-[0_0_24px_rgba(251,191,36,0.4)]
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {status === 'checking' || actorFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'ENTER'
            )}
          </Button>
        </form>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 opacity-30">
          <div className="flex-1 h-px bg-sunset-gold/40" />
          <Shield className="w-3 h-3 text-sunset-gold" />
          <div className="flex-1 h-px bg-sunset-gold/40" />
        </div>

        <p className="text-center text-muted-foreground/50 font-rajdhani text-xs">
          Authorised personnel only
        </p>
      </div>
    </div>
  );
}
