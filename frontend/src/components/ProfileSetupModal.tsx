import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');

  const showModal = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success('Welcome to GameVault!', { description: `Profile created for ${name.trim()}` });
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={showModal}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: 'oklch(0.13 0.008 260)',
          border: '1px solid oklch(0.72 0.22 35 / 0.5)',
          boxShadow: '0 0 40px oklch(0.72 0.22 35 / 0.2)',
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'oklch(0.72 0.22 35 / 0.2)' }}
            >
              <Gamepad2 size={20} style={{ color: 'oklch(0.72 0.22 35)' }} />
            </div>
            <DialogTitle className="font-heading text-xl" style={{ color: 'oklch(0.95 0.01 260)' }}>
              Welcome to GameVault
            </DialogTitle>
          </div>
          <DialogDescription style={{ color: 'oklch(0.55 0.02 260)' }}>
            Set up your gamer profile to start buying premium gaming accounts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-heading font-semibold text-sm" style={{ color: 'oklch(0.75 0.02 260)' }}>
              Gamer Tag / Display Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your gamer tag..."
              className="font-heading"
              style={{
                background: 'oklch(0.18 0.01 260)',
                border: '1px solid oklch(0.3 0.015 260)',
                color: 'oklch(0.9 0.01 260)',
              }}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full py-3 rounded font-heading font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-40"
            style={{
              background: 'oklch(0.72 0.22 35)',
              color: 'oklch(0.08 0.005 260)',
              boxShadow: '0 0 20px oklch(0.72 0.22 35 / 0.4)',
            }}
          >
            {saveProfile.isPending ? 'Saving...' : 'Enter the Vault'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
