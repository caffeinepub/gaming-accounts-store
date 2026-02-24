import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateUsername, useIsUsernameAvailable } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  onSuccess?: () => void;
}

export default function ProfileSetupModal({ onSuccess }: ProfileSetupModalProps) {
  const [username, setUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');

  const createUsername = useCreateUsername();
  const { data: isAvailable, isLoading: checkingAvailability } = useIsUsernameAvailable(debouncedUsername);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const hasSpaces = username.includes(' ');
  const isValid = username.trim().length >= 3 && !hasSpaces;
  const showAvailability = debouncedUsername.length >= 3 && !hasSpaces;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isAvailable === false) return;

    try {
      await createUsername.mutateAsync(username.trim());
      toast.success('Username created successfully!');
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to create username');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-card border border-border rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="font-orbitron text-2xl font-black brand-gradient-text mb-2">
            WELCOME TO GAME VAULT
          </h2>
          <p className="text-muted-foreground font-rajdhani text-sm">
            Choose your username to get started. This cannot be changed later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-rajdhani tracking-wide text-xs uppercase">
              Username
            </Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username (no spaces)"
                className="pr-10"
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {showAvailability && checkingAvailability && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {showAvailability && !checkingAvailability && isAvailable === true && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {showAvailability && !checkingAvailability && isAvailable === false && (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
            </div>

            {hasSpaces && (
              <p className="text-xs text-destructive font-rajdhani">Username cannot contain spaces</p>
            )}
            {showAvailability && !checkingAvailability && isAvailable === false && (
              <p className="text-xs text-destructive font-rajdhani">Username is already taken</p>
            )}
            {showAvailability && !checkingAvailability && isAvailable === true && (
              <p className="text-xs text-green-500 font-rajdhani">Username is available!</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full font-rajdhani tracking-wider"
            disabled={!isValid || isAvailable === false || createUsername.isPending}
          >
            {createUsername.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'CLAIM USERNAME'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
